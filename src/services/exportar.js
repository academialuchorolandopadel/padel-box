import * as XLSX from "xlsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  BOXES, GASTO_CATS, PAGOS, formatMesLindo, horasEntre,
  primerDiaMes, totalCuenta, ultimoDiaMes,
} from "../constants";

const boxN = (id) => BOXES.find((b) => b.id === id)?.nombre || id || "—";
const pagoN = (k) => PAGOS[k]?.label || k || "—";
const concepto = (c) => (c.concepto === "paquete" ? "Paquete fijo" : "Turno / venta");

// Consumos de una cuenta: cuánto salió por producto (sin cancha/tubo/parrilla).
const itemsPlata = (c) => (c.items || []).reduce((s, i) => s + (i.precioUnit || 0) * (i.cantidad || 0), 0);

/* Arma y descarga un Excel con TODO el detalle del mes elegido ("2026-07").
   Varias hojas para poder cruzar: Resumen, Cobros, Consumos, Gastos, Turnos.
   No incluye teléfonos ni notas privadas: solo el nombre para poder agrupar. */
export const exportarMes = async (mes) => {
  const inicio = primerDiaMes(mes);
  const fin = ultimoDiaMes(mes);

  const [cuentasSnap, gastosSnap, turnosSnap] = await Promise.all([
    getDocs(query(collection(db, "cuentas"), where("fecha", ">=", inicio), where("fecha", "<=", fin))),
    getDocs(query(collection(db, "gastos"), where("fecha", ">=", inicio), where("fecha", "<=", fin))),
    getDocs(query(collection(db, "turnos"), where("fecha", ">=", inicio), where("fecha", "<=", fin))),
  ]);

  const cuentas = cuentasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const gastos = gastosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const turnos = turnosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const cobradas = cuentas.filter((c) => c.estado === "cerrada");

  // --- Hoja 1: Resumen ---
  const ingreso = cobradas.reduce((s, c) => s + totalCuenta(c), 0);
  const gasto = gastos.reduce((s, g) => s + (g.importe || 0), 0);
  let cancha = 0, tubo = 0, parrilla = 0, productos = 0, paquetes = 0;
  cobradas.forEach((c) => {
    if (c.concepto === "paquete") { paquetes += totalCuenta(c); return; }
    cancha += c.cargoCancha || 0;
    tubo += c.cargoTubo || 0;
    parrilla += c.cargoParrilla || 0;
    productos += itemsPlata(c);
  });
  const porPago = {};
  cobradas.forEach((c) => { porPago[pagoN(c.formaPago)] = (porPago[pagoN(c.formaPago)] || 0) + totalCuenta(c); });
  const horasTotal = turnos.reduce((s, t) => s + (horasEntre(t.horaInicio, t.horaFin) || 0), 0);

  const resumen = [
    ["PADEL BOX — Resumen de " + formatMesLindo(mes)],
    [],
    ["INGRESOS", ""],
    ["Total cobrado", ingreso],
    ["  Alquiler de cancha", cancha],
    ["  Paquetes de turnos fijos", paquetes],
    ["  Tubos de pelotas", tubo],
    ["  Uso de parrilla", parrilla],
    ["  Productos y consumos", productos],
    [],
    ["CÓMO SE COBRÓ", ""],
    ...Object.entries(porPago).map(([k, v]) => ["  " + k, v]),
    [],
    ["GASTOS", ""],
    ["Total gastado", gasto],
    ...GASTO_CATS.map((cat) => ["  " + cat, gastos.filter((g) => (g.categoria || "Otros") === cat).reduce((s, g) => s + (g.importe || 0), 0)]),
    [],
    ["RESULTADO DEL MES", ingreso - gasto],
    [],
    ["OTROS DATOS", ""],
    ["Cuentas cobradas", cobradas.length],
    ["Turnos jugados", turnos.length],
    ["Horas jugadas (total)", horasTotal],
    ["Gente distinta que vino", new Set(cobradas.map((c) => c.clienteNombre).filter(Boolean)).size],
  ];

  // --- Hoja 2: Cobros (una fila por cuenta cobrada) ---
  const cobros = [
    ["Fecha", "Cliente", "Cancha", "Concepto", "Forma de pago", "Cancha ₲", "Tubo ₲", "Parrilla ₲", "Productos ₲", "Total ₲"],
    ...cobradas
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
      .map((c) => [
        c.fecha || "", c.clienteNombre || "—", boxN(c.boxId), concepto(c), pagoN(c.formaPago),
        c.cargoCancha || 0, c.cargoTubo || 0, c.cargoParrilla || 0, itemsPlata(c), totalCuenta(c),
      ]),
  ];

  // --- Hoja 3: Consumos (una fila por producto vendido) ---
  const consumos = [["Fecha", "Cliente", "Producto", "Cantidad", "Precio unit. ₲", "Subtotal ₲"]];
  cobradas.forEach((c) => {
    (c.items || []).forEach((i) => {
      consumos.push([c.fecha || "", c.clienteNombre || "—", i.nombre || "—", i.cantidad || 0, i.precioUnit || 0, (i.precioUnit || 0) * (i.cantidad || 0)]);
    });
  });

  // --- Hoja 4: Gastos ---
  const gastosRows = [
    ["Fecha", "Descripción", "Categoría", "Forma de pago", "Importe ₲"],
    ...gastos
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
      .map((g) => [g.fecha || "", g.descripcion || "—", g.categoria || "Otros", pagoN(g.formaPago), g.importe || 0]),
  ];

  // --- Hoja 5: Turnos ---
  const turnosRows = [
    ["Fecha", "Cancha", "Empieza", "Termina", "Horas", "Origen", "¿Es fijo?"],
    ...turnos
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || "") || (a.horaInicio || "").localeCompare(b.horaInicio || ""))
      .map((t) => [
        t.fecha || "", boxN(t.boxId), t.horaInicio || "", t.horaFin || "",
        horasEntre(t.horaInicio, t.horaFin) || 0,
        t.origen === "reva" ? "Reva" : (t.fijoId ? "Fijo" : "Local"),
        t.fijoId ? "Sí" : "No",
      ]),
  ];

  // Armar el libro
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), "Resumen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cobros), "Cobros");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(consumos), "Consumos");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(gastosRows), "Gastos");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(turnosRows), "Turnos");

  XLSX.writeFile(wb, `PadelBox_${mes}.xlsx`);
};
