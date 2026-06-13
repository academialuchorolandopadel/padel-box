import React, { useState } from "react";
import { Calendar, Check, ChevronRight, DoorOpen, Gift, Plus, Trash2, X } from "lucide-react";
import { S } from "../styles";
import { BOXES, DIAS, GS } from "../constants";

export default function Fijos({ fijos, clientes, onAgregar, onBorrar, onUsar }) {
  const [form, setForm] = useState(false);
  return (
    <div>
      <div style={S.pageHead}>
        <h2 style={S.h2}>Turnos fijos</h2>
        <button style={S.primaryBtn} onClick={() => setForm(true)}><Plus size={17} /> Nuevo paquete</button>
      </div>
      <p style={S.pageHint}>El cliente paga un paquete por mes. Cada vez que viene, tocá <b>“Vino hoy”</b> y se descuenta solo.</p>
      {fijos.length === 0 && <div style={S.emptyBox}>Sin turnos fijos cargados todavía.</div>}
      <div style={S.fijoGrid}>
        {fijos.map((f) => {
          const pct = f.contratado > 0 ? (f.restante / f.contratado) * 100 : 0;
          return (
            <div key={f.id} style={S.fijoCard}>
              <div style={S.fijoTop}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{f.clienteNombre}</div>
                  <div style={S.fijoSub}><Calendar size={13} style={{ verticalAlign: -2 }} /> {f.diaSemana} · {BOXES.find((b) => b.id === f.boxId)?.nombre}</div>
                </div>
                <button style={S.delBtn} onClick={() => confirm("¿Borrar este paquete?") && onBorrar(f.id)}><Trash2 size={16} /></button>
              </div>
              <div style={S.fijoPaquete}>
                <span style={{ fontSize: 14, color: "#8b93a0" }}>Le quedan</span>
                <span style={{ fontWeight: 800, fontSize: 22 }}>{f.restante}<span style={{ color: "#7a808a", fontWeight: 600, fontSize: 14 }}> de {f.contratado} {f.unidad}</span></span>
              </div>
              <div style={S.fijoBar}><div style={{ ...S.fijoBarFill, width: pct + "%", background: pct <= 25 ? "#f0a45b" : "#3fbf81" }} /></div>
              <div style={S.fijoMeta}>
                <span>{GS(f.precioPaquete)}/mes</span>
                {f.beneficio?.tipo !== "ninguno" && <span style={S.fijoBenef}><Gift size={13} style={{ verticalAlign: -2 }} /> {f.beneficio.descripcion} ({f.beneficio.frecuencia === "mensual" ? "1 por mes" : "cada turno"})</span>}
              </div>
              <button style={{ ...S.confirmBtn, flex: "none", width: "100%", marginTop: 14 }} disabled={f.restante <= 0} onClick={() => onUsar(f)}>
                <DoorOpen size={17} /> Vino hoy — abrir turno
              </button>
            </div>
          );
        })}
      </div>
      {form && <FijoForm clientes={clientes} onClose={() => setForm(false)} onAgregar={(f) => { onAgregar(f); setForm(false); }} />}
    </div>
  );
}

function FijoForm({ clientes, onClose, onAgregar }) {
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteId, setClienteId] = useState(null);
  const [boxId, setBoxId] = useState("box1");
  const [unidad, setUnidad] = useState("turnos");
  const [contratado, setContratado] = useState(4);
  const [diaSemana, setDiaSemana] = useState("Jueves");
  const [precioPaquete, setPrecioPaquete] = useState(600000);
  const [benefTipo, setBenefTipo] = useState("ninguno");
  const [benefDesc, setBenefDesc] = useState("Tubo de pelotas");
  const [benefFrec, setBenefFrec] = useState("mensual");
  const [show, setShow] = useState(false);
  const matches = clienteNombre
    ? clientes.filter((c) => c.nombre.toLowerCase().includes(clienteNombre.toLowerCase())).slice(0, 5)
    : clientes.slice(0, 5);

  const guardar = () => {
    if (!clienteNombre.trim()) return;
    onAgregar({
      clienteId, clienteNombre: clienteNombre.trim(), boxId, unidad,
      contratado: Number(contratado), restante: Number(contratado),
      diaSemana, precioPaquete: Number(precioPaquete),
      beneficio: { tipo: benefTipo, descripcion: benefTipo === "ninguno" ? "" : benefDesc, frecuencia: benefFrec, cantidad: 1 },
      beneficioMes: null,
    });
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: "min(560px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}><div style={{ fontSize: 19, fontWeight: 800 }}>Nuevo turno fijo</div><button style={S.iconBtn} onClick={onClose}><X size={20} /></button></div>
        <div style={{ padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <label style={S.flabel}>Cliente</label>
            <input style={S.fieldInput} placeholder="Buscar o escribir…" value={clienteNombre}
              onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 150)}
              onChange={(e) => { setClienteNombre(e.target.value); setClienteId(null); }} />
            {show && matches.length > 0 && (
              <div style={{ ...S.cliDrop, right: 0 }}>
                {matches.map((c) => <button key={c.id} style={S.cliOpt} onMouseDown={() => { setClienteNombre(c.nombre); setClienteId(c.id); setShow(false); }}>{c.nombre}</button>)}
              </div>
            )}
          </div>
          <div style={S.formRow}>
            <div style={{ flex: 1 }}><label style={S.flabel}>Cancha</label>
              <select style={S.select} value={boxId} onChange={(e) => setBoxId(e.target.value)}>{BOXES.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}</select></div>
            <div style={{ flex: 1 }}><label style={S.flabel}>Día que viene</label>
              <select style={S.select} value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)}>{DIAS.map((d) => <option key={d}>{d}</option>)}</select></div>
          </div>
          <div style={S.formRow}>
            <div style={{ flex: 1 }}><label style={S.flabel}>El paquete se mide en</label>
              <select style={S.select} value={unidad} onChange={(e) => setUnidad(e.target.value)}><option value="turnos">Turnos</option><option value="horas">Horas</option></select></div>
            <div style={{ flex: 1 }}><label style={S.flabel}>Cantidad por mes</label>
              <input style={S.fieldInput} type="number" value={contratado} onChange={(e) => setContratado(e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={S.flabel}>Precio del paquete</label>
              <input style={S.fieldInput} type="number" value={precioPaquete} onChange={(e) => setPrecioPaquete(e.target.value)} /></div>
          </div>
          <div>
            <label style={S.flabel}>¿Incluye regalo?</label>
            <div style={S.formRow}>
              <select style={S.select} value={benefTipo} onChange={(e) => setBenefTipo(e.target.value)}><option value="ninguno">No incluye</option><option value="tubo">Tubo de pelotas</option><option value="otro">Otro</option></select>
              {benefTipo !== "ninguno" && <>
                {benefTipo === "otro" && <input style={{ ...S.fieldInput, flex: 1 }} value={benefDesc} onChange={(e) => setBenefDesc(e.target.value)} placeholder="¿Qué incluye?" />}
                <select style={S.select} value={benefFrec} onChange={(e) => setBenefFrec(e.target.value)}><option value="mensual">1 vez por mes</option><option value="porTurno">En cada turno</option></select>
              </>}
            </div>
          </div>
          <button style={{ ...S.confirmBtn, width: "100%", flex: "none", marginTop: 6 }} onClick={guardar}><Check size={18} /> Crear paquete</button>
        </div>
      </div>
    </div>
  );
}

export function PickFijo({ fijos, onUsar, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: "min(480px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}><div style={{ fontSize: 19, fontWeight: 800 }}>¿Quién vino con turno fijo?</div><button style={S.iconBtn} onClick={onClose}><X size={20} /></button></div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {fijos.length === 0 && <div style={S.empty}>No hay paquetes con saldo.</div>}
          {fijos.map((f) => (
            <button key={f.id} style={S.fijoPick} onClick={() => onUsar(f)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.clienteNombre}</div>
                <div style={S.fijoSub}>{f.diaSemana} · {BOXES.find((b) => b.id === f.boxId)?.nombre} · le quedan {f.restante} {f.unidad}</div>
              </div>
              <ChevronRight size={18} color="#7a808a" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
