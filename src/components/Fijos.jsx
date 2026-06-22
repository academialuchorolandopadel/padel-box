import React, { useState } from "react";
import { Calendar, Check, ChevronRight, Clock, DoorOpen, Gift, Minus, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { S } from "../styles";
import { BOXES, DIAS, GS, sumarMinutos, textoDuracion } from "../constants";
import { Stepper } from "./ui";

const TAMANOS = [8, 12, 16];

export default function Fijos({ fijos, clientes, productos, onAgregar, onBorrar, onUsar, onRenovar, onActualizar }) {
  const [form, setForm] = useState(false);     // crear nuevo
  const [editar, setEditar] = useState(null);  // paquete a editar
  const [usar, setUsar] = useState(null);       // paquete para "vino hoy"

  return (
    <div>
      <div style={S.pageHead}>
        <h2 style={S.h2}>Turnos fijos</h2>
        <button style={S.primaryBtn} onClick={() => setForm(true)}><Plus size={17} /> Nuevo paquete</button>
      </div>
      <p style={S.pageHint}>El cliente paga un paquete de horas por mes. Cada vez que viene, tocá <b>“Vino hoy”</b>, ajustá las horas que jugó y se descuentan solas.</p>
      {fijos.length === 0 && <div style={S.emptyBox}>Sin turnos fijos cargados todavía.</div>}
      <div style={S.fijoGrid}>
        {fijos.map((f) => {
          const total = f.horasTotal || 0;
          const restante = f.horasRestante ?? total;
          const pct = total > 0 ? (restante / total) * 100 : 0;
          const completado = f.estado === "completado" || restante <= 0;
          return (
            <div key={f.id} style={{ ...S.fijoCard, ...(completado ? { borderColor: "#5b8def55" } : {}) }}>
              <div style={S.fijoTop}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{f.clienteNombre}</div>
                  <div style={S.fijoSub}>
                    <Calendar size={13} style={{ verticalAlign: -2 }} /> {f.diaSemana} {f.horaInicio} · {BOXES.find((b) => b.id === f.boxId)?.nombre}
                  </div>
                </div>
                <button style={S.delBtn} title="Editar" onClick={() => setEditar(f)}><Calendar size={16} /></button>
              </div>

              {completado ? (
                <div style={{ ...S.fijoPaquete, justifyContent: "center", padding: "6px 0" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#9bb8f5" }}>✓ Paquete completado</span>
                </div>
              ) : (
                <>
                  <div style={S.fijoPaquete}>
                    <span style={{ fontSize: 14, color: "#8b93a0" }}>Le quedan</span>
                    <span style={{ fontWeight: 800, fontSize: 22 }}>{restante}<span style={{ color: "#7a808a", fontWeight: 600, fontSize: 14 }}> de {total} h</span></span>
                  </div>
                  <div style={S.fijoBar}><div style={{ ...S.fijoBarFill, width: pct + "%", background: pct <= 25 ? "#f0a45b" : "#3fbf81" }} /></div>
                </>
              )}

              <div style={S.fijoMeta}>
                <span>{GS(f.precioPaquete)}/mes · {f.horasPorSesion} h por sesión</span>
              </div>
              {(f.obsequios || []).length > 0 && (
                <div style={{ ...S.fijoBenef, marginTop: 6, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <Gift size={13} /> {f.obsequios.map((o) => `${o.cantidad}× ${o.nombre}`).join(" · ")}
                </div>
              )}

              {completado ? (
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button style={{ ...S.confirmBtn, flex: 1 }} onClick={() => onRenovar(f)}><RefreshCw size={16} /> Renovar mes</button>
                  <button style={{ ...S.saveOpen, flex: "none", paddingLeft: 14, paddingRight: 14, color: "#f0a45b", borderColor: "#f0a45b55" }} onClick={() => confirm(`¿Dar de baja el paquete de ${f.clienteNombre}?`) && onBorrar(f.id)}><Trash2 size={16} /></button>
                </div>
              ) : (
                <button style={{ ...S.confirmBtn, flex: "none", width: "100%", marginTop: 14 }} onClick={() => setUsar(f)}>
                  <DoorOpen size={17} /> Vino hoy — abrir turno
                </button>
              )}
            </div>
          );
        })}
      </div>

      {form && <FijoForm clientes={clientes} productos={productos} onClose={() => setForm(false)}
        onGuardar={(f) => { onAgregar(f); setForm(false); }} />}
      {editar && <FijoForm clientes={clientes} productos={productos} inicial={editar} onClose={() => setEditar(null)}
        onGuardar={(f) => { onActualizar(editar.id, f); setEditar(null); }}
        onBorrar={() => { if (confirm("¿Dar de baja este paquete?")) { onBorrar(editar.id); setEditar(null); } }} />}
      {usar && <UsarFijoModal fijo={usar} onClose={() => setUsar(null)}
        onConfirmar={(horas) => { onUsar(usar, horas); setUsar(null); }} />}
    </div>
  );
}

/* Modal "Vino hoy": muestra el horario fijo y deja ajustar las horas de la sesión */
function UsarFijoModal({ fijo, onClose, onConfirmar }) {
  const [horas, setHoras] = useState(fijo.horasPorSesion || 1);
  const restante = fijo.horasRestante ?? fijo.horasTotal;
  const horaFin = sumarMinutos(fijo.horaInicio || "20:00", Math.round(horas * 60));
  const seExcede = horas > restante;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: "min(440px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div>
            <div style={S.modalSub}>{fijo.clienteNombre} · {BOXES.find((b) => b.id === fijo.boxId)?.nombre}</div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>¿Cuántas horas jugó hoy?</div>
          </div>
          <button style={S.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <Clock size={18} color="#5fe0a1" />
            <span style={{ fontSize: 15, color: "#c4c9d0" }}>Empieza {fijo.horaInicio} · termina {horaFin}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <button style={S.horaBtn} onClick={() => setHoras((h) => Math.max(0.5, h - 0.5))}><Minus size={18} /></button>
            <span style={{ fontWeight: 800, fontSize: 26, minWidth: 120, textAlign: "center" }}>{textoDuracion(horas)}</span>
            <button style={S.horaBtn} onClick={() => setHoras((h) => h + 0.5)}><Plus size={18} /></button>
          </div>
          <div style={{ textAlign: "center", fontSize: 14, color: seExcede ? "#f0a45b" : "#8b93a0" }}>
            {seExcede
              ? `Ojo: le quedan ${restante} h en el paquete`
              : `Le quedan ${restante} h · después de hoy quedarían ${Math.max(0, restante - horas)} h`}
          </div>
          <button style={{ ...S.confirmBtn, width: "100%", flex: "none" }} onClick={() => onConfirmar(horas)}>
            <DoorOpen size={18} /> Abrir turno y descontar {textoDuracion(horas)}
          </button>
        </div>
      </div>
    </div>
  );
}

function FijoForm({ clientes, productos, inicial, onClose, onGuardar, onBorrar }) {
  const esEdicion = !!inicial;
  const [clienteNombre, setClienteNombre] = useState(inicial?.clienteNombre || "");
  const [clienteId, setClienteId] = useState(inicial?.clienteId || null);
  const [boxId, setBoxId] = useState(inicial?.boxId || "box1");
  const [horasTotal, setHorasTotal] = useState(inicial?.horasTotal || 8);
  const [horasPorSesion, setHorasPorSesion] = useState(inicial?.horasPorSesion || 2);
  const [diaSemana, setDiaSemana] = useState(inicial?.diaSemana || "Jueves");
  const [horaInicio, setHoraInicio] = useState(inicial?.horaInicio || "19:00");
  const [precioPaquete, setPrecioPaquete] = useState(inicial?.precioPaquete || 600000);
  const [obsequios, setObsequios] = useState(inicial?.obsequios || []);
  const [show, setShow] = useState(false);

  const matches = clienteNombre
    ? clientes.filter((c) => c.nombre.toLowerCase().includes(clienteNombre.toLowerCase())).slice(0, 5)
    : clientes.slice(0, 5);

  const addObsequio = () => {
    const prod = productos[0];
    if (!prod) { alert("Primero cargá productos en Stock."); return; }
    setObsequios((o) => [...o, { productoId: prod.id, nombre: prod.nombre, cantidad: 1 }]);
  };
  const setObsProd = (i, productoId) => {
    const prod = productos.find((p) => p.id === productoId);
    setObsequios((o) => o.map((x, idx) => idx === i ? { ...x, productoId, nombre: prod?.nombre || x.nombre } : x));
  };
  const setObsCant = (i, delta) =>
    setObsequios((o) => o.map((x, idx) => idx === i ? { ...x, cantidad: Math.max(1, x.cantidad + delta) } : x));
  const quitarObs = (i) => setObsequios((o) => o.filter((_, idx) => idx !== i));

  const guardar = () => {
    if (!clienteNombre.trim()) { alert("Elegí o escribí el cliente."); return; }
    const data = {
      clienteId, clienteNombre: clienteNombre.trim(), boxId,
      diaSemana, horaInicio,
      horasTotal: Number(horasTotal),
      horasRestante: esEdicion ? (inicial.horasRestante ?? Number(horasTotal)) : Number(horasTotal),
      horasPorSesion: Number(horasPorSesion),
      precioPaquete: Number(precioPaquete),
      obsequios: obsequios.map((o) => ({ productoId: o.productoId, nombre: o.nombre, cantidad: Number(o.cantidad) })),
    };
    onGuardar(data);
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: "min(560px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>{esEdicion ? "Editar paquete" : "Nuevo turno fijo"}</div>
          <button style={S.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>
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

          <div>
            <label style={S.flabel}>Tamaño del paquete (horas por mes)</label>
            <div style={{ display: "flex", gap: 8 }}>
              {TAMANOS.map((t) => (
                <button key={t} onClick={() => setHorasTotal(t)}
                  style={{ ...S.toggle, flex: 1, ...(horasTotal === t ? S.toggleOn : {}) }}>
                  {t} horas
                </button>
              ))}
            </div>
          </div>

          <div style={S.formRow}>
            <div style={{ flex: 1 }}>
              <label style={S.flabel}>Hora de inicio</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button style={S.horaBtn} onClick={() => setHoraInicio((h) => sumarMinutos(h, -30))}><Minus size={16} /></button>
                <span style={{ ...S.horaVal, flex: 1 }}>{horaInicio}</span>
                <button style={S.horaBtn} onClick={() => setHoraInicio((h) => sumarMinutos(h, 30))}><Plus size={16} /></button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.flabel}>Horas por sesión</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button style={S.horaBtn} onClick={() => setHorasPorSesion((h) => Math.max(0.5, h - 0.5))}><Minus size={16} /></button>
                <span style={{ ...S.horaVal, flex: 1 }}>{textoDuracion(horasPorSesion)}</span>
                <button style={S.horaBtn} onClick={() => setHorasPorSesion((h) => h + 0.5)}><Plus size={16} /></button>
              </div>
            </div>
          </div>

          <div>
            <label style={S.flabel}>Precio del paquete (por mes)</label>
            <input style={S.fieldInput} type="number" value={precioPaquete} onChange={(e) => setPrecioPaquete(e.target.value)} />
          </div>

          <div>
            <label style={S.flabel}>Obsequios del mes (se entregan como pendientes)</label>
            {obsequios.length === 0 && <div style={{ color: "#6a707a", fontSize: 13.5, marginBottom: 8 }}>Sin obsequios. Agregá si el paquete incluye algo de regalo.</div>}
            {obsequios.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <select style={{ ...S.select, flex: 1 }} value={o.productoId} onChange={(e) => setObsProd(i, e.target.value)}>
                  {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <Stepper small value={o.cantidad} onDelta={(d) => setObsCant(i, d)} />
                <button style={S.delBtn} onClick={() => quitarObs(i)}><Trash2 size={15} /></button>
              </div>
            ))}
            <button style={{ ...S.fijoBtn, marginTop: 2 }} onClick={addObsequio}><Plus size={16} /> Agregar obsequio</button>
          </div>

          <button style={{ ...S.confirmBtn, width: "100%", flex: "none", marginTop: 6 }} onClick={guardar}>
            <Check size={18} /> {esEdicion ? "Guardar cambios" : "Crear paquete"}
          </button>
          {esEdicion && onBorrar && (
            <button style={{ ...S.saveOpen, width: "100%", color: "#f0a45b", borderColor: "#f0a45b55", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={onBorrar}>
              <Trash2 size={16} /> Dar de baja el paquete
            </button>
          )}
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
          {fijos.length === 0 && <div style={S.empty}>No hay paquetes con horas disponibles.</div>}
          {fijos.map((f) => {
            const restante = f.horasRestante ?? f.horasTotal;
            return (
              <button key={f.id} style={S.fijoPick} onClick={() => onUsar(f)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{f.clienteNombre}</div>
                  <div style={S.fijoSub}>{f.diaSemana} {f.horaInicio} · {BOXES.find((b) => b.id === f.boxId)?.nombre} · le quedan {restante} h</div>
                </div>
                <ChevronRight size={18} color="#7a808a" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
