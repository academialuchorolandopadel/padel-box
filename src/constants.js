import { Banknote, CreditCard, QrCode, Send, Gift } from "lucide-react";

export const PAGOS = {
  EFECTIVO:      { label: "Efectivo",      icon: Banknote,   color: "#3fbf81" },
  POS:           { label: "POS",           icon: CreditCard, color: "#5b8def" },
  QR:            { label: "QR",            icon: QrCode,     color: "#9b7bff" },
  TRANSFERENCIA: { label: "Transferencia", icon: Send,       color: "#2dd4bf" },
  SIN_CARGO:     { label: "Sin cargo",     icon: Gift,       color: "#9aa0aa" },
};

export const BOXES = [
  { id: "box1", nombre: "BOX 1" },
  { id: "box2", nombre: "BOX 2" },
  { id: "box3", nombre: "BOX 3" },
];

export const CATS = ["Todo", "Bebida", "Cerveza", "Comida", "Servicio"];
export const GASTO_CATS = ["Mercadería", "Sueldos", "Servicios", "Mantenimiento", "Otros"];
export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/* ----- helpers de fecha y dinero ----- */
export const GS = (n) => "₲ " + Math.round(n || 0).toLocaleString("es-PY");
// OJO: usar SIEMPRE fecha local, nunca toISOString() a secas (esa da la fecha
// en UTC). Paraguay está 4 horas atrás de UTC, así que entre las 20:00 y la
// medianoche, toISOString() ya "cree" que es el día siguiente. Eso hacía que
// los turnos cargados de tarde desaparecieran de la vista al entrar de noche.
export const hoyISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const mesISO = () => hoyISO().slice(0, 7);
export const anioISO = () => hoyISO().slice(0, 4);
export const inicioMes = () => mesISO() + "-01";

/* ----- helpers de cobro ----- */
export const horasEntre = (ini, fin) => {
  const [h1, m1] = ini.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  return Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
};
// Suma (o resta) minutos a una hora "HH:MM" y devuelve "HH:MM" (se queda dentro de 00:00–23:59)
export const sumarMinutos = (hora, mins) => {
  const [h, m] = hora.split(":").map(Number);
  let t = h * 60 + m + mins;
  t = Math.max(0, Math.min(23 * 60 + 59, t));
  const hh = String(Math.floor(t / 60)).padStart(2, "0");
  const mm = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

// Texto lindo de duración: 1.5 -> "1 h 30 min", 2 -> "2 h", 0.5 -> "30 min"
export const textoDuracion = (horas) => {
  const total = Math.round(horas * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
};

// Formatea "2026-07-01" -> "miércoles 1 de julio". OJO: arma la fecha con
// componentes locales (año, mes, día), NUNCA con new Date("YYYY-MM-DD") a
// secas, porque eso el navegador lo interpreta en UTC y puede mostrar el
// día equivocado (el mismo tipo de bug que ya corregimos en hoyISO).
export const formatFechaLinda = (fechaISO) => {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PY", { weekday: "long", day: "numeric", month: "long" });
};

// Primer y último día de un mes elegido ("2026-07" -> "2026-07-01" / "2026-07-31").
// Sirve para acotar consultas a CUALQUIER mes, no solo al actual.
export const primerDiaMes = (ym) => `${ym}-01`;
export const ultimoDiaMes = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
};
export const formatMesLindo = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-PY", { month: "long", year: "numeric" });
};

// Revisa turnos de un rango de días y marca los que quedaron con partes de
// cancha o tubo sin asignar (habiendo plata de por medio) o con cuentas
// abiertas sin cobrar. Sirve para el aviso de "quedó algo pendiente".
export const detectarProblemas = (turnos, cuentas) => {
  const porTurno = {};
  cuentas.forEach((c) => { (porTurno[c.turnoId] ||= []).push(c); });
  const problemas = [];
  turnos.forEach((t) => {
    const lista = porTurno[t.id] || [];
    const canchaAsig = lista.reduce((s, c) => s + (c.canchaPartes || 0), 0);
    const tuboAsig = lista.reduce((s, c) => s + (c.tuboPartes || 0), 0);
    const canchaProblema = (t.canchaTotal || 0) > 0 && canchaAsig !== (t.canchaPartes || 0);
    const tuboProblema = !!t.tuboActivo && (t.tuboPrecio || 0) > 0 && tuboAsig !== (t.tuboPartes || 0);
    const pendiente = lista.filter((c) => c.estado === "abierta").reduce((s, c) => s + totalCuenta(c), 0);
    if (canchaProblema || tuboProblema || pendiente > 0) {
      problemas.push({ turnoId: t.id, fecha: t.fecha, boxId: t.boxId, canchaProblema, tuboProblema, pendiente });
    }
  });
  return problemas;
};

export const perPart = (total, partes) => (partes > 0 ? total / partes : 0);
export const calcCargo = (partes, total, partesTotal) =>
  Math.round((partes || 0) * perPart(total, partesTotal));
export const totalCuenta = (c) =>
  ((c && c.cargoCancha) || 0) + ((c && c.cargoTubo) || 0) +
  (((c && c.items) || []).reduce((s, it) => s + ((it && it.precioUnit) || 0) * ((it && it.cantidad) || 0), 0));
