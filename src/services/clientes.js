import {
  addDoc, collection, doc, getDocs, query, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { hoyISO } from "../constants";

export const crearCliente = async (nombre) => {
  const data = { nombre, telefono: "", notas: "", pendientes: [], creado: hoyISO() };
  const ref = await addDoc(collection(db, "clientes"), data);
  return { id: ref.id, ...data };
};

/**
 * Actualiza el cliente. Si cambió el nombre, también lo corrige en las cuentas
 * ABIERTAS de ese cliente (para que una cuenta en curso no muestre el apodo viejo).
 * Las cuentas ya cobradas quedan tal cual, como registro histórico.
 */
export const actualizarCliente = async (id, patch) => {
  await updateDoc(doc(db, "clientes", id), patch);

  if (patch.nombre) {
    const qy = query(
      collection(db, "cuentas"),
      where("clienteId", "==", id),
      where("estado", "==", "abierta")
    );
    const snap = await getDocs(qy);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { clienteNombre: patch.nombre }));
      await batch.commit();
    }
  }
};
