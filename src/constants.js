import { Banknote, CreditCard, QrCode, Send, Gift } from "lucide-react";

export const PAGOS = {
  EFECTIVO:      { label: "Efectivo",      icon: Banknote,   color: "#3fbf81" },
  POS:           { label: "POS",           icon: CreditCard, color: "#5b8def" },
  QR:            { label: "QR",            icon: QrCode,     color: "#9b7bff" },
  TRANSFERENCIA: { label: "Transferencia", icon: Send,       color: "#e8a13c" },
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
export const perPart = (total, partes) => (partes > 0 ? total / partes : 0);
export const calcCargo = (partes, total, partesTotal) =>
  Math.round((partes || 0) * perPart(total, partesTotal));
export const totalCuenta = (c) =>
  (c.cargoCancha || 0) + (c.cargoTubo || 0) +
  (c.items || []).reduce((s, i) => s + i.precioUnit * i.cantidad, 0);
