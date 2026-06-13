import React, { useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { S } from "../styles";
import { GS } from "../constants";

export default function Stock({ productos, onReponer }) {
  const [q, setQ] = useState("");
  const lista = productos
    .filter((p) => p.nombre.toLowerCase().includes(q.toLowerCase()) && p.categoria !== "Servicio")
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const bajos = lista.filter((p) => p.stockActual <= p.stockMinimo);
  return (
    <div>
      <h2 style={S.h2}>Stock</h2>
      {bajos.length > 0 && (
        <div style={S.alertBar}><AlertTriangle size={17} /> Hay que reponer: <b>{bajos.map((p) => p.nombre).join(", ")}</b></div>
      )}
      <div style={{ ...S.searchBar, maxWidth: 380, marginBottom: 16 }}>
        <Search size={16} color="#7a808a" />
        <input placeholder="Buscar producto…" value={q} onChange={(e) => setQ(e.target.value)} style={S.searchInput} />
      </div>
      <div style={S.table}>
        <div style={{ ...S.trow, ...S.thead }}>
          <span style={{ flex: 1 }}>Producto</span>
          <span style={{ width: 90, textAlign: "right" }} className="hide-sm">Precio</span>
          <span style={{ width: 90, textAlign: "center" }}>Quedan</span>
          <span style={{ width: 130, textAlign: "right" }}>Llegó mercadería</span>
        </div>
        {lista.map((p) => {
          const bajo = p.stockActual <= p.stockMinimo;
          return (
            <div key={p.id} style={S.trow}>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>
                {p.nombre}
                {bajo && <span style={{ ...S.pendBadge, color: "#f0a45b", borderColor: "#f0a45b55", background: "#2b1f12" }}>reponer</span>}
              </span>
              <span style={{ width: 90, textAlign: "right", color: "#8b93a0" }} className="hide-sm">{GS(p.precio)}</span>
              <span style={{ width: 90, textAlign: "center", fontWeight: 800, fontSize: 16, color: bajo ? "#f0a45b" : "#5fe0a1" }}>{p.stockActual}</span>
              <span style={{ width: 130, textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button style={S.repBtn} onClick={() => onReponer(p.id, 6)}>+6</button>
                <button style={S.repBtn} onClick={() => onReponer(p.id, 12)}>+12</button>
              </span>
            </div>
          );
        })}
        {lista.length === 0 && <div style={S.emptyBox}>Sin productos. El admin los carga con el script de inicio o desde Firestore.</div>}
      </div>
    </div>
  );
}
