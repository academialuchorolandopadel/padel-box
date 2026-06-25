import {
  addDoc, collection, deleteDoc, doc, runTransaction, updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { calcCargo, hoyISO, totalCuenta } from "../constants";

/**
 * Guarda una cuenta. Si cobrar=true se cierra con su forma de pago y,
 * EN LA MISMA TRANSACCIÓN, descuenta el stock de cada producto consumido.
 * Así nunca queda una venta cobrada sin su descuento de stock (o viceversa).
 */
export const guardarCuenta = async (cuenta, cobrar) => {
  const { id, ...data } = cuenta;
  const payload = {
    ...data,
    total: totalCuenta(cuenta),
    estado: cobrar ? "cerrada" : "abierta",
    formaPago: cobrar ? cuenta.formaPago : null,
    actualizadoTs: Date.now(),
  };

  if (!cobrar) {
    if (id) return updateDoc(doc(db, "cuentas", id), payload);
    return addDoc(collection(db, "cuentas"), { ...payload, fecha: payload.fecha || hoyISO() });
  }

  // Cobro: transacción cuenta + stock
  await runTransaction(db, async (tx) => {
    const ref = id ? doc(db, "cuentas", id) : doc(collection(db, "cuentas"));

    // 1) Leer estado previo (para no descontar stock dos veces si se re-cobra)
    let yaEstabaCerrada = false;
    if (id) {
      const prev = await tx.get(ref);
      yaEstabaCerrada = prev.exists() && prev.data().estado === "cerrada";
    }

    // 2) Acumular cuánto descontar de cada producto.
    //    Si el producto vendido es una promo (tiene descuentaId), se descuenta
    //    del producto BASE: descuentaCant × cantidad vendida. Si no, del propio.
    const aDescontar = {}; // { productoId: unidades }
    if (!yaEstabaCerrada) {
      for (const item of payload.items || []) {
        if (!item.productoId) continue;
        const pSnap = await tx.get(doc(db, "productos", item.productoId));
        if (!pSnap.exists()) continue;
        const p = pSnap.data();
        if (p.descuentaId && p.descuentaCant) {
          // promo: descuenta del producto base
          aDescontar[p.descuentaId] = (aDescontar[p.descuentaId] || 0) + p.descuentaCant * item.cantidad;
        } else if (p.categoria !== "Servicio") {
          // producto normal: descuenta de sí mismo (los servicios no llevan stock)
          aDescontar[item.productoId] = (aDescontar[item.productoId] || 0) + item.cantidad;
        }
      }
    }

    // 3) Leer el stock actual de cada producto afectado
    const stocks = {};
    for (const pid of Object.keys(aDescontar)) {
      const s = await tx.get(doc(db, "productos", pid));
      if (s.exists()) stocks[pid] = s.data().stockActual ?? 0;
    }

    // 4) Escribir cuenta cerrada + aplicar descuentos
    tx.set(ref, { ...payload, fecha: payload.fecha || hoyISO() }, { merge: true });
    for (const pid of Object.keys(aDescontar)) {
      if (!(pid in stocks)) continue;
      tx.update(doc(db, "productos", pid), { stockActual: stocks[pid] - aDescontar[pid] });
    }
  });
};

/** Cambia las partes de cancha/tubo de UNA persona y recalcula su cargo. */
export const cambiarPartes = (cuenta, campo, delta, turno) => {
  if (campo === "cancha") {
    const np = Math.max(0, (cuenta.canchaPartes || 0) + delta);
    return updateDoc(doc(db, "cuentas", cuenta.id), {
      canchaPartes: np,
      cargoCancha: calcCargo(np, turno.canchaTotal, turno.canchaPartes),
    });
  }
  const np = Math.max(0, (cuenta.tuboPartes || 0) + delta);
  return updateDoc(doc(db, "cuentas", cuenta.id), {
    tuboPartes: np,
    cargoTubo: calcCargo(np, turno.tuboActivo ? turno.tuboPrecio : 0, turno.tuboPartes),
  });
};

/** Reabrir devuelve el stock NO se repone automáticamente a propósito:
 *  lo consumido ya se entregó; reabrir es para seguir agregando. */
export const reabrirCuenta = (id) =>
  updateDoc(doc(db, "cuentas", id), { estado: "abierta", formaPago: null });

export const borrarCuenta = async (id) => {
  if (!id) throw new Error("Falta el id de la cuenta");
  await deleteDoc(doc(db, "cuentas", String(id)));
};
