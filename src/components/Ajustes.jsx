import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { S } from "../styles";
import { BOXES } from "../constants";
import { guardarConfig } from "../services/varios";

export default function Ajustes({ config, onClose, esAdmin }) {
  const [vh, setVh] = useState({ ...config.valorHora });
  const [tubo, setTubo] = useState(config.tuboPrecio);
  const guardar = async () => {
    await guardarConfig({
      valorHora: { box1: Number(vh.box1), box2: Number(vh.box2), box3: Number(vh.box3) },
      tuboPrecio: Number(tubo),
    });
    onClose();
  };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: "min(440px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Precios</div>
          <button style={S.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {!esAdmin && <p style={{ color: "#f0a45b", fontSize: 13.5, margin: 0 }}>Solo el administrador puede cambiar los precios.</p>}
          <div style={S.cdLabel}>La hora de cancha cuesta</div>
          {BOXES.map((b) => (
            <div key={b.id} style={{ ...S.formRow, alignItems: "center" }}>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{b.nombre}</span>
              <input style={{ ...S.fieldInput, width: 150 }} type="number" disabled={!esAdmin}
                value={vh[b.id]} onChange={(e) => setVh({ ...vh, [b.id]: e.target.value })} />
            </div>
          ))}
          <div style={{ ...S.cdLabel, marginTop: 8 }}>El tubo de pelotas cuesta</div>
          <input style={{ ...S.fieldInput, width: 150 }} type="number" disabled={!esAdmin}
            value={tubo} onChange={(e) => setTubo(e.target.value)} />
          {esAdmin && (
            <button style={{ ...S.confirmBtn, width: "100%", flex: "none", marginTop: 8 }} onClick={guardar}>
              <Check size={18} /> Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
