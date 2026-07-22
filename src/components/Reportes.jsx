import React, { useMemo, useState } from "react";
import { where } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { S } from "../styles";
import {
  BOXES, GS, PAGOS, formatFechaLinda, formatMesLindo, horasEntre,
  mesISO, primerDiaMes, textoDuracion, totalCuenta, ultimoDiaMes,
} from "../constants";
import { useColeccion } from "../hooks/useColeccion";

export default function Reportes() {
  const [mes, setMes] = useState(mesISO()); // "2026-07"
  const inicio = primerDiaMes(mes);
  const fin = ultimoDiaMes(mes);

  // Traemos por rango de fecha (sin índice compuesto) y filtramos el estado
  // en el código. Para el volumen de un mes esto es instantáneo, y así el
  // reporte no depende de que exista un índice compuesto en Firestore.
  const { docs: cuentasRango } = useColeccion(
    "cuentas",
    [where("fecha", ">=", inicio), where("fecha", "<=", fin)],
    [mes]
  );
  const delMes = useMemo(() => cuentasRango.filter((c) => c.estado === "cerrada"), [cuentasRango]);
  const { docs: gastosMes } = useColeccion(
    "gastos",
    [where("fecha", ">=", inicio), where("fecha", "<=", fin)],
    [mes]
  );
  const { docs: turnosMes } = useColeccion(
    "turnos",
    [where("fecha", ">=", inicio), where("fecha", "<=", fin)],
    [mes]
  );

  const ingMes = delMes.reduce((s, c) => s + totalCuenta(c), 0);
  const gasMes = gastosMes.reduce((s, g) => s + g.importe, 0);

  // De dónde salió la plata: cancha, tubos, productos y paquetes fijos por separado.
  const conceptos = useMemo(() => {
    let cancha = 0, tubo = 0, parrilla = 0, productos = 0, paquetes = 0;
    delMes.forEach((c) => {
      if (c.concepto === "paquete") { paquetes += totalCuenta(c); return; }
      cancha += c.cargoCancha || 0;
      tubo += c.cargoTubo || 0;
      parrilla += c.cargoParrilla || 0;
      productos += (c.items || []).reduce((s, i) => s + (i.precioUnit || 0) * (i.cantidad || 0), 0);
    });
    return [
      { nom: "Alquiler de cancha", monto: cancha, color: "#3fbf81" },
      { nom: "Paquetes de turnos fijos", monto: paquetes, color: "#5ec5e8" },
      { nom: "Tubos de pelotas", monto: tubo, color: "#5b8def" },
      { nom: "Uso de parrilla", monto: parrilla, color: "#d9542b" },
      { nom: "Productos y consumos", monto: productos, color: "#e8a13c" },
    ].filter((x) => x.monto > 0);
  }, [delMes]);

  // Total del mes por forma de pago (el día por día ya está más abajo).
  const porPagoMes = useMemo(() => {
    const m = {};
    delMes.forEach((c) => { m[c.formaPago] = (m[c.formaPago] || 0) + totalCuenta(c); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [delMes]);

  // Horas jugadas. Las de turnos fijos van aparte porque ya vienen pagas en el
  // paquete: se juegan pero no suman al "Alquiler de cancha" de arriba.
  const horas = useMemo(() => {
    let total = 0, fijas = 0;
    turnosMes.forEach((t) => {
      const h = horasEntre(t.horaInicio, t.horaFin) || 0;
      total += h;
      if (t.fijoId) fijas += h;
    });
    return { total, fijas };
  }, [turnosMes]);

  const gastosPorCat = useMemo(() => {
    const m = {};
    gastosMes.forEach((g) => { m[g.categoria || "Otros"] = (m[g.categoria || "Otros"] || 0) + g.importe; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [gastosMes]);

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

  // Top productos ordenados por PLATA (no por unidades): para un reporte de
  // ingresos importa más lo que más factura que lo que más se despacha.
  const topProd = useMemo(() => {
    const m = {};
    delMes.forEach((c) => (c.items || []).forEach((i) => {
      const e = (m[i.nombre] ||= { cant: 0, plata: 0 });
      e.cant += i.cantidad || 0;
      e.plata += (i.precioUnit || 0) * (i.cantidad || 0);
    }));
    return Object.entries(m).map(([n, v]) => ({ n, ...v })).sort((a, b) => b.plata - a.plata).slice(0, 10);
  }, [delMes]);
  const colors = ["#3fbf81", "#5b8def", "#e8a13c"];

  return (
    <div>
      <div style={S.pageHead}>
        <h2 style={S.h2}>Reportes</h2>
        <input type="month" value={mes} max={mesISO()} onChange={(e) => setMes(e.target.value)} style={S.mesInput} />
      </div>
      <p style={S.pageHint}>Todo lo de {formatMesLindo(mes)}: de dónde salió la plata, cómo se cobró y en qué se gastó.</p>

      <div style={S.repTop}>
        <div style={S.repKpi}><div style={S.kpiLabel}>Entró</div><div style={{ ...S.kpiBig, color: "#5fe0a1" }}>{GS(ingMes)}</div></div>
        <div style={S.repKpi}><div style={S.kpiLabel}>Salió</div><div style={{ ...S.kpiBig, color: "#f0a45b" }}>{GS(gasMes)}</div></div>
        <div style={S.repKpi}><div style={S.kpiLabel}>Resultado</div><div style={{ ...S.kpiBig, color: ingMes - gasMes >= 0 ? "#5fe0a1" : "#f0a45b" }}>{GS(ingMes - gasMes)}</div></div>
        <div style={S.repKpi}>
          <div style={S.kpiLabel}>Horas jugadas</div>
          <div style={S.kpiBig}>{textoDuracion(horas.total)}</div>
          {horas.fijas > 0 && <div style={{ fontSize: 12, color: "#9bb8f5", marginTop: 4 }}>{textoDuracion(horas.fijas)} de turnos fijos</div>}
        </div>
      </div>

      <div style={S.repCols} className="repCols">
        <div style={S.repBox}>
          <h3 style={S.h3}>De dónde salió la plata</h3>
          {conceptos.length === 0 && <div style={S.empty}>Sin ingresos en {formatMesLindo(mes)}.</div>}
          {conceptos.map((c) => {
            const pct = ingMes > 0 ? (c.monto / ingMes) * 100 : 0;
            return (
              <div key={c.nom} style={S.conceptoRow}>
                <span style={S.conceptoNom}>{c.nom}</span>
                <div style={S.conceptoBar}><div style={{ height: "100%", width: pct + "%", background: c.color, borderRadius: 4 }} /></div>
                <span style={{ ...S.conceptoMonto, color: c.color }}>{GS(c.monto)}</span>
                <span style={S.conceptoPct}>{Math.round(pct)}%</span>
              </div>
            );
          })}
          {horas.fijas > 0 && (
            <p style={{ ...S.pageHint, margin: "12px 0 0", fontSize: 12.5 }}>
              Ojo: las horas de turnos fijos no suman acá porque ya vienen pagas en el paquete.
            </p>
          )}
        </div>

        <div style={S.repBox}>
          <h3 style={S.h3}>Cómo se cobró</h3>
          {porPagoMes.length === 0 && <div style={S.empty}>Sin cobros en {formatMesLindo(mes)}.</div>}
          {porPagoMes.map(([k, v]) => {
            const p = PAGOS[k];
            if (!p) return null;
            const Icon = p.icon;
            const pct = ingMes > 0 ? (v / ingMes) * 100 : 0;
            return (
              <div key={k} style={S.conceptoRow}>
                <span style={{ ...S.conceptoNom, display: "flex", alignItems: "center", gap: 7 }}>
                  <Icon size={14} color={p.color} /> {p.label}
                </span>
                <div style={S.conceptoBar}><div style={{ height: "100%", width: pct + "%", background: p.color, borderRadius: 4 }} /></div>
                <span style={{ ...S.conceptoMonto, color: p.color }}>{GS(v)}</span>
                <span style={S.conceptoPct}>{Math.round(pct)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...S.repCols, marginTop: 15 }} className="repCols">
        <div style={S.repBox}>
          <h3 style={S.h3}>En qué se gastó</h3>
          {gastosPorCat.length === 0 && <div style={S.empty}>Sin gastos en {formatMesLindo(mes)}.</div>}
          {gastosPorCat.map(([cat, v]) => {
            const pct = gasMes > 0 ? (v / gasMes) * 100 : 0;
            return (
              <div key={cat} style={S.conceptoRow}>
                <span style={S.conceptoNom}>{cat}</span>
                <div style={S.conceptoBar}><div style={{ height: "100%", width: pct + "%", background: "#f0a45b", borderRadius: 4 }} /></div>
                <span style={{ ...S.conceptoMonto, color: "#f0a45b" }}>{GS(v)}</span>
                <span style={S.conceptoPct}>{Math.round(pct)}%</span>
              </div>
            );
          })}
        </div>

        <div style={S.repBox}>
          <h3 style={S.h3}>Los 10 que más facturan</h3>
          {topProd.length === 0 && <div style={S.empty}>Sin ventas con productos</div>}
          {topProd.map((p, i) => {
            const max = topProd[0].plata || 1;
            return (
              <div key={p.n} style={S.prodRow}>
                <span style={S.prodRank}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{p.n}</span>
                <div style={S.barTrack}><div style={{ ...S.barFill, width: (p.plata / max) * 100 + "%" }} /></div>
                <span style={S.prodUn}>{p.cant} un.</span>
                <span style={S.prodPlata}>{GS(p.plata)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...S.repBox, marginTop: 15 }}>
        <h3 style={S.h3}>Ingreso por cancha (incluye consumos del turno)</h3>
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

      <h3 style={{ ...S.h3, marginTop: 22 }}>Día por día</h3>
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
    </div>
  );
}
