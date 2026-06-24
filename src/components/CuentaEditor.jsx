import React, { useState } from "react";
import { Check, Gift, Plus, Search, StickyNote, Trash2, X } from "lucide-react";
import { S } from "../styles";
import { CATS, GS, PAGOS, totalCuenta } from "../constants";
import { Stepper } from "./ui";

export default function CuentaEditor({ cuenta, boxNombre, productos, clientes, onCrearCliente, onUpdCliente, onClose, onSave }) {
  const [clienteId, setClienteId] = useState(cuenta.clienteId);
  const [clienteNombre, setClienteNombre] = useState(cuenta.clienteNombre);
  const [items, setItems] = useState(cuenta.items || []);
  const [notas, setNotas] = useState(cuenta.notas || "");
  const [formaPago, setFormaPago] = useState(cuenta.formaPago || "EFECTIVO");
  const [cat, setCat] = useState("Todo");
  const [busqProd, setBusqProd] = useState("");
  const [busqCli, setBusqCli] = useState("");
  const [showCli, setShowCli] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const cliente = clientes.find((c) => c.id === clienteId);

  const add = (p) => setItems((it) => {
    const ex = it.find((x) => x.nombre === p.nombre);
    return ex
      ? it.map((x) => (x.nombre === p.nombre ? { ...x, cantidad: x.cantidad + 1 } : x))
      : [...it, { productoId: p.id || null, nombre: p.nombre, precioUnit: p.precio, cantidad: 1 }];
  });
  const sub = (n) => setItems((it) => it.flatMap((x) => (x.nombre !== n ? [x] : x.cantidad > 1 ? [{ ...x, cantidad: x.cantidad - 1 }] : [])));
  const quitar = (n) => setItems((it) => it.filter((x) => x.nombre !== n));

  const total = (cuenta.cargoCancha || 0) + (cuenta.cargoTubo || 0) +
    items.reduce((s, x) => s + x.precioUnit * x.cantidad, 0);
  const filtrados = productos.filter((p) =>
    (cat === "Todo" || p.categoria === cat) &&
    (busqProd === "" || p.nombre.toLowerCase().includes(busqProd.toLowerCase())));
  const cliMatches = busqCli
    ? clientes.filter((c) => c.nombre.toLowerCase().includes(busqCli.toLowerCase())).slice(0, 6)
    : clientes.slice(0, 6);
  const elegir = (c) => { setClienteId(c.id); setClienteNombre(c.nombre); setShowCli(false); setBusqCli(""); };
  const crearYElegir = async () => elegir(await onCrearCliente(busqCli.trim()));
  const entregarPend = (pid) => {
    const np = cliente.pendientes.map((x) => (x.id === pid ? { ...x, cantidad: x.cantidad - 1 } : x)).filter((x) => x.cantidad > 0);
    onUpdCliente(cliente.id, { pendientes: np });
  };

  const armar = () => ({ ...cuenta, clienteId, clienteNombre: clienteNombre.trim(), items, notas, formaPago });
  const guardar = async (cobrar) => {
    setGuardando(true);
    try { await onSave(armar(), cobrar); }
    catch (e) { console.error(e); alert("No se pudo guardar. Revisá la conexión."); }
    setGuardando(false);
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={S.modalSub}>{boxNombre} · {cuenta.estado === "cerrada" ? "esta cuenta ya fue cobrada" : "cuenta abierta — se puede seguir cargando"}</div>
            <div style={S.cliField}>
              <Search size={17} color="#7a808a" />
              <input placeholder="¿Quién es? Buscá o escribí el nombre…" value={showCli ? busqCli : clienteNombre}
                onFocus={() => { setShowCli(true); setBusqCli(""); }}
                onBlur={() => setTimeout(() => setShowCli(false), 150)}
                onChange={(e) => { setBusqCli(e.target.value); setClienteNombre(e.target.value); setClienteId(null); }} style={S.cliInput} />
            </div>
            {showCli && (
              <div style={S.cliDrop}>
                {cliMatches.map((c) => (
                  <button key={c.id} style={S.cliOpt} onMouseDown={() => elegir(c)}>
                    <span style={{ fontWeight: 600 }}>{c.nombre}</span>
                    {c.telefono && <span style={S.cliOptSub}>{c.telefono}</span>}
                  </button>
                ))}
                {busqCli.trim() && !cliMatches.some((c) => c.nombre.toLowerCase() === busqCli.toLowerCase()) && (
                  <button style={{ ...S.cliOpt, color: "#5fe0a1" }} onMouseDown={crearYElegir}>
                    <Plus size={15} /> Crear cliente “{busqCli.trim()}”
                  </button>
                )}
              </div>
            )}
          </div>
          <button style={S.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>

        {cliente && cliente.pendientes?.length > 0 && (
          <div style={S.pendientesBar}>
            <Gift size={16} color="#e8a13c" />
            <span style={{ fontSize: 14, color: "#f2c98a", fontWeight: 700 }}>Tiene pagado de antes:</span>
            {cliente.pendientes.map((p) => (
              <button key={p.id} style={S.pendChip} onClick={() => entregarPend(p.id)}>
                {p.cantidad}× {p.descripcion} — tocá al entregar
              </button>
            ))}
          </div>
        )}

        <div style={S.posGrid} className="posGrid">
          <div style={S.catalogo} className="catalogo">
            <div style={S.searchBar}>
              <Search size={16} color="#7a808a" />
              <input placeholder="Buscar producto…" value={busqProd} onChange={(e) => setBusqProd(e.target.value)} style={S.searchInput} />
            </div>
            <div style={S.cats}>{CATS.map((cc) => <button key={cc} onClick={() => setCat(cc)} style={{ ...S.catChip, ...(cat === cc ? S.catChipOn : {}) }}>{cc}</button>)}</div>
            <div style={S.prodGrid}>
              {filtrados.map((p) => {
                const sin = p.stockActual <= 0 && p.categoria !== "Servicio";
                return (
                  <button key={p.id} style={{ ...S.prodCard, ...(sin ? { opacity: 0.45 } : {}) }} onClick={() => add(p)} disabled={sin}>
                    <span style={S.prodName}>{p.nombre}</span>
                    <span style={S.prodPrice}>{GS(p.precio)}</span>
                    {sin && <span style={{ fontSize: 11, color: "#f0a45b", fontWeight: 700 }}>SIN STOCK</span>}
                  </button>
                );
              })}
              {filtrados.length === 0 && <div style={S.empty}>No encontré “{busqProd}”</div>}
            </div>
          </div>

          <div style={S.ticket}>
            <div style={S.ticketLines} className="ticketLines">
              <div style={S.fixedLine}><span>Su parte de cancha</span><b>{GS(cuenta.cargoCancha)}</b></div>
              {(cuenta.cargoTubo > 0 || cuenta.tuboPartes > 0) && <div style={S.fixedLine}><span>Su parte de tubo</span><b>{GS(cuenta.cargoTubo)}</b></div>}
              <div style={S.fixedHint}>Las partes se cambian desde la fila del turno</div>
              {items.length === 0 && <div style={S.ticketEmpty}>Lo que consuma aparece acá.<br />Tocá los productos de la izquierda.</div>}
              {items.map((x) => (
                <div key={x.nombre} style={S.lineRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.lineName}>{x.nombre}</div>
                    <div style={S.lineSub}>{GS(x.precioUnit)} c/u</div>
                  </div>
                  <Stepper small value={x.cantidad}
                    onDelta={(d) => (d > 0 ? add({ id: x.productoId, nombre: x.nombre, precio: x.precioUnit }) : sub(x.nombre))} />
                  <span style={S.lineTot}>{GS(x.precioUnit * x.cantidad)}</span>
                  <button style={S.delBtn} onClick={() => quitar(x.nombre)}><Trash2 size={15} /></button>
                </div>
              ))}
              <div style={S.notasWrap}>
                <StickyNote size={14} color="#7a808a" />
                <textarea placeholder="Anotación (ej: pagó promo de 3 cervezas, llevó 1)…" value={notas} onChange={(e) => setNotas(e.target.value)} style={S.notasInput} rows={2} />
              </div>
            </div>

            <div style={S.totalRow}><span>Debe</span><span style={S.totalNum}>{GS(total)}</span></div>

            <div style={S.pagosWrap}>
              <div style={S.pagosLabel}>¿Cómo paga?</div>
              <div style={S.pagos}>
                {Object.entries(PAGOS).map(([k, v]) => {
                  const Icon = v.icon, on = formaPago === k;
                  return (
                    <button key={k} onClick={() => setFormaPago(k)}
                      style={{ ...S.pagoChip, ...(on ? { borderColor: v.color, color: v.color, background: v.color + "1f" } : {}) }}>
                      <Icon size={16} /> {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={S.actions}>
              <button style={S.saveOpen} disabled={guardando} onClick={() => guardar(false)}>Guardar y dejar abierta</button>
              <button style={S.confirmBtn} disabled={guardando} onClick={() => guardar(true)}>
                <Check size={19} /> {guardando ? "Guardando…" : `Cobrar ${GS(total)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
