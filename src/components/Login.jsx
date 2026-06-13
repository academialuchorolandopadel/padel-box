import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { S, css } from "../styles";

export default function Login({ usuarioSinRol }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e) => {
    e?.preventDefault?.();
    setError(""); setEnviando(true);
    try { await signInWithEmailAndPassword(auth, email.trim(), pass); }
    catch { setError("Email o contraseña incorrectos."); }
    setEnviando(false);
  };

  return (
    <div style={{ ...S.app, display: "grid", placeItems: "center", paddingBottom: 0 }}>
      <style>{css}</style>
      <div style={S.loginBox}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={S.logo}>PB</div>
          <div>
            <div style={S.brandName}>Padel Box</div>
            <div style={S.brandSub}>Sistema del club</div>
          </div>
        </div>
        {usuarioSinRol ? (
          <>
            <p style={{ color: "#c4c9d0", lineHeight: 1.6, margin: 0 }}>
              Tu usuario existe pero todavía no está habilitado.
              Pedile al administrador que te agregue en <b>usuarios</b> con tu rol.
            </p>
            <button style={S.saveOpen} onClick={() => signOut(auth)}>Salir</button>
          </>
        ) : (
          <>
            <input style={S.fieldInput} type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            <input style={S.fieldInput} type="password" placeholder="Contraseña" value={pass}
              onChange={(e) => setPass(e.target.value)} autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && entrar(e)} />
            {error && <div style={S.loginErr}>{error}</div>}
            <button style={{ ...S.confirmBtn, flex: "none" }} disabled={enviando} onClick={entrar}>
              {enviando ? "Entrando…" : "Entrar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
