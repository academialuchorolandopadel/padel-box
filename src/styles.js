/* Sistema de estilos compartido — paleta y tamaños pensados para mostrador:
   NARANJA = debe/pendiente · VERDE = pagó/ok · botones mín. 44px */
export const S = {
  app: { minHeight: "100vh", background: "#0e1116", color: "#eef0f3", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", fontSize: 15, paddingBottom: 80 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #1c222b", background: "#12161d", position: "sticky", top: 0, zIndex: 30, gap: 12 },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#3fbf81,#1f8a57)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15, color: "#06150d" },
  brandName: { fontWeight: 800, fontSize: 17 },
  brandSub: { fontSize: 12.5, color: "#8b93a0", textTransform: "capitalize" },
  desktopNav: { display: "flex", gap: 4, alignItems: "center" },
  gear: { background: "#1a212b", border: "none", color: "#aeb4be", width: 40, height: 40, borderRadius: 10, cursor: "pointer", display: "grid", placeItems: "center", marginLeft: 6 },

  tabBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#8b93a0", fontWeight: 600, cursor: "pointer", fontSize: 12, position: "relative", minWidth: 64 },
  tabBtnOn: { background: "#1d2530", color: "#fff" },
  tabLabel: { fontSize: 12, fontWeight: 700 },
  tabBadge: { position: "absolute", top: 4, right: 10, background: "#e8a13c", color: "#1a1206", fontSize: 10, fontWeight: 800, borderRadius: 20, padding: "1px 6px" },

  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", background: "#12161d", borderTop: "1px solid #1c222b", padding: "6px 4px calc(8px + env(safe-area-inset-bottom))", zIndex: 30 },
  sheet: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#161c25", borderRadius: "18px 18px 0 0", padding: "10px 16px 28px", display: "flex", flexDirection: "column", gap: 4, zIndex: 60 },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, background: "#2a313c", margin: "4px auto 12px" },
  sheetItem: { display: "flex", alignItems: "center", gap: 14, padding: "15px 12px", borderRadius: 12, border: "none", background: "transparent", color: "#eef0f3", fontWeight: 700, fontSize: 16, cursor: "pointer", textAlign: "left" },

  main: { padding: "18px 16px", maxWidth: 1140, margin: "0 auto" },
  h2: { fontSize: 21, fontWeight: 800, margin: "0 0 16px" },
  h3: { fontSize: 13, fontWeight: 800, color: "#aeb4be", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.7 },
  adminTag: { fontSize: 12, background: "#5b8def22", color: "#9bb8f5", padding: "3px 9px", borderRadius: 6, marginLeft: 10, verticalAlign: "middle", fontWeight: 700 },
  pageHead: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 },
  pageHint: { color: "#8b93a0", fontSize: 14, margin: "0 0 18px", lineHeight: 1.5 },

  statsStrip: { display: "flex", alignItems: "center", gap: 16, background: "#141a22", border: "1px solid #1c222b", borderRadius: 13, padding: "13px 18px", marginBottom: 16, flexWrap: "wrap" },
  stat: { display: "flex", flexDirection: "column", gap: 2 },
  statLabel: { fontSize: 12, color: "#8b93a0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 },
  statVal: { fontSize: 19, fontWeight: 800 },
  statDiv: { width: 1, alignSelf: "stretch", background: "#222a35" },

  boxTabs: { display: "flex", gap: 8, marginBottom: 14 },
  boxTab: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 8px", borderRadius: 12, border: "1.5px solid #1c222b", background: "#141a22", color: "#8b93a0", fontWeight: 800, fontSize: 16, cursor: "pointer", minHeight: 52 },
  boxTabOn: { background: "#152a1f", color: "#fff", borderColor: "#3fbf81" },
  boxTabCount: { fontSize: 12.5, background: "#e8a13c", color: "#1a1206", borderRadius: 20, padding: "1px 8px", fontWeight: 800 },
  boxBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 },
  boxBarRate: { fontSize: 14, color: "#aeb4be" },
  primaryBtn: { display: "flex", alignItems: "center", gap: 7, padding: "13px 18px", borderRadius: 11, border: "none", background: "#3fbf81", color: "#06150d", fontWeight: 800, fontSize: 15, cursor: "pointer", minHeight: 46 },
  fijoBtn: { display: "flex", alignItems: "center", gap: 7, padding: "13px 16px", borderRadius: 11, border: "1.5px solid #5b8def", background: "transparent", color: "#9bb8f5", fontWeight: 800, fontSize: 14, cursor: "pointer", minHeight: 46 },

  turnoCard: { background: "#141a22", border: "1px solid #1c222b", borderRadius: 15, marginBottom: 16, overflow: "hidden" },
  turnoCardFijo: { background: "#10172a", border: "2px solid #5b8def", boxShadow: "0 0 0 1px #5b8def33" },
  turnoHeadFijo: { background: "#142046", borderBottom: "1px solid #2c3f6e" },
  turnoHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "13px 15px", background: "#111620", borderBottom: "1px solid #1c222b", flexWrap: "wrap" },
  turnoHeadL: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  turnoHeadR: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  timeInput: { background: "#0d1117", border: "1px solid #2a313c", color: "#eef0f3", borderRadius: 9, padding: "8px 9px", fontSize: 14.5, fontWeight: 700, minHeight: 40 },
  horaCtl: { display: "flex", alignItems: "center", gap: 6, background: "#0d1117", border: "1px solid #2a313c", borderRadius: 10, padding: "4px 8px" },
  horaLbl: { fontSize: 11.5, color: "#8b93a0", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3, marginRight: 2 },
  horaBtn: { width: 28, height: 28, borderRadius: 7, border: "none", background: "#242c38", color: "#aeb4be", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 },
  horaVal: { minWidth: 70, textAlign: "center", fontWeight: 800, fontSize: 17, color: "#eef0f3" },
  obsequiosBar: { display: "flex", flexDirection: "column", gap: 8, padding: "11px 15px", background: "#221a0e", borderBottom: "1px solid #2a2012" },
  obsequiosLbl: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#f2c98a", fontWeight: 700 },
  obsequioChip: { background: "#2a2012", border: "1px solid #e8a13c66", color: "#f2c98a", borderRadius: 8, padding: "8px 13px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", minHeight: 40 },
  turnoMeta: { fontSize: 13.5, color: "#8b93a0", fontWeight: 700 },
  tagFijo: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#9bb8f5", border: "1px solid #5b8def55", borderRadius: 7, padding: "4px 10px" },
  tagOk: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 800, color: "#5fe0a1", border: "1px solid #3fbf8155", background: "#13251b", borderRadius: 8, padding: "5px 11px" },
  tagDebe: { fontSize: 13, fontWeight: 800, color: "#f2b659", border: "1px solid #e8a13c66", background: "#2a2012", borderRadius: 8, padding: "5px 11px" },
  iconBtnSm: { background: "#1a212b", border: "none", color: "#8b93a0", width: 38, height: 38, borderRadius: 9, cursor: "pointer", display: "grid", placeItems: "center" },

  splitPanel: { padding: "12px 15px", background: "#0e1218", borderBottom: "1px solid #1c222b", display: "flex", flexDirection: "column", gap: 10 },
  splitRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  splitLabel: { fontSize: 14, fontWeight: 800, color: "#c4c9d0", width: 58 },
  splitWord: { color: "#6a707a", fontSize: 13.5, fontWeight: 600 },
  montoInput: { width: 105, background: "#161c25", border: "1px solid #2a313c", color: "#eef0f3", borderRadius: 9, padding: "8px 9px", fontWeight: 700, fontSize: 14.5, textAlign: "right", minHeight: 40 },
  splitPer: { fontSize: 13.5, color: "#5fe0a1", fontWeight: 700 },
  splitPrepago: { fontSize: 14, color: "#9bb8f5", fontWeight: 700 },
  coverTag: { fontSize: 12, fontWeight: 800, borderRadius: 7, padding: "4px 10px", marginLeft: "auto" },
  coverOk: { color: "#5fe0a1", background: "#13251b" },
  coverFalta: { color: "#f2b659", background: "#2a2012" },
  toggle: { background: "#161c25", border: "1.5px solid #2a313c", color: "#8b93a0", borderRadius: 9, padding: "8px 16px", fontSize: 14, fontWeight: 800, cursor: "pointer", minHeight: 40 },
  toggleOn: { background: "#13251b", borderColor: "#3fbf81", color: "#5fe0a1" },

  turnoEmpty: { color: "#8b93a0", fontSize: 14.5, padding: "18px 16px", lineHeight: 1.5 },
  turnoFoot: { display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", background: "#111620", borderTop: "1px solid #1c222b", flexWrap: "wrap" },
  addPersona: { display: "flex", alignItems: "center", gap: 7, padding: "11px 16px", borderRadius: 10, border: "1.5px dashed #3fbf8166", background: "transparent", color: "#5fe0a1", fontWeight: 800, fontSize: 14.5, cursor: "pointer", minHeight: 44 },

  cRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderBottom: "1px solid #191f29", flexWrap: "wrap" },
  cName: { display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 130, background: "none", border: "none", color: "#eef0f3", fontWeight: 700, fontSize: 15.5, cursor: "pointer", textAlign: "left", padding: 0 },
  dot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  partsCell: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  partsTag: { fontSize: 11.5, color: "#8b93a0", fontWeight: 800, textTransform: "uppercase" },
  cobrarBtn: { padding: "10px 15px", borderRadius: 10, border: "none", background: "#e8a13c", color: "#1a1206", fontWeight: 800, fontSize: 13.5, cursor: "pointer", minHeight: 42, whiteSpace: "nowrap" },
  pagadoTag: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, border: "1px solid", borderRadius: 8, padding: "8px 12px", whiteSpace: "nowrap" },
  pill: { fontSize: 12.5, fontWeight: 700, border: "1px solid", borderRadius: 7, padding: "4px 10px" },
  delBtn: { background: "transparent", border: "none", color: "#6a707a", cursor: "pointer", padding: 6 },
  emptyBox: { color: "#8b93a0", fontSize: 15, textAlign: "center", padding: "34px 16px", lineHeight: 1.7, background: "#141a22", border: "1px solid #1c222b", borderRadius: 13 },

  overlay: { position: "fixed", inset: 0, background: "rgba(5,7,10,.72)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 14, zIndex: 50 },
  modal: { width: "min(960px, 100%)", maxHeight: "94vh", background: "#12161d", border: "1px solid #232a35", borderRadius: 17, overflow: "hidden", display: "flex", flexDirection: "column" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "15px 18px", borderBottom: "1px solid #1c222b" },
  modalSub: { color: "#8b93a0", fontSize: 13, marginBottom: 7 },
  iconBtn: { background: "#1a212b", border: "none", color: "#c4c9d0", width: 40, height: 40, borderRadius: 10, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 },
  cliField: { display: "flex", alignItems: "center", gap: 9, background: "#0d1117", border: "1.5px solid #2a313c", borderRadius: 11, padding: "11px 13px" },
  cliInput: { flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 17, fontWeight: 700, outline: "none", minWidth: 0 },
  cliDrop: { position: "absolute", top: "100%", left: 0, right: 46, marginTop: 6, background: "#1a2029", border: "1px solid #2a313c", borderRadius: 11, zIndex: 20, overflow: "hidden", boxShadow: "0 14px 34px rgba(0,0,0,.45)" },
  cliOpt: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "13px 15px", background: "transparent", border: "none", borderBottom: "1px solid #1c222b", color: "#eef0f3", fontSize: 15, cursor: "pointer", textAlign: "left" },
  cliOptSub: { marginLeft: "auto", color: "#8b93a0", fontSize: 12.5 },
  pendientesBar: { display: "flex", alignItems: "center", gap: 9, padding: "11px 17px", background: "#221a0e", borderBottom: "1px solid #2a2012", flexWrap: "wrap" },
  pendChip: { background: "#2a2012", border: "1px solid #e8a13c66", color: "#f2c98a", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" },

  posGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", overflow: "hidden", flex: 1, minHeight: 0 },
  catalogo: { padding: 15, overflowY: "auto", borderRight: "1px solid #1c222b" },
  searchBar: { display: "flex", alignItems: "center", gap: 9, background: "#0d1117", border: "1px solid #2a313c", borderRadius: 10, padding: "10px 13px", marginBottom: 12, minHeight: 44 },
  searchInput: { flex: 1, background: "transparent", border: "none", color: "#eef0f3", fontSize: 15, outline: "none", minWidth: 0 },
  cats: { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 13 },
  catChip: { padding: "8px 14px", borderRadius: 20, border: "1px solid #2a313c", background: "transparent", color: "#8b93a0", fontSize: 13.5, fontWeight: 700, cursor: "pointer", minHeight: 38 },
  catChipOn: { background: "#fff", color: "#0e1116", borderColor: "#fff" },
  prodGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(122px, 1fr))", gap: 9 },
  prodCard: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "13px 12px", borderRadius: 11, border: "1px solid #232a35", background: "#171d26", color: "#eef0f3", cursor: "pointer", textAlign: "left", minHeight: 64 },
  prodName: { fontWeight: 700, fontSize: 13.5, lineHeight: 1.25 },
  prodPrice: { fontSize: 13, color: "#5fe0a1", fontWeight: 800 },
  ticket: { display: "flex", flexDirection: "column", background: "#0e1218" },
  ticketLines: { flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 9 },
  fixedLine: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14.5, color: "#c4c9d0" },
  fixedHint: { fontSize: 12, color: "#5a606b", borderBottom: "1px dashed #232a35", paddingBottom: 9 },
  ticketEmpty: { color: "#5a606b", fontSize: 14, textAlign: "center", padding: "14px 0", lineHeight: 1.6 },
  lineRow: { display: "flex", alignItems: "center", gap: 9 },
  lineName: { fontSize: 14.5, fontWeight: 700 },
  lineSub: { fontSize: 12, color: "#8b93a0" },
  lineTot: { fontSize: 14, fontWeight: 800, width: 80, textAlign: "right" },
  qty: { display: "flex", alignItems: "center", gap: 4, background: "#171d26", borderRadius: 9, padding: 3 },
  qtyBtn: { width: 32, height: 32, borderRadius: 7, border: "none", background: "#242c38", color: "#eef0f3", cursor: "pointer", display: "grid", placeItems: "center" },
  qtyBtnSm: { width: 28, height: 28, borderRadius: 7, border: "none", background: "#242c38", color: "#eef0f3", cursor: "pointer", display: "grid", placeItems: "center" },
  qtyNum: { minWidth: 24, textAlign: "center", fontWeight: 800, fontSize: 14.5 },
  notasWrap: { display: "flex", gap: 9, marginTop: 4, padding: "10px 0 0", borderTop: "1px dashed #232a35" },
  notasInput: { flex: 1, background: "#171d26", border: "1px solid #2a313c", borderRadius: 9, color: "#eef0f3", fontSize: 13.5, padding: "9px 11px", resize: "vertical", fontFamily: "inherit", outline: "none" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderTop: "1px solid #1c222b", fontSize: 16, fontWeight: 800 },
  totalNum: { fontSize: 27, fontWeight: 800, color: "#5fe0a1" },
  pagosWrap: { padding: "0 14px 6px" },
  pagosLabel: { fontSize: 12.5, color: "#8b93a0", fontWeight: 800, margin: "8px 0", textTransform: "uppercase", letterSpacing: 0.4 },
  pagos: { display: "flex", flexWrap: "wrap", gap: 7 },
  pagoChip: { display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 13px", borderRadius: 10, border: "1.5px solid #2a313c", background: "transparent", color: "#8b93a0", fontSize: 14, fontWeight: 700, cursor: "pointer", minHeight: 44 },
  actions: { display: "flex", gap: 9, padding: "12px 14px 16px" },
  saveOpen: { flex: 1, padding: "14px 10px", borderRadius: 11, border: "1.5px solid #2a313c", background: "transparent", color: "#c4c9d0", fontWeight: 700, fontSize: 14, cursor: "pointer", minHeight: 50 },
  confirmBtn: { flex: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 10px", borderRadius: 11, border: "none", background: "#3fbf81", color: "#06150d", fontWeight: 800, fontSize: 15.5, cursor: "pointer", minHeight: 50 },

  fijoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 },
  fijoCard: { background: "#141a22", border: "1px solid #1c222b", borderRadius: 15, padding: 17 },
  fijoTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  fijoSub: { fontSize: 13, color: "#8b93a0", marginTop: 3 },
  fijoPaquete: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  fijoBar: { height: 9, background: "#0d1117", borderRadius: 5, overflow: "hidden", marginBottom: 12 },
  fijoBarFill: { height: "100%", borderRadius: 5 },
  fijoMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#8b93a0", flexWrap: "wrap", gap: 6 },
  fijoBenef: { color: "#9bb8f5", fontWeight: 700 },
  fijoPick: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "14px 15px", background: "#171d26", border: "1px solid #232a35", borderRadius: 11, color: "#eef0f3", cursor: "pointer", textAlign: "left", minHeight: 60 },
  flabel: { display: "block", fontSize: 13, color: "#8b93a0", fontWeight: 700, marginBottom: 6 },
  formRow: { display: "flex", gap: 10, flexWrap: "wrap" },

  cdKpis: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 },
  cdKpi: { background: "#0e1218", border: "1px solid #1c222b", borderRadius: 11, padding: 14 },
  kpiMid: { fontSize: 20, fontWeight: 800, marginTop: 4 },
  cdGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 },
  cdLabel: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#8b93a0", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 9 },
  fieldInput: { width: "100%", background: "#0d1117", border: "1px solid #2a313c", borderRadius: 9, color: "#eef0f3", fontSize: 15, padding: "11px 12px", fontFamily: "inherit", outline: "none", minHeight: 44 },
  pendRow: { display: "flex", alignItems: "center", gap: 9, padding: "7px 0", fontSize: 14.5 },
  addPendBtn: { width: 46, borderRadius: 9, border: "none", background: "#3fbf81", color: "#06150d", cursor: "pointer", display: "grid", placeItems: "center", minHeight: 44 },
  histRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #191f29" },
  pendBadge: { fontSize: 11, background: "#2a2012", color: "#f2c98a", border: "1px solid #e8a13c55", borderRadius: 6, padding: "2px 8px", marginLeft: 8, fontWeight: 800, verticalAlign: "middle" },

  alertBar: { display: "flex", alignItems: "center", gap: 9, background: "#241510", border: "1px solid #d9542b55", color: "#f0a45b", borderRadius: 11, padding: "13px 15px", fontSize: 14, fontWeight: 600, marginBottom: 16, flexWrap: "wrap" },
  repBtn: { background: "#1a212b", border: "1px solid #2a313c", color: "#5fe0a1", borderRadius: 9, padding: "9px 13px", fontSize: 13.5, fontWeight: 800, cursor: "pointer", minHeight: 40 },
  gastoForm: { display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 16, background: "#141a22", border: "1px solid #1c222b", borderRadius: 13, padding: 14 },
  select: { background: "#0d1117", border: "1px solid #2a313c", color: "#eef0f3", borderRadius: 9, padding: "11px 12px", fontSize: 14.5, outline: "none", minHeight: 44 },

  table: { background: "#141a22", border: "1px solid #1c222b", borderRadius: 13, overflow: "hidden" },
  trow: { display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid #191f29", fontSize: 14.5 },
  thead: { color: "#8b93a0", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, background: "#111620" },

  cajaTop: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 11, marginBottom: 14 },
  cajaCard: { background: "#141a22", border: "1px solid #1c222b", borderRadius: 13, padding: 16 },
  cajaIcon: { width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", marginBottom: 10 },
  cajaLabel: { fontSize: 12.5, color: "#8b93a0", fontWeight: 700 },
  cajaMonto: { fontSize: 19, fontWeight: 800, marginTop: 3 },
  cajaTotal: { background: "linear-gradient(135deg,#152a1f,#12161d)", borderColor: "#3fbf8166" },
  cajaResumen: { display: "flex", gap: 18, alignItems: "center", background: "#141a22", border: "1px solid #1c222b", borderRadius: 13, padding: "15px 18px", marginBottom: 22, fontSize: 15, flexWrap: "wrap" },

  repTop: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 11, marginBottom: 22 },
  repKpi: { background: "#141a22", border: "1px solid #1c222b", borderRadius: 13, padding: 17 },
  kpiLabel: { fontSize: 12.5, color: "#8b93a0", fontWeight: 700 },
  kpiBig: { fontSize: 23, fontWeight: 800, marginTop: 6 },
  repCols: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 },
  repBox: { background: "#141a22", border: "1px solid #1c222b", borderRadius: 14, padding: 17 },
  empty: { color: "#5a606b", fontSize: 14, textAlign: "center", padding: "20px 0" },
  prodRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", fontSize: 14.5 },
  prodRank: { width: 24, height: 24, borderRadius: 7, background: "#1d2530", color: "#aeb4be", display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 800 },
  barTrack: { width: 90, height: 7, background: "#1d2530", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", background: "#3fbf81", borderRadius: 4 },
  prodCant: { width: 32, textAlign: "right", fontWeight: 800, color: "#5fe0a1" },

  loginBox: { width: "min(380px, 100%)", background: "#141a22", border: "1px solid #1c222b", borderRadius: 16, padding: 26, display: "flex", flexDirection: "column", gap: 14 },
  loginErr: { color: "#f0a45b", fontSize: 13.5, fontWeight: 600 },
};

export const css = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: #2a313c; border-radius: 4px; }
  button:focus-visible { outline: 2px solid #3fbf81; outline-offset: 2px; }
  input:focus, textarea:focus, select:focus { border-color: #3fbf81; }
  button:disabled { opacity: .45; cursor: not-allowed; }
  button { -webkit-tap-highlight-color: transparent; }
  .bottomNav { display: none; }
  @media (max-width: 900px) {
    .desktopNav { display: none !important; }
    .bottomNav { display: flex !important; }
    .hide-sm { display: none !important; }
    .repCols, .cdGrid { grid-template-columns: 1fr !important; }
    .posGrid { grid-template-columns: 1fr !important; overflow-y: auto !important; }
    .posGrid .catalogo { overflow: visible !important; border-right: none !important; border-bottom: 1px solid #1c222b; }
    .posGrid .ticketLines { overflow: visible !important; }
  }
`;
