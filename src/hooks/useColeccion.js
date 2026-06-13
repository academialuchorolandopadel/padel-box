import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Suscripción en vivo a una colección de Firestore.
 * @param {string} nombre        nombre de la colección
 * @param {Array}  restricciones array de where()/orderBy() (opcional)
 * @param {Array}  deps          dependencias que reinician la suscripción
 */
export function useColeccion(nombre, restricciones = [], deps = []) {
  const [docs, setDocs] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, nombre), ...restricciones);
    const off = onSnapshot(
      q,
      (snap) => {
        setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCargando(false);
      },
      (err) => { console.error(`[${nombre}]`, err); setCargando(false); }
    );
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, ...deps]);

  return { docs, cargando };
}
