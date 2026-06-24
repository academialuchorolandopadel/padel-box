import React from "react";
import { Check, Clock, Gift, Minus, Plus, Repeat, RotateCcw, StickyNote, Trash2 } from "lucide-react";
import { S } from "../styles";
import { BOXES, GS, PAGOS, horasEntre, perPart, sumarMinutos, textoDuracion, totalCuenta } from "../constants";
import { Stepper } from "./ui";

export default function Canchas(props) {
  const { activeBox, setActiveBox, config, turnos, cuentas, onNuevoTurno, onPickFijo } = props;
  const boxTurnos = turnos.filter((t) => t.boxId === activeBox)
    .sort((a, b) => (a.horaInicio || "").localeCompare(b.horaInicio || ""));

  return (
    <div>
      <div style={S.boxTabs}>
        {BOXES.map((b) => {
          const abiertas = cuentas.filter((x) => x.boxId === b.id && x.estado === "abierta").length;
          const on = b.id === activeBox;
          return (
            <button key={b.id} onClick={() => setActiveBox(b.id)} style={{ ...S.boxTab, ...(on ? S.boxTabOn : {}) }}>
              {b.nombre}
              {abiertas > 0 && <span style={S.boxTabCount} title="cuentas sin cobrar">{abiertas}</span>}
            </button>
          );
        })}
      </div>

      <div style={S.boxBar}>
        <div style={S.boxBarRate}>Hora de cancha: <b style={{ color: "#5fe0a1" }}>{GS(config.valorHora[activeBox])}</b></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.fijoBtn} onClick={onPickFijo}><Repeat size={16} /> Usar turno fijo</button>
          <button style={S.primaryBtn} onClick={() => onNuevoTurno(activeBox)}><Plus size={18} /> Nuevo turno</button>
        </div>
      </div>

      {boxTurnos.length === 0 && (
        <div style={S.emptyBox}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🎾</div>
          No hay turnos en {BOXES.find((b) => b.id === activeBox)?.nombre}.<br />
          Tocá <b style={{ color: "#5fe0a1" }}>Nuevo turno</b> cuando llegue un grupo a jugar.
        </div>
      )}
      {boxTurnos.map((t) => <TurnoCard key={t.id} turno={t} {...props} />)}
    </div>
  );
}

function TurnoCard({ turno, cuentas, fijos, onUpdTurno, onBorrarTurno, onRepartir, onSetPartes, onEdit, onNueva, onReabrir, onBorrarCuenta, onEntregarObsequio }) {
  const lista = cuentas.filter((c) => c.turnoId === turno.id);
  const horas = horasEntre(turno.horaInicio, turno.horaFin);
  const jugadores = lista.length;
  const totalTurno = lista.reduce((s, c) => s + totalCuenta(c), 0);
  const pendiente = lista.filter((c) => c.estado === "abierta").reduce((s, c) => s + totalCuenta(c), 0);
  const esFijo = !!turno.fijoId;
  const fijo = esFijo ? fijos.find((f) => f.id === turno.fijoId) : null;
  const canchaAsig = lista.reduce((s, c) => s + (c.canchaPartes || 0), 0);
  const tuboAsig = lista.reduce((s, c) => s + (c.tuboPartes || 0), 0);
  const canchaOk = canchaAsig === turno.canchaPartes;
  const tuboOk = tuboAsig === turno.tuboPartes;

  return (
    <div style={{ ...S.turnoCard, ...(esFijo ? S.turnoCardFijo : {}) }}>
      <div style={{ ...S.turnoHead, ...(esFijo ? S.turnoHeadFijo : {}) }}>
        <div style={S.turnoHeadL}>
          <Clock size={16} color="#5fe0a1" />
          <div style={S.horaCtl}>
            <span style={S.horaLbl}>Empieza</span>
            <button style={S.horaBtn} onClick={() => onUpdTurno(turno, { horaInicio: sumarMinutos(turno.horaInicio, -30), horaFin: sumarMinutos(turno.horaFin, -30) }, lista)}><Minus size={14} /></button>
            <span style={S.horaVal}>{turno.horaInicio}</span>
            <button style={S.horaBtn} onClick={() => onUpdTurno(turno, { horaInicio: sumarMinutos(turno.horaInicio, 30), horaFin: sumarMinutos(turno.horaFin, 30) }, lista)}><Plus size={14} /></button>
          </div>
          <div style={S.horaCtl}>
            <span style={S.horaLbl}>Dura</span>
            <button style={S.horaBtn} onClick={() => { const nf = sumarMinutos(turno.horaInicio, Math.max(30, Math.round(horas * 60) - 30)); onUpdTurno(turno, { horaFin: nf }, lista); }}><Minus size={14} /></button>
            <span style={S.horaVal}>{textoDuracion(horas)}</span>
            <button style={S.horaBtn} onClick={() => { const nf = sumarMinutos(turno.horaInicio, Math.round(horas * 60) + 30); onUpdTurno(turno, { horaFin: nf }, lista); }}><Plus size={14} /></button>
          </div>
          {esFijo && <span style={S.tagFijo}><Repeat size={12} /> Fijo · {fijo?.clienteNombre || "—"}</span>}
        </div>
        <div style={S.turnoHeadR}>
          {jugadores > 0 && (pendiente === 0
            ? <span style={S.tagOk}><Check size={13} /> Todo cobrado</span>
            : <span style={S.tagDebe}>Falta cobrar {GS(pendiente)}</span>)}
          <button style={S.iconBtnSm} title="Borrar turno" onClick={() => {
            if (lista.some((c) => c.estado === "cerrada")) { alert("Este turno tiene cobros hechos. Reabrí o borrá las cuentas primero."); return; }
            if (confirm("¿Borrar este turno y sus cuentas?")) onBorrarTurno(turno.id);
          }}><Trash2 size={16} /></button>
        </div>
      </div>

      <div style={S.splitPanel}>
        <div style={S.splitRow}>
          <span style={S.splitLabel}>Cancha</span>
          {esFijo ? (
            <span style={S.splitPrepago}>✓ Ya está paga (turno fijo)</span>
          ) : (
            <>
              <input type="number" value={turno.canchaTotal} onChange={(e) => onUpdTurno(turno, { canchaTotal: Number(e.target.value) }, lista)} style={S.montoInput} />
              <span style={S.splitWord}>entre</span>
              <Stepper value={turno.canchaPartes} onDelta={(d) => onUpdTurno(turno, { canchaPartes: Math.max(1, turno.canchaPartes + d) }, lista)} />
              <span style={S.splitPer}>{GS(perPart(turno.canchaTotal, turno.canchaPartes))} c/u</span>
              <span style={{ ...S.coverTag, ...(canchaOk ? S.coverOk : S.coverFalta) }}>
                {canchaOk ? "✓ repartida" : `falta asignar ${turno.canchaPartes - canchaAsig}`}
              </span>
            </>
          )}
        </div>
        <div style={S.splitRow}>
          <span style={S.splitLabel}>Tubo</span>
          <button style={{ ...S.toggle, ...(turno.tuboActivo ? S.toggleOn : {}) }} onClick={() => onUpdTurno(turno, { tuboActivo: !turno.tuboActivo }, lista)}>
            {turno.tuboActivo ? "Con tubo" : "Sin tubo"}
          </button>
          {turno.tuboActivo && (turno.tuboGratis ? (
            <span style={S.splitPrepago}>🎁 De regalo (turno fijo)</span>
          ) : (
            <>
              <input type="number" value={turno.tuboPrecio} onChange={(e) => onUpdTurno(turno, { tuboPrecio: Number(e.target.value) }, lista)} style={S.montoInput} />
              <span style={S.splitWord}>entre</span>
              <Stepper value={turno.tuboPartes} onDelta={(d) => onUpdTurno(turno, { tuboPartes: Math.max(1, turno.tuboPartes + d) }, lista)} />
              <span style={S.splitPer}>{GS(perPart(turno.tuboPrecio, turno.tuboPartes))} c/u</span>
              <span style={{ ...S.coverTag, ...(tuboOk ? S.coverOk : S.coverFalta) }}>
                {tuboOk ? "✓ repartido" : `falta asignar ${turno.tuboPartes - tuboAsig}`}
              </span>
            </>
          ))}
        </div>
      </div>

      {(turno.obsequios || []).length > 0 && (
        <div style={S.obsequiosBar}>
          <span style={S.obsequiosLbl}><Gift size={15} color="#e8a13c" /> Obsequios del paquete — tocá al entregar:</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {turno.obsequios.map((o) => (
              <button key={o.productoId} style={S.obsequioChip} onClick={() => onEntregarObsequio(turno, o.productoId)}>
                {o.cantidad}× {o.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {lista.length === 0 ? (
        <div style={S.turnoEmpty}>Todavía no cargaste a nadie. Tocá <b style={{ color: "#5fe0a1" }}>+ Agregar persona</b>.</div>
      ) : (
        lista.map((c) => {
          const abierta = c.estado === "abierta";
          const pg = c.formaPago ? PAGOS[c.formaPago] : null;
          return (
            <div key={c.id} style={S.cRow}>
              <button style={S.cName} onClick={() => onEdit(c)}>
                <span style={{ ...S.dot, background: abierta ? "#f2b659" : "#3fbf81" }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.clienteNombre || <em style={{ color: "#6a707a" }}>Sin nombre</em>}
                </span>
                {c.notas ? <StickyNote size={13} style={{ color: "#e8a13c", flexShrink: 0 }} /> : null}
              </button>
              <div style={S.partsCell}>
                <span style={S.partsTag}>Cancha</span>
                <Stepper small value={c.canchaPartes || 0} onDelta={(d) => onSetPartes(c, "cancha", d, turno)} />
                {turno.tuboActivo && !turno.tuboGratis && <>
                  <span style={S.partsTag}>Tubo</span>
                  <Stepper small value={c.tuboPartes || 0} onDelta={(d) => onSetPartes(c, "tubo", d, turno)} />
                </>}
              </div>
              {abierta ? (
                <button style={S.cobrarBtn} onClick={() => onEdit(c)}>
                  Debe {GS(totalCuenta(c))} · Cobrar
                </button>
              ) : (
                <span style={{ ...S.pagadoTag, color: pg.color, borderColor: pg.color + "66" }}>
                  <Check size={13} /> Pagó {GS(totalCuenta(c))} · {pg.label}
                </span>
              )}
              <span style={{ width: 32, textAlign: "right", flexShrink: 0 }}>
                {abierta
                  ? <button style={S.delBtn} title="Quitar" onClick={() => confirm("¿Quitar a esta persona del turno?") && onBorrarCuenta(c.id)}><Trash2 size={15} /></button>
                  : <button style={S.delBtn} title="Reabrir cuenta" onClick={() => onReabrir(c.id)}><RotateCcw size={15} /></button>}
              </span>
            </div>
          );
        })
      )}

      <div style={S.turnoFoot}>
        <button style={S.addPersona} onClick={() => onNueva(turno)}><Plus size={17} /> Agregar persona</button>
        {lista.length > 0 && <span style={{ marginLeft: "auto", fontSize: 15 }}>Total turno: <b>{GS(totalTurno)}</b></span>}
      </div>
    </div>
  );
}
