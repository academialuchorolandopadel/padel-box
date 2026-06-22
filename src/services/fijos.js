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

  // 1) turno prepago en el horario fijo
  const turnoRef = doc(collection(db, "turnos"));
  batch.set(turnoRef, {
    boxId: fijo.boxId, fecha: hoyISO(), horaInicio, horaFin,
    fijoId: fijo.id, canchaTotal: 0, canchaPartes: 1,
    tuboActivo: false, tuboPrecio: 0, tuboPartes: 1, tuboGratis: false,
    creadoTs: Date.now(),
  });

  // 2) descuento de horas (+ completado si llega a 0)
  batch.update(doc(db, "fijos", fijo.id), {
    horasRestante: restante,
    ...(restante <= 0 ? { estado: "completado" } : {}),
  });

  // 3) obsequios -> pendientes del cliente (si tiene clienteId y hay obsequios)
  const obs = (fijo.obsequios || []).filter((o) => o.cantidad > 0);
  if (fijo.clienteId && obs.length > 0) {
    const cliSnap = await getDoc(doc(db, "clientes", fijo.clienteId));
    if (cliSnap.exists()) {
      const previos = cliSnap.data().pendientes || [];
      const nuevos = obs.map((o) => ({
        id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        descripcion: o.nombre,
        cantidad: o.cantidad,
        deFijo: true,
      }));
      batch.update(doc(db, "clientes", fijo.clienteId), { pendientes: [...previos, ...nuevos] });
    }
  }

  await batch.commit();
};
