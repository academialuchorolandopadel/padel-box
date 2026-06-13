import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { hoyISO } from "../constants";

export const crearCliente = async (nombre) => {
  const data = { nombre, telefono: "", notas: "", pendientes: [], creado: hoyISO() };
  const ref = await addDoc(collection(db, "clientes"), data);
  return { id: ref.id, ...data };
};

export const actualizarCliente = (id, patch) =>
  updateDoc(doc(db, "clientes", id), patch);
