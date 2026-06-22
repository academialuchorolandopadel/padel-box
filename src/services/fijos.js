import {
  addDoc, collection, deleteDoc, doc, getDoc, updateDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { hoyISO, sumarMinutos } from "../constants";

/* Crea un paquete de turno fijo.
   Modelo:
   { clienteId, clienteNombre, boxId, diaSemana, horaInicio,
     horasTotal, horasRestante, horasPorSesion,
     obsequios: [{ productoId, nombre, cantidad }],
     precioPaquete, estado: 'activo'|'completado', creado } */
export const crearFijo = (fijo) =>
  addDoc(collection(db, "fijos"), { ...fijo, estado: "activo", creado: hoyISO() });

export const actualizarFijo = (id, patch) => updateDoc(doc(db, "fijos", id), patch);

export const borrarFijo = (id) => deleteDoc(doc(db, "fijos", id));

/* Renueva el paquete: vuelve a llenar las horas y deja el estado activo.
   Los obsequios NO se acumulan: el nuevo mes arranca limpio (se entregan
   con el próximo "Vino hoy"). */
export const renovarFijo = (fijo) =>
  updateDoc(doc(db, "fijos", fijo.id), {
    horasRestante: fijo.horasTotal,
    estado: "activo",
    renovado: hoyISO(),
  });

/* Registra que el cliente vino HOY con su turno fijo.
   - horasSesion: horas reales que va a jugar esta vez (editable antes de abrir)
   - abre el turno en su horario fijo (cancha prepaga = 0)
   - descuenta esas horas del paquete; si llega a 0 lo marca "completado"
   - carga los obsequios del paquete como PENDIENTES del cliente (para retirar)
   Todo en un solo batch para que no queden datos a medias. */
export const usarFijo = async (fijo, horasSesion) => {
  const horas = Number(horasSesion) || fijo.horasPorSesion || 1;
  const horaInicio = fijo.horaInicio || "20:00";
  const horaFin = sumarMinutos(horaInicio, Math.round(horas * 60));
  const restante = Math.max(0, (fijo.horasRestante ?? fijo.horasTotal) - horas);

  const batch = writeBatch(db);

  // obsequios del paquete -> se guardan DENTRO del turno (no en el cliente),
  // con cuánto falta entregar de cada uno. El cajero los entrega desde el turno.
  const obsequios = (fijo.obsequios || [])
    .filter((o) => o.cantidad > 0)
    .map((o) => ({ productoId: o.productoId, nombre: o.nombre, cantidad: Number(o.cantidad) }));

  // 1) turno prepago en el horario fijo, con sus obsequios
  const turnoRef = doc(collection(db, "turnos"));
  batch.set(turnoRef, {
    boxId: fijo.boxId, fecha: hoyISO(), horaInicio, horaFin,
    fijoId: fijo.id, canchaTotal: 0, canchaPartes: 1,
    tuboActivo: false, tuboPrecio: 0, tuboPartes: 1, tuboGratis: false,
    obsequios,
    creadoTs: Date.now(),
  });

  // 2) descuento de horas (+ completado si llega a 0)
  batch.update(doc(db, "fijos", fijo.id), {
    horasRestante: restante,
    ...(restante <= 0 ? { estado: "completado" } : {}),
  });

  await batch.commit();
};

/* Entrega UN obsequio del turno: baja en 1 lo que falta entregar y descuenta
   1 unidad del stock del producto. Todo junto para no descuadrar. */
export const entregarObsequio = async (turno, productoId) => {
  const obsequios = (turno.obsequios || [])
    .map((o) => (o.productoId === productoId ? { ...o, cantidad: o.cantidad - 1 } : o))
    .filter((o) => o.cantidad > 0);

  const batch = writeBatch(db);
  batch.update(doc(db, "turnos", turno.id), { obsequios });

  const pSnap = await getDoc(doc(db, "productos", productoId));
  if (pSnap.exists()) {
    const p = pSnap.data();
    // si el obsequio es una promo, descuenta del producto base; si no, de sí mismo
    if (p.descuentaId && p.descuentaCant) {
      const bSnap = await getDoc(doc(db, "productos", p.descuentaId));
      if (bSnap.exists())
        batch.update(doc(db, "productos", p.descuentaId), { stockActual: (bSnap.data().stockActual ?? 0) - p.descuentaCant });
    } else if (p.categoria !== "Servicio") {
      batch.update(doc(db, "productos", productoId), { stockActual: (p.stockActual ?? 0) - 1 });
    }
  }
  await batch.commit();
};
