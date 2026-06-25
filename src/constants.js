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
export const hoyISO = () => new Date().toISOString().slice(0, 10);
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

export const perPart = (total, partes) => (partes > 0 ? total / partes : 0);
export const calcCargo = (partes, total, partesTotal) =>
  Math.round((partes || 0) * perPart(total, partesTotal));
export const totalCuenta = (c) =>
  ((c && c.cargoCancha) || 0) + ((c && c.cargoTubo) || 0) +
  (((c && c.items) || []).reduce((s, it) => s + ((it && it.precioUnit) || 0) * ((it && it.cantidad) || 0), 0));
