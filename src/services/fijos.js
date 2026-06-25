import {
  addDoc, collection, doc, getDoc, updateDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { hoyISO, sumarMinutos } from "../constants";

/* Paquete de turno fijo.
   { clienteId, clienteNombre, boxId, diaSemana, horaInicio,
     horasTotal, horasRestante, horasPorSesion,
     obsequios:        [{ productoId, nombre, cantidad }]  // la "receta" del mes (fija)
     obsequiosRestante:[{ productoId, nombre, cantidad }]  // saldo que se va entregando
     precioPaquete, estado:'activo'|'completado', creado } */

const copiaObsequios = (obs) =>
  (obs || []).filter((o) => o.cantidad > 0)
    .map((o) => ({ productoId: o.productoId, nombre: o.nombre, cantidad: Number(o.cantidad) }));

export const crearFijo = (fijo) =>
  addDoc(collection(db, "fijos"), {
    ...fijo,
    obsequiosRestante: copiaObsequios(fijo.obsequios), // arranca el mes con todo el saldo
    estado: "activo",
    creado: hoyISO(),
  });

/* Al editar: si cambió la receta de obsequios, se respeta el saldo restante
   que el admin haya fijado; si no se toca, queda el que estaba. */
export const actualizarFijo = (id, patch) => updateDoc(doc(db, "fijos", id), patch);

export const borrarFijo = async (id) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, "fijos", String(id)));
  await batch.commit();
};

/* Renueva el mes: rellena horas y vuelve a cargar el saldo de obsequios desde la receta. */
export const renovarFijo = (fijo) =>
  updateDoc(doc(db, "fijos", fijo.id), {
    horasRestante: fijo.horasTotal,
    obsequiosRestante: copiaObsequios(fijo.obsequios),
    estado: "activo",
    renovado: hoyISO(),
  });

/* "Vino hoy": abre el turno fijo (cancha prepaga = 0) y descuenta las horas.
   Los obsequios NO se copian al turno: el turno solo se marca como fijo y lee
   el saldo mensual del paquete (obsequiosRestante). */
export const usarFijo = async (fijo, horasSesion) => {
  const horas = Number(horasSesion) || fijo.horasPorSesion || 1;
  const horaInicio = fijo.horaInicio || "20:00";
  const horaFin = sumarMinutos(horaInicio, Math.round(horas * 60));
  const restante = Math.max(0, (fijo.horasRestante ?? fijo.horasTotal) - horas);

  const batch = writeBatch(db);

  const turnoRef = doc(collection(db, "turnos"));
  batch.set(turnoRef, {
    boxId: fijo.boxId, fecha: hoyISO(), horaInicio, horaFin,
    fijoId: fijo.id, canchaTotal: 0, canchaPartes: 1,
    tuboActivo: false, tuboPrecio: 0, tuboPartes: 1, tuboGratis: false,
    creadoTs: Date.now(),
  });

  batch.update(doc(db, "fijos", fijo.id), {
    horasRestante: restante,
    ...(restante <= 0 ? { estado: "completado" } : {}),
  });

  await batch.commit();
};

/* Entrega UN obsequio: descuenta 1 del saldo mensual del paquete (obsequiosRestante)
   y 1 del stock del producto (o del base, si es promo). */
export const entregarObsequio = async (fijoId, productoId) => {
  const fijoSnap = await getDoc(doc(db, "fijos", fijoId));
  if (!fijoSnap.exists()) return;
  const fijo = fijoSnap.data();

  const restante = (fijo.obsequiosRestante || [])
    .map((o) => (o.productoId === productoId ? { ...o, cantidad: o.cantidad - 1 } : o))
    .filter((o) => o.cantidad > 0);

  const batch = writeBatch(db);
  batch.update(doc(db, "fijos", fijoId), { obsequiosRestante: restante });

  const pSnap = await getDoc(doc(db, "productos", productoId));
  if (pSnap.exists()) {
    const p = pSnap.data();
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
