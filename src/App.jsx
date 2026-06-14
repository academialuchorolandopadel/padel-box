import React, { useMemo, useState } from "react";
import { where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  BarChart3, LayoutGrid, LogOut, MoreHorizontal, Package, Receipt,
  Repeat, Settings, Users, Wallet,
} from "lucide-react";
import { auth } from "./lib/firebase";
import { S, css } from "./styles";
import { BOXES, hoyISO, inicioMes, totalCuenta } from "./constants";
import { useAuth } from "./hooks/useAuth";
import { useConfig } from "./hooks/useConfig";
import { useColeccion } from "./hooks/useColeccion";
import * as svcTurnos from "./services/turnos";
import * as svcCuentas from "./services/cuentas";
import * as svcFijos from "./services/fijos";
import * as svcClientes from "./services/clientes";
import * as svcVarios from "./services/varios";
import { cargarDatosIniciales } from "./services/setup";

import Login from "./components/Login";
import Canchas from "./components/Canchas";
import CuentaEditor from "./components/CuentaEditor";
import Fijos, { PickFijo } from "./components/Fijos";
import Clientes, { ClienteDetalle } from "./components/Clientes";
import Stock from "./components/Stock";
import Gastos from "./components/Gastos";
import Caja from "./components/Caja";
import Reportes from "./components/Reportes";
import Ajustes from "./components/Ajustes";

export default function App() {
  const { user, perfil, cargando } = useAuth();
  if (cargando) return <Pantalla mensaje="Cargando…" />;
  if (!user) return <Login />;
  if (!perfil) return <Login usuarioSinRol />;
  return <Sistema perfil={perfil} />;
}

function Pantalla({ mensaje }) {
  return (
    <div style={{ ...S.app, display: "grid", placeItems: "center", paddingBottom: 0 }}>
      <style>{css}</style>
      <div style={{ color: "#8b93a0", fontWeight: 700 }}>{mensaje}</div>
    </div>
  );
}

const TABS = [
  { id: "canchas", label: "Canchas", icon: LayoutGrid, daily: true },
  { id: "fijos", label: "Fijos", icon: Repeat, daily: true },
  { id: "caja", label: "Caja", icon: Wallet, daily: true },
  { id: "clientes", label: "Clientes", icon: Users, daily: true },
  { id: "stock", label: "Stock", icon: Package, daily: false },
  { id: "gastos", label: "Gastos", icon: Receipt, daily: false },
  { id: "reportes", label: "Reportes", icon: BarChart3, daily: false, soloAdmin: true },
];

function Sistema({ perfil }) {
  const esAdmin = perfil.rol === "admin";
  const hoy = hoyISO();
  const [tab, setTab] = useState("canchas");
  const [activeBox, setActiveBox] = useState("box1");
  const [editing, setEditing] = useState(null);
  const [verCliente, setVerCliente] = useState(null);
  const [ajustes, setAjustes] = useState(false);
  const [pickFijo, setPickFijo] = useState(false);
  const [masMenu, setMasMenu] = useState(false);

  const config = useConfig();

  /* --- suscripciones en vivo (acotadas para no leer de más) --- */
  const { docs: turnos } = useColeccion("turnos", [where("fecha", "==", hoy)], [hoy]);
  const { docs: abiertas } = useColeccion("cuentas", [where("estado", "==", "abierta")]);
  const { docs: cerradasHoy } = useColeccion("cuentas",
    [where("estado", "==", "cerrada"), where("fecha", "==", hoy)], [hoy]);
  const { docs: clientes } = useColeccion("clientes");
  const { docs: productos, cargando: cargandoProd } = useColeccion("productos");
  const { docs: fijos } = useColeccion("fijos");
  const { docs: gastos } = useColeccion("gastos",
    [where("fecha", ">=", inicioMes()), where("fecha", "<=", hoy)], [hoy]);

  const cuentas = useMemo(() => [...abiertas, ...cerradasHoy], [abiertas, cerradasHoy]);
  const stockBajo = productos.filter((p) => p.categoria !== "Servicio" && p.stockActual <= p.stockMinimo).length;
  const cobradoHoy = cerradasHoy.reduce((s, c) => s + totalCuenta(c), 0);

  const tabsVisibles = TABS.filter((t) => !t.soloAdmin || esAdmin);

  const TabIcon = ({ t }) => {
    const Icon = t.icon;
    const on = tab === t.id;
    return (
      <button onClick={() => { setTab(t.id); setMasMenu(false); }}
        style={{ ...S.tabBtn, ...(on ? S.tabBtnOn : {}) }}>
        <Icon size={20} />
        <span style={S.tabLabel}>{t.label}</span>
        {t.id === "stock" && stockBajo > 0 && <span style={S.tabBadge}>{stockBajo}</span>}
      </button>
    );
  };

  return (
    <div style={S.app}>
      <style>{css}</style>

      <header style={S.header}>
        <div style={S.brand}>
          <div style={S.logo}>PB</div>
          <div>
            <div style={S.brandName}>Padel Box</div>
            <div style={S.brandSub}>
              {new Date().toLocaleDateString("es-PY", { weekday: "long", day: "numeric", month: "long" })} · {perfil.nombre || perfil.rol}
            </div>
          </div>
        </div>
        <nav style={S.desktopNav} className="desktopNav">
          {tabsVisibles.map((t) => <TabIcon key={t.id} t={t} />)}
          <button style={S.gear} onClick={() => setAjustes(true)} title="Precios"><Settings size={19} /></button>
          <button style={S.gear} onClick={() => signOut(auth)} title="Salir"><LogOut size={18} /></button>
        </nav>
      </header>

      <main style={S.main}>
        {esAdmin && !cargandoProd && productos.length === 0 && <SetupBanner />}
        {tab === "canchas" && (
          <>
            <div style={S.statsStrip}>
              <div style={S.stat}>
                <span style={S.statLabel}>Cobrado hoy</span>
                <span style={{ ...S.statVal, color: "#5fe0a1" }}>{"₲ " + Math.round(cobradoHoy).toLocaleString("es-PY")}</span>
              </div>
              <div style={S.statDiv} />
              <div style={S.stat}>
                <span style={S.statLabel}>Cuentas abiertas</span>
                <span style={{ ...S.statVal, color: abiertas.length ? "#f2b659" : "#8b93a0" }}>
                  {abiertas.length} · {"₲ " + Math.round(abiertas.reduce((s, c) => s + totalCuenta(c), 0)).toLocaleString("es-PY")}
                </span>
              </div>
            </div>
            <Canchas
              activeBox={activeBox} setActiveBox={setActiveBox} config={config}
              turnos={turnos} cuentas={cuentas} fijos={fijos}
              onNuevoTurno={(boxId) => svcTurnos.crearTurno(boxId, config)}
              onUpdTurno={(turno, patch, lista) => svcTurnos.actualizarTurno(turno, patch, lista, config)}
              onBorrarTurno={(turnoId, lista) => svcTurnos.borrarTurno(turnoId, lista)}
              onRepartir={(turno, campo, lista) => svcTurnos.repartirParejo(turno, campo, lista)}
              onSetPartes={(cuenta, campo, delta, turno) => svcCuentas.cambiarPartes(cuenta, campo, delta, turno)}
              onPickFijo={() => setPickFijo(true)}
              onEdit={setEditing}
              onNueva={(turno) => setEditing({
                turnoId: turno.id, boxId: turno.boxId, fecha: hoy,
                clienteId: null, clienteNombre: "",
                canchaPartes: 1, tuboPartes: 0,
                cargoCancha: Math.round(turno.canchaTotal / turno.canchaPartes) || 0,
                cargoTubo: 0, items: [], notas: "", estado: "abierta", formaPago: null,
              })}
              onReabrir={svcCuentas.reabrirCuenta}
              onBorrarCuenta={svcCuentas.borrarCuenta}
            />
          </>
        )}
        {tab === "fijos" && (
          <Fijos fijos={fijos} clientes={clientes}
            onAgregar={svcFijos.crearFijo} onBorrar={svcFijos.borrarFijo}
            onUsar={async (f) => { await svcFijos.usarFijo(f); setActiveBox(f.boxId); setTab("canchas"); }} />
        )}
        {tab === "clientes" && <Clientes clientes={clientes} onVer={setVerCliente} />}
        {tab === "stock" && <Stock productos={productos} onReponer={svcVarios.reponerStock} onCrear={svcVarios.crearProducto} onActualizar={svcVarios.actualizarProducto} onBorrar={svcVarios.borrarProducto} esAdmin={esAdmin} />}
        {tab === "gastos" && <Gastos gastos={gastos} onAgregar={svcVarios.crearGasto} onBorrar={svcVarios.borrarGasto} esAdmin={esAdmin} />}
        {tab === "caja" && <Caja cerradasHoy={cerradasHoy} abiertas={abiertas} gastosHoy={gastos.filter((g) => g.fecha === hoy)} onEdit={setEditing} />}
        {tab === "reportes" && esAdmin && <Reportes gastos={gastos} />}
      </main>

      <nav style={S.bottomNav} className="bottomNav">
        {tabsVisibles.filter((t) => t.daily).map((t) => <TabIcon key={t.id} t={t} />)}
        <button onClick={() => setMasMenu(true)}
          style={{ ...S.tabBtn, ...(["stock", "gastos", "reportes"].includes(tab) ? S.tabBtnOn : {}) }}>
          <MoreHorizontal size={20} />
          <span style={S.tabLabel}>Más</span>
          {stockBajo > 0 && <span style={S.tabBadge}>{stockBajo}</span>}
        </button>
      </nav>

      {masMenu && (
        <div style={S.overlay} onClick={() => setMasMenu(false)}>
          <div style={S.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={S.sheetHandle} />
            {tabsVisibles.filter((t) => !t.daily).map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} style={S.sheetItem} onClick={() => { setTab(t.id); setMasMenu(false); }}>
                  <Icon size={20} /> {t.label}
                  {t.id === "stock" && stockBajo > 0 && <span style={{ ...S.tabBadge, position: "static", marginLeft: "auto" }}>{stockBajo} bajo mínimo</span>}
                </button>
              );
            })}
            <button style={S.sheetItem} onClick={() => { setAjustes(true); setMasMenu(false); }}>
              <Settings size={20} /> Precios
            </button>
            <button style={S.sheetItem} onClick={() => signOut(auth)}>
              <LogOut size={20} /> Salir
            </button>
          </div>
        </div>
      )}

      {editing && (
        <CuentaEditor
          cuenta={editing}
          boxNombre={BOXES.find((b) => b.id === editing.boxId)?.nombre || ""}
          productos={productos} clientes={clientes}
          onCrearCliente={svcClientes.crearCliente}
          onUpdCliente={svcClientes.actualizarCliente}
          onClose={() => setEditing(null)}
          onSave={async (cuenta, cobrar) => { await svcCuentas.guardarCuenta(cuenta, cobrar); setEditing(null); }}
        />
      )}
      {verCliente && (
        <ClienteDetalle
          cliente={clientes.find((c) => c.id === verCliente)}
          onUpd={svcClientes.actualizarCliente}
          onClose={() => setVerCliente(null)}
        />
      )}
      {ajustes && <Ajustes config={config} esAdmin={esAdmin} onClose={() => setAjustes(false)} />}
      {pickFijo && (
        <PickFijo fijos={fijos.filter((f) => f.restante > 0)}
          onUsar={async (f) => { await svcFijos.usarFijo(f); setActiveBox(f.boxId); setPickFijo(false); }}
          onClose={() => setPickFijo(false)} />
      )}
    </div>
  );
}
/* Banner de configuración inicial: aparece solo para el admin cuando todavía
   no hay productos cargados. Reemplaza al script de terminal. */
function SetupBanner() {
  const [estado, setEstado] = useState("idle"); // idle | cargando | ok | error
  const [creados, setCreados] = useState(0);

  const cargar = async () => {
    setEstado("cargando");
    try {
      const n = await cargarDatosIniciales();
      setCreados(n);
      setEstado("ok");
    } catch (e) {
      console.error(e);
      setEstado("error");
    }
  };

  const box = {
    background: "linear-gradient(135deg,#152a1f,#141a22)",
    border: "1px solid #3fbf8166", borderRadius: 14, padding: 20, marginBottom: 18,
  };

  if (estado === "ok") {
    return (
      <div style={box}>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: "#5fe0a1" }}>✓ Listo</div>
        <div style={{ color: "#c4c9d0", lineHeight: 1.6 }}>
          Se cargaron {creados} productos y la lista de precios. Ya podés empezar a usar el sistema.
          Si necesitás ajustar precios, entrá a <b>Precios</b> (engranaje arriba).
        </div>
      </div>
    );
  }

  return (
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>👋 Configuración inicial</div>
      <div style={{ color: "#c4c9d0", lineHeight: 1.6, marginBottom: 14 }}>
        Es la primera vez que entrás. Tocá el botón para cargar la lista de precios y los
        productos del club (agua, cervezas, comidas, etc.). Lo hacés una sola vez.
      </div>
      {estado === "error" && (
        <div style={{ color: "#f0a45b", fontSize: 13.5, marginBottom: 10 }}>
          No se pudo cargar. Revisá tu conexión y que tu usuario tenga rol <b>admin</b>.
        </div>
      )}
      <button style={{ ...S.confirmBtn, flex: "none" }} disabled={estado === "cargando"} onClick={cargar}>
        {estado === "cargando" ? "Cargando…" : "Cargar productos y precios"}
      </button>
    </div>
  );
}
