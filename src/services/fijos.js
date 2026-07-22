import {
  collection, doc, getDoc, updateDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { hoyISO, sumarMinutos } from "../constants";

/* Paquete de turno fijo.
   { clienteId, clienteNombre, boxId, diaSemana, horaInicio,
     horasTotal, horasRestante, horasPorSesion,
     obsequios:        [{ productoId, nombre, cantidad }]  // la "receta" del mes (fija)
     obsequiosRestante:[{ productoId, nombre, cantidad }]  // saldo que se va entregando
     precioPaquete, estado:'activo'|'completado', creado } */

const copiaObsequios = (obs) =>
  (obs || []).filter((o) => o.cantidad > 0)
    .map((o) => ({ productoId: o.productoId, nombre: o.nombre, cantidad: Number(o.cantidad) }));

/* El cobro del paquete se guarda como una CUENTA CERRADA normal. Así entra solo
   en todos lados (ingresos del mes, forma de pago, día por día, cobrado hoy)
   sin tener que tocar el resto del sistema. La marca concepto:"paquete" permite
   mostrarlo como línea propia en el reporte, separado del alquiler por hora. */
const cuentaPaquete = (fijo, precio, formaPago) => ({
  turnoId: null,
  boxId: fijo.boxId || null,
  fijoId: fijo.id || null,
  concepto: "paquete",
  fecha: hoyISO(),
  clienteId: fijo.clienteId || null,
  clienteNombre: fijo.clienteNombre || "—",
  canchaPartes: 0,
  tuboPartes: 0,
  cargoCancha: Number(precio) || 0, // el total del paquete va acá para que totalCuenta lo sume
  cargoTubo: 0,
  items: [],
  notas: `Paquete de ${fijo.horasTotal || "?"} h`,
  estado: "cerrada",
  formaPago,
  total: Number(precio) || 0,
  creadoTs: Date.now(),
});

/* Crea el paquete y, en la misma operación, registra su cobro (siempre se paga
   por adelantado). Van juntos en un batch para que nunca quede un paquete
   creado sin su ingreso registrado, ni al revés. */
export const crearFijo = async (fijo, cobro) => {
  const batch = writeBatch(db);
  const fijoRef = doc(collection(db, "fijos"));
  batch.set(fijoRef, {
    ...fijo,
    obsequiosRestante: copiaObsequios(fijo.obsequios), // arranca el mes con todo el saldo
    estado: "activo",
    creado: hoyISO(),
  });
  if (cobro && Number(cobro.precio) > 0) {
    batch.set(doc(collection(db, "cuentas")), cuentaPaquete({ ...fijo, id: fijoRef.id }, cobro.precio, cobro.formaPago));
  }
  await batch.commit();
};

/* Al editar: si cambió la receta de obsequios, se respeta el saldo restante
   que el admin haya fijado; si no se toca, queda el que estaba. */
export const actualizarFijo = (id, patch) => updateDoc(doc(db, "fijos", id), patch);

export const borrarFijo = async (id) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, "fijos", String(id)));
  await batch.commit();
};

/* Renueva el mes: rellena horas, recarga el saldo de obsequios y registra el
   cobro del mes nuevo. El precio puede cambiar (aumento, promo), y si cambia
   queda guardado como el nuevo precio del paquete. */
export const renovarFijo = async (fijo, cobro) => {
  const batch = writeBatch(db);
  batch.update(doc(db, "fijos", fijo.id), {
    horasRestante: fijo.horasTotal,
    obsequiosRestante: copiaObsequios(fijo.obsequios),
    estado: "activo",
    renovado: hoyISO(),
    ...(cobro && Number(cobro.precio) > 0 ? { precioPaquete: Number(cobro.precio) } : {}),
  });
  if (cobro && Number(cobro.precio) > 0) {
    batch.set(doc(collection(db, "cuentas")), cuentaPaquete(fijo, cobro.precio, cobro.formaPago));
  }
  await batch.commit();
};

/* Registra el cobro de un paquete SIN tocar horas ni obsequios. Sirve para
   cargar a mano un paquete que ya se cobró (por ejemplo, los que existían
   antes de que el sistema registrara estos ingresos). */
export const registrarCobroPaquete = async (fijo, precio, formaPago) => {
  const batch = writeBatch(db);
  batch.set(doc(collection(db, "cuentas")), cuentaPaquete(fijo, precio, formaPago));
  await batch.commit();
};

/* "Vino hoy": abre el turno fijo (cancha prepaga = 0) y descuenta las horas.
   Los obsequios NO se copian al turno: el turno solo se marca como fijo y lee
   el saldo mensual del paquete (obsequiosRestante). */
export const usarFijo = async (fijo, horasSesion, config) => {
  const horas = Number(horasSesion) || fijo.horasPorSesion || 1;
  const horaInicio = fijo.horaInicio || "20:00";
  const horaFin = sumarMinutos(horaInicio, Math.round(horas * 60));
  const restante = Math.max(0, (fijo.horasRestante ?? fijo.horasTotal) - horas);

  const batch = writeBatch(db);

  const turnoRef = doc(collection(db, "turnos"));
  batch.set(turnoRef, {
    boxId: fijo.boxId, fecha: hoyISO(), horaInicio, horaFin,
    fijoId: fijo.id, canchaTotal: 0, canchaPartes: 1,
    tuboActivo: false, tuboPrecio: 0, tuboPartes: 1, tuboGratis: false,
    parrillaActiva: false, parrillaPrecio: (config && config.parrillaPrecio) || 0, parrillaPartes: 1,
    creadoTs: Date.now(),
  });

  batch.update(doc(db, "fijos", fijo.id), {
    horasRestante: restante,
    ...(restante <= 0 ? { estado: "completado" } : {}),
  });

  await batch.commit();
};

/* Entrega UN obsequio: descuenta 1 del saldo mensual del paquete (obsequiosRestante)
   y 1 del stock del producto (o del base, si es promo). */
export const entregarObsequio = async (fijoId, productoId) => {
  const fijoSnap = await getDoc(doc(db, "fijos", fijoId));
  if (!fijoSnap.exists()) return;
  const fijo = fijoSnap.data();

  const restante = (fijo.obsequiosRestante || [])
    .map((o) => (o.productoId === productoId ? { ...o, cantidad: o.cantidad - 1 } : o))
    .filter((o) => o.cantidad > 0);

  const batch = writeBatch(db);
  batch.update(doc(db, "fijos", fijoId), { obsequiosRestante: restante });

  const pSnap = await getDoc(doc(db, "productos", productoId));
  if (pSnap.exists()) {
    const p = pSnap.data();
    if (p.descuentaId && p.descuentaCant) {
      const bSnap = await getDoc(doc(db, "productos", p.descuentaId));
      if (bSnap.exists())
        batch.update(doc(db, "productos", p.descuentaId), { stockActual: (bSnap.data().stockActual ?? 0) - p.descuentaCant });
    } else if (p.categoria !== "Servicio") {
      batch.update(doc(db, "productos", productoId), { stockActual: (p.stockActual ?? 0) - 1 });
    }
  }
  await batch.commit();
};
