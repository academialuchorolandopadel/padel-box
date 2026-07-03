import React, { useMemo, useState } from "react";
import { where } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { S } from "../styles";
import {
  BOXES, GS, PAGOS, formatFechaLinda, formatMesLindo,
  mesISO, primerDiaMes, totalCuenta, ultimoDiaMes,
} from "../constants";
import { useColeccion } from "../hooks/useColeccion";

export default function Reportes() {
  const [mes, setMes] = useState(mesISO()); // "2026-07"
  const inicio = primerDiaMes(mes);
  const fin = ultimoDiaMes(mes);

  // Consultas acotadas al mes ELEGIDO (no siempre el actual)
  const { docs: delMes } = useColeccion(
    "cuentas",
    [where("estado", "==", "cerrada"), where("fecha", ">=", inicio), where("fecha", "<=", fin)],
    [mes]
  );
  const { docs: gastosMes } = useColeccion(
    "gastos",
    [where("fecha", ">=", inicio), where("fecha", "<=", fin)],
    [mes]
  );

  const ingMes = delMes.reduce((s, c) => s + totalCuenta(c), 0);
  const gasMes = gastosMes.reduce((s, g) => s + g.importe, 0);

  // Desglose día por día: cuánto entró (y de qué forma) y cuánto salió cada día.
  const porDia = useMemo(() => {
    const dias = {};
    delMes.forEach((c) => {
      const d = (dias[c.fecha] ||= { porPago: {}, gastos: 0 });
      d.porPago[c.formaPago] = (d.porPago[c.formaPago] || 0) + totalCuenta(c);
    });
    gastosMes.forEach((g) => {
      const d = (dias[g.fecha] ||= { porPago: {}, gastos: 0 });
      d.gastos += g.importe;
    });
    return Object.entries(dias)
      .map(([fecha, info]) => ({
        fecha, ...info,
        ingreso: Object.values(info.porPago).reduce((s, v) => s + v, 0),
      }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha)); // más reciente arriba
  }, [delMes, gastosMes]);

  const porCancha = useMemo(() =>
    BOXES.map((c) => ({
      nombre: c.nombre,
      total: delMes.filter((x) => x.boxId === c.id).reduce((s, x) => s + totalCuenta(x), 0),
    })), [delMes]);
  const topProd = useMemo(() => {
    const m = {};
    delMes.forEach((c) => (c.items || []).forEach((i) => (m[i.nombre] = (m[i.nombre] || 0) + i.cantidad)));
    return Object.entries(m).map(([n, c]) => ({ n, c })).sort((a, b) => b.c - a.c).slice(0, 6);
  }, [delMes]);
  const colors = ["#3fbf81", "#5b8def", "#e8a13c"];

  return (
    <div>
      <div style={S.pageHead}>
        <h2 style={S.h2}>Reportes</h2>
        <input type="month" value={mes} max={mesISO()} onChange={(e) => setMes(e.target.value)} style={S.mesInput} />
      </div>
      <p style={S.pageHint}>Lo que entró y salió cada día de {formatMesLindo(mes)}, con el total al final.</p>

      <h3 style={S.h3}>Día por día</h3>
      {porDia.length === 0 && <div style={S.empty}>Sin movimientos en {formatMesLindo(mes)}.</div>}
      {porDia.map((d) => {
        const neto = d.ingreso - d.gastos;
        return (
          <div key={d.fecha} style={S.diaCard}>
            <div style={S.diaHead}>
              <span style={S.diaFecha}>{formatFechaLinda(d.fecha)}</span>
              <span style={S.diaTotal}>{GS(d.ingreso)}</span>
            </div>
            {Object.keys(d.porPago).length > 0 && (
              <div style={S.diaChips}>
                {Object.entries(d.porPago).map(([k, v]) => {
                  const p = PAGOS[k];
                  if (!p) return null;
                  const Icon = p.icon;
                  return (
                    <span key={k} style={{ ...S.diaChip, borderColor: p.color + "66", color: p.color, background: p.color + "1a" }}>
                      <Icon size={12} /> {p.label} {GS(v)}
                    </span>
                  );
                })}
              </div>
            )}
            {d.gastos > 0 && (
              <div style={S.diaFooter}>
                <span>Gastos del día: <b style={{ color: "#f0a45b" }}>{GS(d.gastos)}</b></span>
                <span>Neto: <b style={{ color: neto >= 0 ? "#5fe0a1" : "#f0a45b" }}>{GS(neto)}</b></span>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ ...S.repTop, marginTop: 22 }}>
        <div style={S.repKpi}><div style={S.kpiLabel}>Entró en {formatMesLindo(mes)}</div><div style={{ ...S.kpiBig, color: "#5fe0a1" }}>{GS(ingMes)}</div></div>
        <div style={S.repKpi}><div style={S.kpiLabel}>Salió</div><div style={{ ...S.kpiBig, color: "#f0a45b" }}>{GS(gasMes)}</div></div>
        <div style={S.repKpi}><div style={S.kpiLabel}>Resultado</div><div style={{ ...S.kpiBig, color: ingMes - gasMes >= 0 ? "#5fe0a1" : "#f0a45b" }}>{GS(ingMes - gasMes)}</div></div>
        <div style={S.repKpi}><div style={S.kpiLabel}>Cuentas cobradas</div><div style={S.kpiBig}>{delMes.length}</div></div>
      </div>

      <div style={S.repCols} className="repCols">
        <div style={S.repBox}>
          <h3 style={S.h3}>Ingreso por cancha</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porCancha} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="nombre" stroke="#7a808a" fontSize={12} />
              <YAxis stroke="#7a808a" fontSize={11} tickFormatter={(n) => (n / 1000) + "k"} />
              <Tooltip formatter={(v) => GS(v)} contentStyle={{ background: "#171c24", border: "1px solid #2a313c", borderRadius: 8, color: "#eef0f3" }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {porCancha.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.repBox}>
          <h3 style={S.h3}>Lo que más se vende</h3>
          {topProd.length === 0 && <div style={S.empty}>Sin ventas con productos</div>}
          {topProd.map((p, i) => {
            const max = topProd[0].c;
            return (
              <div key={p.n} style={S.prodRow}>
                <span style={S.prodRank}>{i + 1}</span><span style={{ flex: 1 }}>{p.n}</span>
                <div style={S.barTrack}><div style={{ ...S.barFill, width: (p.c / max) * 100 + "%" }} /></div>
                <span style={S.prodCant}>{p.c}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
