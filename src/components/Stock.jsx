import React, { useState } from "react";
import { AlertTriangle, Check, Gift, Plus, Search, Trash2, X } from "lucide-react";
import { S } from "../styles";
import { GS } from "../constants";

const CATS_REALES = ["Bebida", "Cerveza", "Comida", "Servicio", "Otros"];

export default function Stock({ productos, onReponer, onCrear, onActualizar, onBorrar, esAdmin }) {
  const [q, setQ] = useState("");
  const [editando, setEditando] = useState(null); // producto a editar, o {} para nuevo

  const lista = productos
    .filter((p) => (p.nombre || "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  const bajos = lista.filter((p) => p.categoria !== "Servicio" && p.stockActual <= p.stockMinimo);

  return (
    <div>
      <div style={S.pageHead}>
        <h2 style={S.h2}>Stock</h2>
        {esAdmin && <button style={S.primaryBtn} onClick={() => setEditando({})}><Plus size={17} /> Nuevo producto</button>}
      </div>
      {bajos.length > 0 && (
        <div style={S.alertBar}><AlertTriangle size={17} /> Hay que reponer: <b>{bajos.map((p) => p.nombre).join(", ")}</b></div>
      )}
      <div style={{ ...S.searchBar, maxWidth: 380, marginBottom: 16 }}>
        <Search size={16} color="#7a808a" />
        <input placeholder="Buscar producto…" value={q} onChange={(e) => setQ(e.target.value)} style={S.searchInput} />
      </div>
      <p style={S.pageHint}>Tocá un producto para cambiar su nombre, precio o stock. Los botones +6 / +12 suman cuando llega mercadería.</p>
      <div style={S.table}>
        <div style={{ ...S.trow, ...S.thead }}>
          <span style={{ flex: 1 }}>Producto</span>
          <span style={{ width: 90, textAlign: "right" }} className="hide-sm">Precio</span>
          <span style={{ width: 80, textAlign: "center" }}>Quedan</span>
          <span style={{ width: 130, textAlign: "right" }}>Llegó mercadería</span>
        </div>
        {lista.map((p) => {
          const servicio = p.categoria === "Servicio";
          const bajo = !servicio && p.stockActual <= p.stockMinimo;
          return (
            <div key={p.id} style={S.trow}>
              <button style={{ flex: 1, minWidth: 0, background: "none", border: "none", color: "inherit", textAlign: "left", cursor: "pointer", padding: 0, fontWeight: 600, fontSize: 15 }} onClick={() => setEditando(p)}>
                {p.nombre}
                {bajo && <span style={{ ...S.pendBadge, color: "#f0a45b", borderColor: "#f0a45b55", background: "#2b1f12" }}>reponer</span>}
                <span style={{ display: "block", fontSize: 12, color: "#6a707a", fontWeight: 500 }}>{p.categoria} · tocá para editar</span>
              </button>
              <span style={{ width: 90, textAlign: "right", color: "#8b93a0" }} className="hide-sm">{GS(p.precio)}</span>
              <span style={{ width: 80, textAlign: "center", fontWeight: 800, fontSize: 16, color: servicio ? "#6a707a" : bajo ? "#f0a45b" : "#5fe0a1" }}>
                {servicio ? "—" : p.stockActual}
              </span>
              <span style={{ width: 130, textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                {servicio ? <span style={{ color: "#6a707a", fontSize: 12.5 }}>sin stock</span> : <>
                  <button style={S.repBtn} onClick={() => onReponer(p.id, 6)}>+6</button>
                  <button style={S.repBtn} onClick={() => onReponer(p.id, 12)}>+12</button>
                </>}
              </span>
            </div>
          );
        })}
        {lista.length === 0 && <div style={S.emptyBox}>No hay productos que coincidan con la búsqueda.</div>}
      </div>

      {editando && (
        <ProductoEditor producto={editando} esAdmin={esAdmin} productos={productos}
          onClose={() => setEditando(null)}
          onCrear={onCrear} onActualizar={onActualizar} onBorrar={onBorrar} />
      )}
    </div>
  );
}

function ProductoEditor({ producto, esAdmin, productos, onClose, onCrear, onActualizar, onBorrar }) {
  const esNuevo = !producto.id;
  const [nombre, setNombre] = useState(producto.nombre || "");
  const [precio, setPrecio] = useState(producto.precio ?? "");
  const [categoria, setCategoria] = useState(producto.categoria || "Bebida");
  const [stockActual, setStockActual] = useState(producto.stockActual ?? 0);
  const [stockMinimo, setStockMinimo] = useState(producto.stockMinimo ?? 0);
  const [esPromo, setEsPromo] = useState(!!producto.descuentaId);
  const [descuentaId, setDescuentaId] = useState(producto.descuentaId || "");
  const [descuentaCant, setDescuentaCant] = useState(producto.descuentaCant || 3);
  const [guardando, setGuardando] = useState(false);
  const esServicio = categoria === "Servicio";

  // productos que pueden ser "base" (no servicios, y distintos de este mismo)
  const baseOpciones = (productos || []).filter((p) => p.categoria !== "Servicio" && p.id !== producto.id);

  const guardar = async () => {
    if (!nombre.trim()) { alert("Ponele un nombre al producto."); return; }
    setGuardando(true);
    try {
      const data = { nombre: nombre.trim(), precio, categoria,
        stockActual: esServicio ? 999 : stockActual, stockMinimo: esServicio ? 0 : stockMinimo,
        descuentaId: esPromo && descuentaId ? descuentaId : null,
        descuentaCant: esPromo && descuentaId ? Number(descuentaCant) || 1 : null };
      if (esNuevo) await onCrear(data);
      else await onActualizar(producto.id, data);
      onClose();
    } catch (e) { console.error(e); alert("No se pudo guardar. Revisá la conexión."); setGuardando(false); }
  };

  const borrar = async () => {
    if (!confirm(`¿Borrar "${producto.nombre}"? Esto no se puede deshacer.`)) return;
    setGuardando(true);
    try { await onBorrar(producto.id); onClose(); }
    catch (e) { console.error(e); alert("No se pudo borrar."); setGuardando(false); }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: "min(460px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>{esNuevo ? "Nuevo producto" : "Editar producto"}</div>
          <button style={S.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={S.flabel}>Nombre</label>
            <input style={S.fieldInput} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Coca 500" />
          </div>
          <div style={S.formRow}>
            <div style={{ flex: 1 }}>
              <label style={S.flabel}>Precio de venta</label>
              <input style={S.fieldInput} type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.flabel}>Categoría</label>
              <select style={S.select} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {CATS_REALES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {!esServicio && (
            <div style={S.formRow}>
              <div style={{ flex: 1 }}>
                <label style={S.flabel}>Stock actual (cuántos hay)</label>
                <input style={S.fieldInput} type="number" value={stockActual} onChange={(e) => setStockActual(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.flabel}>Avisar cuando baje de</label>
                <input style={S.fieldInput} type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
              </div>
            </div>
          )}
          {esServicio && <p style={{ color: "#8b93a0", fontSize: 13.5, margin: 0 }}>Los servicios (alquiler de pala, tubo, parrilla…) no llevan control de stock.</p>}

          {!esServicio && baseOpciones.length > 0 && (
            <div style={{ borderTop: "1px solid #1c222b", paddingTop: 14 }}>
              <button onClick={() => setEsPromo((v) => !v)}
                style={{ ...S.toggle, ...(esPromo ? S.toggleOn : {}), width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Gift size={16} /> {esPromo ? "Es una promo (descuenta otro producto)" : "¿Es una promo? (ej: 3 cervezas)"}
              </button>
              {esPromo && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ color: "#8b93a0", fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>
                    Al vender esta promo se descuenta del stock de otro producto. Ej: “Munich promo” descuenta 3 de “Munich mediano”.
                  </p>
                  <div style={S.formRow}>
                    <div style={{ flex: 2 }}>
                      <label style={S.flabel}>Descuenta de</label>
                      <select style={S.select} value={descuentaId} onChange={(e) => setDescuentaId(e.target.value)}>
                        <option value="">— Elegir producto —</option>
                        {baseOpciones.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={S.flabel}>Cuántas unidades</label>
                      <input style={S.fieldInput} type="number" min="1" value={descuentaCant} onChange={(e) => setDescuentaCant(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button style={{ ...S.confirmBtn, width: "100%", flex: "none", marginTop: 4 }} disabled={guardando} onClick={guardar}>
            <Check size={18} /> {guardando ? "Guardando…" : esNuevo ? "Crear producto" : "Guardar cambios"}
          </button>

          {!esNuevo && esAdmin && (
            <button style={{ ...S.saveOpen, width: "100%", color: "#f0a45b", borderColor: "#f0a45b55", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={guardando} onClick={borrar}>
              <Trash2 size={16} /> Borrar producto
            </button>
          )}
          {!esNuevo && !esAdmin && (
            <p style={{ color: "#6a707a", fontSize: 12.5, textAlign: "center", margin: 0 }}>Solo el administrador puede borrar productos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
