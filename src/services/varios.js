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

/* ---- config de precios ---- */
export const guardarConfig = (config) =>
  setDoc(doc(db, "config", "precios"), config, { merge: true });
