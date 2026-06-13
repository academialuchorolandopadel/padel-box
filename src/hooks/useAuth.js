import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

/**
 * Devuelve { user, perfil, cargando }.
 * perfil = doc de /usuarios/{uid} → { nombre, rol: 'cajero' | 'admin' }
 * Si user existe pero perfil es null, el empleado no está habilitado todavía.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let offPerfil = null;
    const offAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (offPerfil) { offPerfil(); offPerfil = null; }
      if (!u) { setPerfil(null); setCargando(false); return; }
      offPerfil = onSnapshot(
        doc(db, "usuarios", u.uid),
        (snap) => { setPerfil(snap.exists() ? snap.data() : null); setCargando(false); },
        () => { setPerfil(null); setCargando(false); }
      );
    });
    return () => { offAuth(); if (offPerfil) offPerfil(); };
  }, []);

  return { user, perfil, cargando };
}
