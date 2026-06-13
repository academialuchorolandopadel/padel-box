import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CONFIG_INICIAL, PRODUCTOS_INICIALES } from "../data/iniciales";

/**
 * Carga inicial desde la app (reemplaza al script de terminal).
 * Solo el admin puede ejecutarla (las reglas de Firestore lo exigen).
 * Es segura de tocar dos veces: no duplica productos ya existentes.
 * Devuelve cuántos productos creó.
 */
export const cargarDatosIniciales = async () => {
  const batch = writeBatch(db);

  // 1) Precios (no pisa si ya hay cambios hechos por el admin: merge)
  batch.set(doc(db, "config", "precios"), CONFIG_INICIAL, { merge: true });

  // 2) Productos, sin duplicar por nombre
  const existentes = await getDocs(collection(db, "productos"));
  const nombres = new Set(existentes.docs.map((d) => d.data().nombre));
  let nuevos = 0;
  for (const p of PRODUCTOS_INICIALES) {
    if (nombres.has(p.nombre)) continue;
    batch.set(doc(collection(db, "productos")), p);
    nuevos++;
  }

  await batch.commit();
  return nuevos;
};
