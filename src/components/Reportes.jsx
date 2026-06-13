import React, { useMemo } from "react";
import { where } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { S } from "../styles";
import { BOXES, GS, hoyISO, inicioMes, mesISO, totalCuenta } from "../constants";
import { useColeccion } from "../hooks/useColeccion";

export default function Reportes({ gastos }) {
  // Consulta acotada al mes (índice compuesto estado+fecha)
  const { docs: delMes } = useColeccion(
    "cuentas",
    [where("estado", "==", "cerrada"), where("fecha", ">=", inicioMes()), where("fecha", "<=", hoyISO())],
    [mesISO()]
  );

  const ingMes = delMes.reduce((s, c) => s + totalCuenta(c), 0);
  const gasMes = gastos.filter((g) => g.fecha?.startsWith(mesISO())).reduce((s, g) => s + g.importe, 0);
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
      <h2 style={S.h2}>Reportes <span style={S.adminTag}>mes {mesISO().slice(5)}</span></h2>
      <div style={S.repTop}>
        <div style={S.repKpi}><div style={S.kpiLabel}>Entró</div><div style={{ ...S.kpiBig, color: "#5fe0a1" }}>{GS(ingMes)}</div></div>
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
