import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Gift, Phone, Plus, Search, StickyNote, TrendingUp, X } from "lucide-react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { S } from "../styles";
import { GS, anioISO, mesISO, totalCuenta } from "../constants";
import { Stepper } from "./ui";

export default function Clientes({ clientes, onVer }) {
  const [q, setQ] = useState("");
  const lista = clientes
    .filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  return (
    <div>
      <h2 style={S.h2}>Clientes</h2>
      <div style={{ ...S.searchBar, maxWidth: 380, marginBottom: 16 }}>
        <Search size={16} color="#7a808a" />
        <input placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} style={S.searchInput} />
      </div>
      <div style={S.table}>
        {lista.map((c) => (
          <button key={c.id} style={{ ...S.trow, width: "100%", background: "none", border: "none", borderBottom: "1px solid #191f29", color: "inherit", cursor: "pointer", textAlign: "left" }} onClick={() => onVer(c.id)}>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>
              {c.nombre}
              {c.pendientes?.length > 0 && <span style={S.pendBadge}>{c.pendientes.reduce((s, p) => s + p.cantidad, 0)} para retirar</span>}
              {c.notas && <StickyNote size={13} style={{ marginLeft: 6, verticalAlign: -2, color: "#e8a13c" }} />}
            </span>
            <span style={{ width: 140, color: "#8b93a0", fontSize: 13.5 }} className="hide-sm">{c.telefono || "—"}</span>
            <span style={{ width: 26, textAlign: "right" }}><ChevronRight size={17} color="#5a606b" /></span>
          </button>
        ))}
        {lista.length === 0 && <div style={S.emptyBox}>Sin clientes todavía. Se crean solos al cargar una cuenta con un nombre nuevo.</div>}
      </div>
    </div>
  );
}

export function ClienteDetalle({ cliente, onUpd, onClose }) {
  const [notas, setNotas] = useState(cliente.notas || "");
  const [telefono, setTelefono] = useState(cliente.telefono || "");
  const [nuevoPend, setNuevoPend] = useState("");
  const [historial, setHistorial] = useState([]);
  const [cargandoHist, setCargandoHist] = useState(true);

  // Consulta puntual del historial (no suscripción: se lee una vez al abrir la ficha)
  useEffect(() => {
    (async () => {
      try {
        const qy = query(
          collection(db, "cuentas"),
          where("clienteId", "==", cliente.id),
          where("estado", "==", "cerrada"),
          orderBy("fecha", "desc"),
          limit(100)
        );
        const snap = await getDocs(qy);
        setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setCargandoHist(false);
    })();
  }, [cliente.id]);

  const mes = historial.filter((x) => x.fecha?.startsWith(mesISO())).reduce((s, x) => s + totalCuenta(x), 0);
  const anio = historial.filter((x) => x.fecha?.startsWith(anioISO())).reduce((s, x) => s + totalCuenta(x), 0);
  const topProd = useMemo(() => {
    const m = {};
    historial.forEach((c) => (c.items || []).forEach((i) => (m[i.nombre] = (m[i.nombre] || 0) + i.cantidad)));
    return Object.entries(m).map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c).slice(0, 5);
  }, [historial]);

  const guardar = () => onUpd(cliente.id, { notas, telefono });
  const addPend = () => {
    if (!nuevoPend.trim()) return;
    onUpd(cliente.id, { pendientes: [...(cliente.pendientes || []), { id: crypto.randomUUID(), descripcion: nuevoPend.trim(), cantidad: 1 }] });
    setNuevoPend("");
  };
  const updPend = (id, d) => {
    const np = (cliente.pendientes || []).map((p) => (p.id === id ? { ...p, cantidad: p.cantidad + d } : p)).filter((p) => p.cantidad > 0);
    onUpd(cliente.id, { pendientes: np });
  };

  return (
    <div style={S.overlay} onClick={() => { guardar(); onClose(); }}>
      <div style={{ ...S.modal, width: "min(720px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div>
            <div style={S.modalSub}>Cliente desde {cliente.creado ? new Date(cliente.creado).toLocaleDateString("es-PY") : "—"}</div>
            <div style={{ fontSize: 21, fontWeight: 800 }}>{cliente.nombre}</div>
          </div>
          <button style={S.iconBtn} onClick={() => { guardar(); onClose(); }}><X size={20} /></button>
        </div>
        <div style={{ padding: 18, overflowY: "auto" }}>
          <div style={S.cdKpis}>
            <div style={S.cdKpi}><div style={S.kpiLabel}>Gastó este mes</div><div style={S.kpiMid}>{GS(mes)}</div></div>
            <div style={S.cdKpi}><div style={S.kpiLabel}>Gastó en {anioISO()}</div><div style={{ ...S.kpiMid, color: "#5fe0a1" }}>{GS(anio)}</div></div>
            <div style={S.cdKpi}><div style={S.kpiLabel}>Veces que vino</div><div style={S.kpiMid}>{historial.length}</div></div>
          </div>
          <div style={S.cdGrid} className="cdGrid">
            <div>
              <div style={S.cdLabel}><Phone size={14} /> Teléfono</div>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="—" style={S.fieldInput} />
              <div style={{ ...S.cdLabel, marginTop: 16 }}><StickyNote size={14} /> Notas</div>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} placeholder="Preferencias, observaciones…" style={{ ...S.fieldInput, resize: "vertical" }} />
              <div style={{ ...S.cdLabel, marginTop: 16 }}><Gift size={14} /> Tiene pagado para retirar</div>
              {(cliente.pendientes || []).length === 0 && <div style={{ color: "#5a606b", fontSize: 14 }}>Nada pendiente</div>}
              {(cliente.pendientes || []).map((p) => (
                <div key={p.id} style={S.pendRow}>
                  <span style={{ flex: 1 }}>{p.descripcion}</span>
                  <Stepper small value={p.cantidad} onDelta={(d) => updPend(p.id, d)} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input value={nuevoPend} onChange={(e) => setNuevoPend(e.target.value)} placeholder="Ej: Munich promo" style={{ ...S.fieldInput, flex: 1 }} />
                <button style={S.addPendBtn} onClick={addPend}><Plus size={16} /></button>
              </div>
            </div>
            <div>
              <div style={S.cdLabel}><TrendingUp size={14} /> Lo que más pide</div>
              {topProd.length === 0 && <div style={{ color: "#5a606b", fontSize: 14 }}>Sin consumos todavía</div>}
              {topProd.map((p) => <div key={p.n} style={S.prodRow}><span style={{ flex: 1 }}>{p.n}</span><span style={S.prodCant}>{p.c}</span></div>)}
              <div style={{ ...S.cdLabel, marginTop: 16 }}>Historial de visitas</div>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {cargandoHist && <div style={S.empty}>Cargando…</div>}
                {historial.map((c) => (
                  <div key={c.id} style={S.histRow}>
                    <span style={{ color: "#8b93a0", fontSize: 13, width: 50, flexShrink: 0 }}>{c.fecha?.slice(5).split("-").reverse().join("/")}</span>
                    <span style={{ flex: 1, fontSize: 13.5, color: "#c4c9d0" }}>{(c.items || []).map((i) => `${i.cantidad}× ${i.nombre}`).join(", ") || "solo cancha"}</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{GS(totalCuenta(c))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
