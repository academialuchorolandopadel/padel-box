import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

const DEFAULT = { valorHora: { box1: 80000, box2: 100000, box3: 100000 }, tuboPrecio: 80000 };

export function useConfig() {
  const [config, setConfig] = useState(DEFAULT);
  useEffect(() =>
    onSnapshot(doc(db, "config", "precios"), (snap) => {
      if (snap.exists()) setConfig({ ...DEFAULT, ...snap.data() });
    }), []);
  return config;
}
