import React, { useMemo } from "react";
import { S } from "../styles";
import { BOXES, GS, PAGOS, totalCuenta } from "../constants";

export default function Caja({ cerradasHoy, abiertas, gastosHoy, onEdit }) {
  const porPago = useMemo(() => {
    const m = {}; Object.keys(PAGOS).forEach((k) => (m[k] = 0));
    cerradasHoy.forEach((c) => (m[c.formaPago] = (m[c.formaPago] || 0) + totalCuenta(c)));
    return m;
  }, [cerradasHoy]);
  const ingresos = cerradasHoy.reduce((s, c) => s + totalCuenta(c), 0);
  const pendiente = abiertas.reduce((s, c) => s + totalCuenta(c), 0);
  const salidas = gastosHoy.reduce((s, g) => s + g.importe, 0);
  const boxN = (id) => BOXES.find((b) => b.id === id)?.nombre || "—";

  return (
    <div>
      <h2 style={S.h2}>Caja del día</h2>
      <div style={S.cajaTop}>
        {Object.entries(PAGOS).map(([k, v]) => (
          <div key={k} style={S.cajaCard}>
            <div style={{ ...S.cajaIcon, background: v.color + "22", color: v.color }}>{React.createElement(v.icon, { size: 19 })}</div>
            <div style={S.cajaLabel}>{v.label}</div>
            <div style={S.cajaMonto}>{GS(porPago[k])}</div>
          </div>
        ))}
        <div style={{ ...S.cajaCard, ...S.cajaTotal }}>
          <div style={S.cajaLabel}>Entró hoy</div>
          <div style={{ ...S.cajaMonto, fontSize: 25, color: "#5fe0a1" }}>{GS(ingresos)}</div>
          {pendiente > 0 && <div style={{ ...S.cajaLabel, color: "#f2b659" }}>Falta cobrar {GS(pendiente)}</div>}
        </div>
      </div>
      <div style={S.cajaResumen}>
        <span>Entró {GS(ingresos)}</span>
        <span style={{ color: "#f0a45b" }}>Salió {GS(salidas)}</span>
        <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: 17 }}>Queda {GS(ingresos - salidas)}</span>
      </div>

      {abiertas.length > 0 && (
        <>
          <h3 style={S.h3}>⚠ Cuentas sin cobrar (tocá para cobrar)</h3>
          <div style={{ ...S.table, marginBottom: 22, borderColor: "#e8a13c44" }}>
            {abiertas.map((c) => (
              <button key={c.id} style={{ ...S.trow, width: "100%", background: "none", border: "none", borderBottom: "1px solid #191f29", color: "inherit", cursor: "pointer", textAlign: "left" }} onClick={() => onEdit(c)}>
                <span style={{ flex: 1, fontWeight: 600 }}>{c.clienteNombre || "—"}</span>
                <span style={{ width: 70, color: "#8b93a0" }}>{boxN(c.boxId)}</span>
                <span style={{ width: 86, color: "#8b93a0", fontSize: 13 }} className="hide-sm">{c.fecha}</span>
                <span style={{ width: 120, textAlign: "right", fontWeight: 800, color: "#f2b659" }}>{GS(totalCuenta(c))}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <h3 style={S.h3}>Cobrado hoy</h3>
      <div style={S.table}>
        {cerradasHoy.map((c) => (
          <div key={c.id} style={S.trow}>
            <span style={{ flex: 1, fontWeight: 600 }}>{c.clienteNombre || "—"}</span>
            <span style={{ width: 70, color: "#8b93a0" }}>{boxN(c.boxId)}</span>
            <span style={{ flex: 1.4, color: "#8b93a0", fontSize: 13.5 }} className="hide-sm">
              Cancha{c.cargoTubo ? " + tubo" : ""}{(c.items || []).length ? " + " + c.items.map((i) => `${i.cantidad}× ${i.nombre}`).join(", ") : ""}
            </span>
            <span style={{ width: 116 }}>
              <span style={{ ...S.pill, color: PAGOS[c.formaPago]?.color, borderColor: (PAGOS[c.formaPago]?.color || "#888") + "55" }}>
                {PAGOS[c.formaPago]?.label}
              </span>
            </span>
            <span style={{ width: 110, textAlign: "right", fontWeight: 700 }}>{GS(totalCuenta(c))}</span>
          </div>
        ))}
        {cerradasHoy.length === 0 && <div style={S.emptyBox}>Todavía no se cobró nada hoy.</div>}
      </div>
    </div>
  );
}
