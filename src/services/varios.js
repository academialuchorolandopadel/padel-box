import {
  addDoc, collection, deleteDoc, doc, increment, setDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { hoyISO } from "../constants";

/* ---- gastos ---- */
export const crearGasto = (g) =>
  addDoc(collection(db, "gastos"), { ...g, fecha: hoyISO() });
export const borrarGasto = (id) => deleteDoc(doc(db, "gastos", id));

/* ---- stock ---- */
export const reponerStock = (productoId, cantidad) =>
  updateDoc(doc(db, "productos", productoId), { stockActual: increment(cantidad) });

// Crear / editar / borrar productos
export const crearProducto = (p) =>
  addDoc(collection(db, "productos"), {
    nombre: p.nombre, precio: Number(p.precio) || 0, categoria: p.categoria || "Bebida",
    stockActual: Number(p.stockActual) || 0, stockMinimo: Number(p.stockMinimo) || 0,
    descuentaId: p.descuentaId || null,
    descuentaCant: p.descuentaId ? (Number(p.descuentaCant) || 1) : null,
  });

export const actualizarProducto = (id, patch) => {
  const limpio = { ...patch };
  if ("precio" in limpio) limpio.precio = Number(limpio.precio) || 0;
  if ("stockActual" in limpio) limpio.stockActual = Number(limpio.stockActual) || 0;
  if ("stockMinimo" in limpio) limpio.stockMinimo = Number(limpio.stockMinimo) || 0;
  return updateDoc(doc(db, "productos", id), limpio);
};

export const borrarProducto = (id) => deleteDoc(doc(db, "productos", id));

/* ---- config de precios ---- */
export const guardarConfig = (config) =>
  setDoc(doc(db, "config", "precios"), config, { merge: true });
