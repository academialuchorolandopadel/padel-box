import {
  addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { calcCargo, horasEntre, hoyISO } from "../constants";

/** Crea un turno común con los precios actuales de config. */
export const crearTurno = (boxId, config) =>
  addDoc(collection(db, "turnos"), {
    boxId, fecha: hoyISO(), horaInicio: "20:00", horaFin: "21:00", fijoId: null,
    canchaTotal: config.valorHora[boxId], canchaPartes: 1,
    tuboActivo: false, tuboPrecio: config.tuboPrecio, tuboPartes: 1, tuboGratis: false,
    creadoTs: Date.now(),
  });

/**
 * Actualiza un turno y recalcula los cargos de TODAS sus cuentas en un batch,
 * para que monto del turno y montos por persona nunca queden desincronizados.
 */
export const actualizarTurno = async (turno, patch, cuentasDelTurno, config) => {
  const t = { ...turno, ...patch };
  if (("horaInicio" in patch || "horaFin" in patch) && !t.fijoId)
    t.canchaTotal = Math.round(horasEntre(t.horaInicio, t.horaFin) * config.valorHora[t.boxId]);

  const batch = writeBatch(db);
  const { id, ...data } = t;
  batch.update(doc(db, "turnos", turno.id), data);
  cuentasDelTurno.forEach((c) =>
    batch.update(doc(db, "cuentas", c.id), {
      cargoCancha: calcCargo(c.canchaPartes, t.canchaTotal, t.canchaPartes),
      cargoTubo: calcCargo(c.tuboPartes, t.tuboActivo ? t.tuboPrecio : 0, t.tuboPartes),
    })
  );
  await batch.commit();
};

/** Reparte cancha o tubo en partes iguales entre las personas del turno. */
export const repartirParejo = async (turno, campo, cuentasDelTurno) => {
  const n = Math.max(1, cuentasDelTurno.length);
  const batch = writeBatch(db);
  if (campo === "cancha") {
    batch.update(doc(db, "turnos", turno.id), { canchaPartes: n });
    cuentasDelTurno.forEach((c) =>
      batch.update(doc(db, "cuentas", c.id), {
        canchaPartes: 1, cargoCancha: calcCargo(1, turno.canchaTotal, n),
      }));
  } else {
    batch.update(doc(db, "turnos", turno.id), { tuboPartes: n });
    cuentasDelTurno.forEach((c) =>
      batch.update(doc(db, "cuentas", c.id), {
        tuboPartes: 1, cargoTubo: calcCargo(1, turno.tuboActivo ? turno.tuboPrecio : 0, n),
      }));
  }
  await batch.commit();
};

/** Borra el turno junto con sus cuentas (solo usar si no hay nada cobrado). */
/** Borra el turno junto con TODAS sus cuentas. Consulta Firestore en el momento
 *  (no depende de lo que la pantalla tenga cargado), así nunca quedan cuentas
 *  huérfanas aunque se borre el turno apenas creado. */
export const borrarTurno = async (turnoId) => {
  const snap = await getDocs(query(collection(db, "cuentas"), where("turnoId", "==", turnoId)));
  const batch = writeBatch(db);
  batch.delete(doc(db, "turnos", turnoId));
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

export const tocarTurno = (turnoId, patch) => updateDoc(doc(db, "turnos", turnoId), patch);
export const eliminarTurnoSolo = (turnoId) => deleteDoc(doc(db, "turnos", turnoId));
