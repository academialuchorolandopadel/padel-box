import { addDoc, collection, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { hoyISO, mesISO } from "../constants";

export const crearFijo = (fijo) =>
  addDoc(collection(db, "fijos"), { ...fijo, creado: hoyISO() });

export const borrarFijo = (id) => deleteDoc(doc(db, "fijos", id));

/**
 * Registra que el cliente usó su turno fijo HOY:
 * crea el turno prepago (cancha en 0) y descuenta el paquete en un solo batch.
 * Si corresponde el beneficio (ej. tubo mensual aún no entregado), lo activa gratis.
 */
export const usarFijo = async (fijo) => {
  const mes = mesISO();
  const aplicaBeneficio =
    fijo.beneficio?.tipo && fijo.beneficio.tipo !== "ninguno" &&
    (fijo.beneficio.frecuencia === "porTurno" ||
      (fijo.beneficio.frecuencia === "mensual" && fijo.beneficioMes !== mes));

  const conTubo = aplicaBeneficio && fijo.beneficio.tipo === "tubo";

  const batch = writeBatch(db);
  const turnoRef = doc(collection(db, "turnos"));
  batch.set(turnoRef, {
    boxId: fijo.boxId, fecha: hoyISO(), horaInicio: "20:00", horaFin: "21:00",
    fijoId: fijo.id, canchaTotal: 0, canchaPartes: 1,
    tuboActivo: conTubo, tuboPrecio: 0, tuboPartes: 1, tuboGratis: conTubo,
    creadoTs: Date.now(),
  });
  batch.update(doc(db, "fijos", fijo.id), {
    restante: Math.max(0, fijo.restante - 1),
    ...(aplicaBeneficio && fijo.beneficio.frecuencia === "mensual" ? { beneficioMes: mes } : {}),
  });
  await batch.commit();
};
