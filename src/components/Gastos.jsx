import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { S } from "../styles";
import { GASTO_CATS, GS, PAGOS, mesISO } from "../constants";

export default function Gastos({ gastos, onAgregar, onBorrar, esAdmin }) {
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("Mercadería");
  const [imp, setImp] = useState("");
  const [fp, setFp] = useState("EFECTIVO");
  const lista = [...gastos].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const totalMes = gastos.filter((g) => g.fecha?.startsWith(mesISO())).reduce((s, g) => s + g.importe, 0);
  const agregar = () => {
    if (!desc.trim() || !imp) return;
    onAgregar({ descripcion: desc.trim(), categoria: cat, importe: Number(imp), formaPago: fp });
    setDesc(""); setImp("");
  };
  return (
    <div>
      <h2 style={S.h2}>Gastos <span style={{ fontSize: 14, color: "#8b93a0", fontWeight: 600, marginLeft: 8 }}>{GS(totalMes)} este mes</span></h2>
      <div style={S.gastoForm}>
        <input placeholder="¿En qué se gastó?" value={desc} onChange={(e) => setDesc(e.target.value)} style={{ ...S.fieldInput, flex: 1, minWidth: 160 }} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={S.select}>{GASTO_CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <input placeholder="Cuánto" type="number" value={imp} onChange={(e) => setImp(e.target.value)} style={{ ...S.fieldInput, width: 130 }} />
        <select value={fp} onChange={(e) => setFp(e.target.value)} style={S.select}>{Object.entries(PAGOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        <button style={S.primaryBtn} onClick={agregar}><Plus size={17} /> Anotar</button>
      </div>
      <div style={S.table}>
        {lista.map((g) => (
          <div key={g.id} style={S.trow}>
            <span style={{ width: 52, color: "#8b93a0", fontSize: 13, flexShrink: 0 }}>{g.fecha?.slice(5).split("-").reverse().join("/")}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{g.descripcion}<span style={{ color: "#7a808a", fontWeight: 400, fontSize: 13 }} className="hide-sm"> · {g.categoria}</span></span>
            <span style={{ width: 115, textAlign: "right", fontWeight: 700, color: "#f0a45b" }}>{GS(g.importe)}</span>
            <span style={{ width: 30, textAlign: "right" }}>
              {esAdmin && <button style={S.delBtn} onClick={() => confirm("¿Borrar gasto?") && onBorrar(g.id)}><Trash2 size={15} /></button>}
            </span>
          </div>
        ))}
        {lista.length === 0 && <div style={S.emptyBox}>Sin gastos anotados este mes.</div>}
      </div>
    </div>
  );
}
