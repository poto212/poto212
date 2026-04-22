const STORAGE_KEY = "poto212-demo-db-v1";
const USERS_KEY = "poto212-users-v1";
const SESSION_KEY = "poto212-session-v1";
const MODE_KEY = "poto212-data-mode-v1";
const API_BASE = window.__API_BASE__ || "http://localhost:4000";

const seedUsers = [
  { username: "admin", nombre: "Administrador", rol: "admin", password: "admin123", activo: true },
  { username: "vendedor", nombre: "Usuario Ventas", rol: "vendedor", password: "vendedor123", activo: true },
  { username: "tesoreria", nombre: "Usuario Tesorería", rol: "tesoreria", password: "tesoreria123", activo: true },
  { username: "contador", nombre: "Usuario Contador", rol: "contador", password: "contador123", activo: true }
];

const rolePermissions = {
  admin: {
    modules: ["inicio", "ingresos", "egresos", "base_datos", "informes", "tesoreria"],
    actions: ["*"]
  },
  vendedor: {
    modules: ["inicio", "ingresos", "informes"],
    actions: ["ingresos:create_factura", "ingresos:solicitar_cae", "ingresos:imprimir", "ingresos:emitir_pdf", "ingresos:enviar_email", "informes:generar", "informes:export"]
  },
  tesoreria: {
    modules: ["inicio", "egresos", "tesoreria", "informes"],
    actions: ["egresos:create", "tesoreria:view", "informes:generar", "informes:export"]
  },
  contador: {
    modules: ["inicio", "informes", "base_datos"],
    actions: ["informes:generar", "informes:export", "base_datos:view"]
  }
};

const monthlyData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  ventas: [900000, 1100000, 980000, 1240000, 1180000, 1320000, 1270000, 1360000, 1490000, 1430000, 1570000, 1660000],
  otrosIngresos: [140000, 160000, 130000, 180000, 175000, 190000, 205000, 188000, 197000, 210000, 220000, 240000]
};

const ingresosRows = [
  ["Venta", "FAC-000231", "Ferretería Sur", "04/03/2026", "Confirmada", 128000],
  ["Presupuesto", "PRE-000119", "Casa Delta", "04/03/2026", "Enviado", 79000],
  ["Otro ingreso", "ING-000088", "Servicio técnico", "03/03/2026", "Cobrado", 35000],
  ["Venta", "FAC-000230", "Electro Norte", "03/03/2026", "Pendiente", 214000]
];

const seedDb = {
  clientes: [
    { id: "C001", nombre: "ArgenTech SRL", cuit: "30-71234567-8", telefono: "11-4444-1111", localidad: "CABA", condicionIVA: "Responsable Inscripto", email: "compras@argentech.com" },
    { id: "C002", nombre: "Comercial Nexo", cuit: "30-71999888-0", telefono: "341-555-1212", localidad: "Rosario", condicionIVA: "Consumidor Final", email: "admin@comercialnexo.com" }
  ],
  proveedores: [
    { id: "P001", nombre: "Acero SA", cuit: "30-70123456-1", telefono: "11-4333-9988", localidad: "CABA" },
    { id: "P002", nombre: "Insumos Delta", cuit: "30-66555111-4", telefono: "351-499-8877", localidad: "Córdoba" }
  ],
  productos: [
    { id: "PR001", nombre: "Cable USB-C", codigo: "USB-C-01", stock: 3, costo: 2500, precio: 5200, categoria: "Accesorios" },
    { id: "PR002", nombre: "Router Mesh X1", codigo: "RT-MX1", stock: 2, costo: 55000, precio: 82000, categoria: "Redes" }
  ],
  egresos: [
    { tipo: "Compra", proveedor: "Acero SA", categoria: "Insumos", fecha: "2026-03-04", vencimiento: "2026-03-15", estado: "Pendiente", monto: 198000, nota: "" },
    { tipo: "Gasto", proveedor: "Insumos Delta", categoria: "Servicios", fecha: "2026-03-03", vencimiento: "2026-03-03", estado: "Pagado", monto: 32000, nota: "Internet" }
  ]
};

let appMode = loadMode();
let db = loadDb();
let users = loadUsers();
let currentSession = getSession();
let activeEntity = "clientes";
let editingId = null;
let reportesChart;
let egresosEventsBound = false;
let informeRows = [];
let facturas = [];
let afipConfig = { puntoVenta: 1, cuit: "30-99999999-7", modo: "demo" };
let smtpConfig = { linked: false, from: "", host: "" };
let facturaActual = null;

function isApiMode() {
  return appMode === "api";
}

function loadMode() {
  const urlMode = new URLSearchParams(window.location.search).get("mode");
  if (urlMode === "api" || urlMode === "demo") {
    localStorage.setItem(MODE_KEY, urlMode);
    return urlMode;
  }
  return localStorage.getItem(MODE_KEY) || "api";
}

function setMode(mode) {
  appMode = mode === "demo" ? "demo" : "api";
  localStorage.setItem(MODE_KEY, appMode);
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (currentSession?.token) headers.Authorization = `Bearer ${currentSession.token}`;
  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Error ${resp.status}`);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

async function hydrateFromApi() {
  const [clientes, proveedores, productos, egresos, usersData, facturasData] = await Promise.all([
    apiRequest("/api/entities/clientes"),
    apiRequest("/api/entities/proveedores"),
    apiRequest("/api/entities/productos"),
    apiRequest("/api/entities/egresos"),
    apiRequest("/api/entities/users").catch(() => []),
    apiRequest("/api/facturas").catch(() => [])
  ]);
  db = { clientes, proveedores, productos, egresos };
  users = usersData;
  facturas = facturasData.map((f) => ({ ...f, condicion: f.condicionIVA }));
}


function loadUsers() {
  if (isApiMode()) return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return structuredClone(seedUsers);
  }
  return JSON.parse(raw);
}

function persistUsers() {
  if (isApiMode()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, rol: user.rol, nombre: user.nombre, token: user.token || null }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function hasModuleAccess(module) {
  if (!currentSession) return false;
  return (rolePermissions[currentSession.rol]?.modules || []).includes(module);
}

function hasAction(permission) {
  if (!currentSession) return false;
  const actions = rolePermissions[currentSession.rol]?.actions || [];
  return actions.includes("*") || actions.includes(permission);
}

function applyPermissionsUi() {
  document.querySelectorAll('.tab').forEach((btn) => {
    const allowed = hasModuleAccess(btn.dataset.module);
    btn.style.display = allowed ? '' : 'none';
  });

  const gated = [
    ["btnSolicitarCAE", "ingresos:solicitar_cae"],
    ["facturaForm", "ingresos:create_factura"],
    ["btnImprimirFactura", "ingresos:imprimir"],
    ["btnPdfFactura", "ingresos:emitir_pdf"],
    ["btnMailFactura", "ingresos:enviar_email"],
    ["egresoForm", "egresos:create"],
    ["informeForm", "informes:generar"],
    ["exportInforme", "informes:export"],
    ["dbExport", "base_datos:export"],
    ["dbReset", "base_datos:reset"],
    ["usuarioForm", "base_datos:manage_users"]
  ];

  gated.forEach(([id, perm]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const allowed = hasAction(perm) || hasModuleAccess('base_datos') && perm === 'base_datos:view';
    if ('disabled' in el) el.disabled = !allowed;
    el.style.opacity = allowed ? '1' : '.55';
  });

  document.getElementById('usuariosPanel').style.display = hasAction('base_datos:manage_users') ? '' : 'none';
  document.getElementById('currentUserLabel').textContent = currentSession ? `${currentSession.nombre} (${currentSession.rol})` : 'Invitado';
}

function renderUsuarios() {
  document.getElementById('usuariosRows').innerHTML = users
    .map((u) => `<tr><td>${u.username}</td><td>${u.nombre}</td><td>${u.rol}</td><td>${u.activo ? 'Activo' : 'Inactivo'}</td></tr>`)
    .join('');
}

function setupAuth() {
  const modal = document.getElementById('loginModal');
  const form = document.getElementById('loginForm');
  const err = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  const showLogin = () => {
    modal.style.display = 'flex';
  };

  const hideLogin = () => {
    modal.style.display = 'none';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (isApiMode()) {
        const result = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: data.username, password: data.password })
        });
        currentSession = { ...result.user, token: result.token };
        setSession(currentSession);
        await hydrateFromApi();
      } else {
        const user = users.find((u) => u.username === data.username && u.password === data.password && u.activo);
        if (!user) throw new Error("Credenciales inválidas");
        currentSession = { username: user.username, rol: user.rol, nombre: user.nombre };
        setSession(user);
      }
      err.textContent = '';
      hideLogin();
      renderUsuarios();
      renderEntityUi();
      refreshProveedorOptions();
      renderFacturas();
      renderEgresos(document.getElementById("egresosSearch")?.value || "");
      applyPermissionsUi();
    } catch (error) {
      err.textContent = error.message || "No se pudo iniciar sesión";
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearSession();
    currentSession = null;
    showLogin();
    applyPermissionsUi();
  });

  if (currentSession) hideLogin(); else showLogin();
}

function loadDb() {
  if (isApiMode()) return { clientes: [], proveedores: [], productos: [], egresos: [] };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDb));
    return structuredClone(seedDb);
  }
  return JSON.parse(raw);
}

function persistDb() {
  if (isApiMode()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const formatMoney = (n) => `$ ${Number(n).toLocaleString("es-AR")}`;
const toDisplayDate = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("es-AR") : "-");

function setKPIs() {
  const ventas = 1660000;
  const ventasPrev = 1570000;
  const cantidad = 148;
  const cantidadPrev = 139;
  const promedio = ventas / cantidad;
  const promedioPrev = ventasPrev / cantidadPrev;

  const set = (id, val) => (document.getElementById(id).textContent = val);
  const delta = (a, b) => (((a - b) / b) * 100).toFixed(1);

  set("ventasCreadas", formatMoney(ventas));
  set("ventaPromedio", formatMoney(Math.round(promedio)));
  set("cantidadVentas", cantidad);
  set("ventasDelta", `${delta(ventas, ventasPrev)}% vs mes anterior`);
  set("promedioDelta", `${delta(promedio, promedioPrev)}% vs mes anterior`);
  set("cantidadDelta", `${delta(cantidad, cantidadPrev)}% vs mes anterior`);
}

function createDashboardCharts() {
  new Chart(document.getElementById("ingresosComposicion"), {
    type: "doughnut",
    data: { labels: ["Ventas", "Otros ingresos"], datasets: [{ data: [1660000, 240000], backgroundColor: ["#2f7ef7", "#60a5fa"] }] }
  });
  new Chart(document.getElementById("egresosComposicion"), {
    type: "doughnut",
    data: { labels: ["Compras", "Gastos"], datasets: [{ data: [690000, 340000], backgroundColor: ["#ef4444", "#f59e0b"] }] }
  });
  new Chart(document.getElementById("mensualChart"), {
    type: "line",
    data: {
      labels: monthlyData.labels,
      datasets: [
        { label: "Ventas", data: monthlyData.ventas, borderColor: "#2f7ef7" },
        { label: "Otros ingresos", data: monthlyData.otrosIngresos, borderColor: "#60a5fa" }
      ]
    }
  });
  new Chart(document.getElementById("cobrarAging"), {
    type: "bar",
    data: { labels: ["A vencer", "Vencido", "0-30", "31-60", "+90"], datasets: [{ data: [520000, 210000, 390000, 240000, 140000], backgroundColor: "#3b82f6" }] }
  });
  new Chart(document.getElementById("pagarAging"), {
    type: "bar",
    data: { labels: ["A vencer", "Vencido", "0-30", "31-60", "+90"], datasets: [{ data: [360000, 180000, 290000, 210000, 110000], backgroundColor: "#ef4444" }] }
  });
}

function fillIngresos() {
  const html = ingresosRows
    .map((row) => `<tr>${row.map((c, i) => `<td>${i === row.length - 1 ? formatMoney(c) : c}</td>`).join("")}</tr>`)
    .join("");
  document.getElementById("ingresosRows").innerHTML = html;
}

function renderEgresos(search = "") {
  const rows = db.egresos.filter((e) => `${e.proveedor} ${e.categoria}`.toLowerCase().includes(search.toLowerCase()));
  document.getElementById("egresosRows").innerHTML = rows
    .map(
      (e) => `<tr><td>${e.tipo}</td><td>${e.proveedor}</td><td>${e.categoria}</td><td>${toDisplayDate(e.fecha)}</td><td>${toDisplayDate(
        e.vencimiento
      )}</td><td>${e.estado}</td><td>${formatMoney(e.monto)}</td></tr>`
    )
    .join("");

  const total = rows.reduce((acc, e) => acc + Number(e.monto), 0);
  const pend = rows.filter((e) => e.estado === "Pendiente").reduce((acc, e) => acc + Number(e.monto), 0);
  document.getElementById("egresosResumen").innerHTML = `
    <div><strong>Total:</strong> ${formatMoney(total)}</div>
    <div><strong>Pendiente:</strong> ${formatMoney(pend)}</div>
    <div><strong>Registros:</strong> ${rows.length}</div>
  `;

  renderInformes();
}

function refreshProveedorOptions() {
  const providerSelect = document.getElementById("egresoProveedor");
  providerSelect.innerHTML = db.proveedores.map((p) => `<option>${p.nombre}</option>`).join("");
}

function setupEgresos() {
  refreshProveedorOptions();
  if (egresosEventsBound) return;

  document.getElementById("egresoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.monto = Number(data.monto);
    if (isApiMode()) {
      const created = await apiRequest("/api/entities/egresos", { method: "POST", body: JSON.stringify(data) });
      db.egresos.unshift(created);
    } else {
      db.egresos.unshift(data);
      persistDb();
    }
    e.target.reset();
    renderEgresos(document.getElementById("egresosSearch").value);
  });

  document.getElementById("egresosSearch").addEventListener("input", (e) => renderEgresos(e.target.value));
  egresosEventsBound = true;
}

const entityConfig = {
  clientes: ["id", "nombre", "cuit", "telefono", "localidad", "condicionIVA", "email"],
  proveedores: ["id", "nombre", "cuit", "telefono", "localidad"],
  productos: ["id", "nombre", "codigo", "stock", "costo", "precio", "categoria"]
};

function renderEntityUi() {
  const fields = entityConfig[activeEntity];
  document.getElementById("entityHint").textContent = `${db[activeEntity].length} registros cargados`;
  document.getElementById("entityHead").innerHTML = `<tr>${fields.map((f) => `<th>${f.toUpperCase()}</th>`).join("")}<th>Acciones</th></tr>`;
  document.getElementById("entityForm").innerHTML = fields
    .map((f) => `<label>${f}<input name="${f}" ${f === "id" && editingId ? "readonly" : "required"} /></label>`)
    .join("") + `<button class="action-btn full" type="submit">${editingId ? "Guardar cambios" : "Agregar"}</button>`;
  renderEntityRows();
}

function renderEntityRows(search = "") {
  const fields = entityConfig[activeEntity];
  const items = db[activeEntity].filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));
  document.getElementById("entityRows").innerHTML = items
    .map((item) => {
      const cells = fields.map((f) => `<td>${item[f]}</td>`).join("");
      return `<tr>${cells}<td><button class="mini-btn" data-edit="${item.id}">Editar</button> <button class="mini-btn danger" data-del="${item.id}">Borrar</button></td></tr>`;
    })
    .join("");
}

function setupDbModule() {
  document.querySelectorAll(".entity-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".entity-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeEntity = btn.dataset.entity;
      editingId = null;
      renderEntityUi();
    });
  });

  document.getElementById("entityForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target).entries());
    if (activeEntity === "productos") {
      form.stock = Number(form.stock);
      form.costo = Number(form.costo);
      form.precio = Number(form.precio);
    }

    if (editingId) {
      if (isApiMode()) {
        const updated = await apiRequest(`/api/entities/${activeEntity}/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
        const idx = db[activeEntity].findIndex((x) => String(x.id) === String(editingId));
        db[activeEntity][idx] = updated;
      } else {
        const idx = db[activeEntity].findIndex((x) => x.id === editingId);
        db[activeEntity][idx] = form;
      }
    } else {
      if (isApiMode()) {
        const created = await apiRequest(`/api/entities/${activeEntity}`, { method: "POST", body: JSON.stringify(form) });
        db[activeEntity].push(created);
      } else {
        db[activeEntity].push(form);
      }
    }

    editingId = null;
    persistDb();
    renderEntityUi();
    refreshProveedorOptions();
  });

  document.getElementById("entityRows").addEventListener("click", async (e) => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const row = db[activeEntity].find((x) => x.id === editId);
      editingId = editId;
      renderEntityUi();
      const form = document.getElementById("entityForm");
      Object.entries(row).forEach(([k, v]) => form.elements[k] && (form.elements[k].value = v));
    }
    if (delId) {
      if (isApiMode()) await apiRequest(`/api/entities/${activeEntity}/${delId}`, { method: "DELETE" });
      db[activeEntity] = db[activeEntity].filter((x) => String(x.id) !== String(delId));
      persistDb();
      renderEntityUi();
      refreshProveedorOptions();
    }
  });

  document.getElementById("entitySearch").addEventListener("input", (e) => renderEntityRows(e.target.value));

  document.getElementById("dbReset").addEventListener("click", async () => {
    if (isApiMode()) {
      alert("En modo API el reset se gestiona desde backend/base de datos.");
      return;
    }
    db = structuredClone(seedDb);
    persistDb();
    editingId = null;
    renderEntityUi();
    refreshProveedorOptions();
    renderEgresos();
  });

  document.getElementById("dbExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "base-demo.json";
    a.click();
  });

  renderEntityUi();
}

async function renderInformes() {
  let ingresos = ingresosRows.reduce((a, i) => a + i[5], 0);
  let egresos = db.egresos.reduce((a, e) => a + Number(e.monto), 0);
  let utilidad = ingresos - egresos;
  let margen = ingresos ? (utilidad / ingresos) * 100 : 0;

  if (isApiMode() && currentSession?.token) {
    const resumen = await apiRequest("/api/informes/resumen");
    ingresos = Number(resumen.ingresos || 0);
    egresos = Number(resumen.egresos || 0);
    utilidad = Number(resumen.utilidad || 0);
    margen = Number(resumen.margen || 0);
  }

  document.getElementById("repIngresos").textContent = formatMoney(ingresos);
  document.getElementById("repEgresos").textContent = formatMoney(egresos);
  document.getElementById("repUtilidad").textContent = formatMoney(utilidad);
  document.getElementById("repMargen").textContent = `${margen.toFixed(1)}%`;
  document.getElementById("tesoreriaPagar").textContent = formatMoney(db.egresos.filter((e) => e.estado === "Pendiente").reduce((a, e) => a + Number(e.monto), 0));
  document.getElementById("tesoreriaDisponible").textContent = formatMoney(ingresos - egresos);

  const byCategory = isApiMode() && currentSession?.token
    ? await apiRequest("/api/informes/egresos-por-categoria")
    : db.egresos.reduce((acc, e) => {
      acc[e.categoria] = (acc[e.categoria] || 0) + Number(e.monto);
      return acc;
    }, {});
  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory);

  if (reportesChart) reportesChart.destroy();
  reportesChart = new Chart(document.getElementById("reportesCategoriaChart"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Egresos", data: values, backgroundColor: "#ef4444" }] }
  });

  const notas = [
    `Clientes cargados: ${db.clientes.length}`,
    `Proveedores cargados: ${db.proveedores.length}`,
    `Productos cargados: ${db.productos.length}`,
    `Egresos pendientes: ${db.egresos.filter((e) => e.estado === "Pendiente").length}`
  ];
  document.getElementById("informeNotas").innerHTML = notas.map((n) => `<li>${n}</li>`).join("");
}


function inDateRange(dateStr, desde, hasta) {
  if (!dateStr) return true;
  if (desde && dateStr < desde) return false;
  if (hasta && dateStr > hasta) return false;
  return true;
}

function generarInforme(tipo, desde = "", hasta = "") {
  if (tipo === "ventas") {
    informeRows = ingresosRows
      .filter((r) => inDateRange(r[3].split("/").reverse().join("-"), desde, hasta))
      .map((r) => ({ tipo: r[0], detalle: `${r[1]} - ${r[2]}`, fecha: r[3], estado: r[4], monto: r[5] }));
  } else if (tipo === "egresos") {
    informeRows = db.egresos
      .filter((e) => inDateRange(e.fecha, desde, hasta))
      .map((e) => ({ tipo: e.tipo, detalle: `${e.proveedor} - ${e.categoria}`, fecha: toDisplayDate(e.fecha), estado: e.estado, monto: Number(e.monto) }));
  } else if (tipo === "stock") {
    informeRows = db.productos.map((p) => ({ tipo: "Stock", detalle: `${p.codigo} - ${p.nombre}`, fecha: "-", estado: `Stock: ${p.stock}`, monto: Number(p.stock) * Number(p.costo) }));
  } else {
    const ingresos = ingresosRows.reduce((a, i) => a + i[5], 0);
    const egresos = db.egresos.filter((e) => inDateRange(e.fecha, desde, hasta)).reduce((a, e) => a + Number(e.monto), 0);
    informeRows = [
      { tipo: "Utilidad", detalle: "Ingresos del período", fecha: "-", estado: "Calculado", monto: ingresos },
      { tipo: "Utilidad", detalle: "Egresos del período", fecha: "-", estado: "Calculado", monto: -egresos },
      { tipo: "Utilidad", detalle: "Resultado neto", fecha: "-", estado: "Final", monto: ingresos - egresos }
    ];
  }

  document.getElementById("informeRows").innerHTML = informeRows
    .map((r) => `<tr><td>${r.tipo}</td><td>${r.detalle}</td><td>${r.fecha}</td><td>${r.estado}</td><td>${formatMoney(r.monto)}</td></tr>`)
    .join("");
}

function setupInformesGenerator() {
  document.getElementById("informeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    generarInforme(data.tipo, data.desde, data.hasta);
  });

  document.getElementById("exportInforme").addEventListener("click", () => {
    const csvHeader = "Tipo,Detalle,Fecha,Estado,Monto\n";
    const csvBody = informeRows
      .map((r) => [r.tipo, r.detalle, r.fecha, r.estado, r.monto].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvHeader + csvBody], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "informe-generado.csv";
    a.click();
  });

  generarInforme("ventas");
}



function ajustaIvaPorCondicion(condicion) {
  if (condicion === "Responsable Inscripto") return { tipo: "Factura A", alicuota: 21, discrimina: true };
  if (condicion === "Monotributista") return { tipo: "Factura C", alicuota: 0, discrimina: false };
  return { tipo: "Factura B", alicuota: 21, discrimina: false };
}

function calcularFactura(neto, alicuota, condicion) {
  const cfg = ajustaIvaPorCondicion(condicion);
  const rate = cfg.discrimina ? Number(alicuota) : 0;
  const iva = neto * (rate / 100);
  return { iva, total: neto + iva, discrimina: cfg.discrimina };
}

function renderFacturas() {
  document.getElementById("facturasRows").innerHTML = facturas
    .map(
      (f) => `<tr><td>${f.fecha}</td><td>${f.cliente}</td><td>${f.condicion}</td><td>${f.tipo}</td><td>${f.cae || "-"}</td><td>${formatMoney(f.neto)}</td><td>${formatMoney(
        f.iva
      )}</td><td>${formatMoney(f.total)}</td></tr>`
    )
    .join("");
}

async function setupFacturacion() {
  const clienteSel = document.getElementById("facturaCliente");
  clienteSel.innerHTML = db.clientes.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");
  const condSel = document.getElementById("facturaCondicion");
  const tipoSel = document.getElementById("facturaTipo");
  const ivaInput = document.getElementById("facturaIvaRate");

  function syncClienteCondicion() {
    const c = db.clientes.find((x) => x.id === clienteSel.value);
    if (!c) return;
    const condicion = c.condicionIVA || "Consumidor Final";
    condSel.value = condicion;
    const cfg = ajustaIvaPorCondicion(condicion);
    tipoSel.value = cfg.tipo;
    ivaInput.value = cfg.alicuota;
  }

  clienteSel.addEventListener("change", syncClienteCondicion);
  condSel.addEventListener("change", () => {
    const cfg = ajustaIvaPorCondicion(condSel.value);
    tipoSel.value = cfg.tipo;
    ivaInput.value = cfg.alicuota;
  });

  document.getElementById("btnSolicitarCAE").addEventListener("click", async () => {
    if (isApiMode()) {
      const caeData = await apiRequest("/api/facturas/simular-cae", { method: "POST", body: JSON.stringify({}) });
      document.getElementById("facturaCAE").value = caeData.cae;
      document.getElementById("facturaCAEVto").value = caeData.vencimiento;
      return;
    }
    const cae = `${Math.floor(10 ** 13 + Math.random() * 9 * 10 ** 13)}`;
    const vto = new Date();
    vto.setDate(vto.getDate() + 10);
    document.getElementById("facturaCAE").value = cae;
    document.getElementById("facturaCAEVto").value = vto.toISOString().slice(0, 10);
  });

  document.getElementById("facturaForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const neto = Number(data.neto);
    const calc = calcularFactura(neto, Number(data.alicuota), data.condicion);
    const cli = db.clientes.find((x) => x.id === data.cliente);
    const draftFactura = {
      fecha: new Date().toLocaleDateString("es-AR"),
      cliente: cli?.nombre || data.cliente,
      clienteEmail: cli?.email || "",
      condicion: data.condicion,
      tipo: data.tipo,
      concepto: data.concepto,
      neto,
      iva: calc.iva,
      total: calc.total,
      cae: document.getElementById("facturaCAE").value,
      caeVto: document.getElementById("facturaCAEVto").value
    };
    if (isApiMode()) {
      const created = await apiRequest("/api/facturas", {
        method: "POST",
        body: JSON.stringify({
          clienteId: data.cliente,
          condicionIVA: data.condicion,
          neto,
          alicuota: data.alicuota,
          concepto: data.concepto,
          cae: draftFactura.cae || null,
          caeVto: draftFactura.caeVto || null
        })
      });
      facturaActual = { ...created, condicion: created.condicionIVA, clienteEmail: cli?.email || "" };
    } else {
      facturaActual = draftFactura;
    }
    facturas.unshift(facturaActual);
    renderFacturas();
    document.getElementById("facturaTotales").innerHTML = `
      <div><strong>Neto:</strong> ${formatMoney(facturaActual.neto)}</div>
      <div><strong>IVA:</strong> ${formatMoney(facturaActual.iva)}</div>
      <div><strong>Total:</strong> ${formatMoney(facturaActual.total)}</div>
      <div><strong>CAE:</strong> ${facturaActual.cae || "Sin CAE"}</div>
    `;
  });

  document.getElementById("btnLinkMail").addEventListener("click", () => {
    smtpConfig.from = document.getElementById("smtpFrom").value;
    smtpConfig.host = document.getElementById("smtpHost").value;
    smtpConfig.linked = Boolean(smtpConfig.from && smtpConfig.host);
    document.getElementById("smtpStatus").textContent = smtpConfig.linked ? `Conectado (${smtpConfig.host})` : "No configurado";
  });

  document.getElementById("btnImprimirFactura").addEventListener("click", () => {
    if (!facturaActual) return alert("Primero generá una factura");
    window.print();
  });

  document.getElementById("btnPdfFactura").addEventListener("click", () => {
    if (!facturaActual) return alert("Primero generá una factura");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`Factura ${facturaActual.tipo}`, 15, 20);
    doc.text(`Cliente: ${facturaActual.cliente}`, 15, 30);
    doc.text(`Condición IVA: ${facturaActual.condicion}`, 15, 40);
    doc.text(`Neto: ${formatMoney(facturaActual.neto)}`, 15, 55);
    doc.text(`IVA: ${formatMoney(facturaActual.iva)}`, 15, 65);
    doc.text(`Total: ${formatMoney(facturaActual.total)}`, 15, 75);
    doc.text(`CAE: ${facturaActual.cae || "N/D"} Vto: ${facturaActual.caeVto || "N/D"}`, 15, 90);
    doc.save(`factura-${Date.now()}.pdf`);
  });

  document.getElementById("btnMailFactura").addEventListener("click", () => {
    if (!facturaActual) return alert("Primero generá una factura");
    const to = facturaActual.clienteEmail || "";
    const subject = encodeURIComponent(`Factura ${facturaActual.tipo} - ${facturaActual.cliente}`);
    const body = encodeURIComponent(`Adjuntamos factura en PDF. Total: ${formatMoney(facturaActual.total)}. CAE: ${facturaActual.cae || "N/D"}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });

  syncClienteCondicion();
  if (isApiMode() && currentSession?.token) {
    const apiFacturas = await apiRequest("/api/facturas").catch(() => []);
    facturas = apiFacturas.map((f) => ({ ...f, condicion: f.condicionIVA }));
    renderFacturas();
  }
}

function setupUsuarios() {
  renderUsuarios();
  document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!hasAction('base_datos:manage_users')) return;
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (users.some((u) => u.username === data.username)) return alert('Usuario ya existe');
    if (isApiMode()) {
      const created = await apiRequest("/api/entities/users", { method: "POST", body: JSON.stringify({ ...data, activo: true }) });
      users.push(created);
    } else {
      users.push({ ...data, activo: true });
    }
    persistUsers();
    e.target.reset();
    renderUsuarios();
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const sections = document.querySelectorAll(".tab-content");
  const title = document.getElementById("section-title");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      sections.forEach((s) => s.classList.remove("active"));
      document.getElementById(tab.dataset.tab).classList.add("active");
      title.textContent = tab.dataset.tab === "inicio" ? "Dashboard de Inicio" : tab.textContent;
    });
  });
}

function setupModeSelector() {
  const modeEl = document.getElementById("dataMode");
  if (!modeEl) return;
  modeEl.value = appMode;
  modeEl.addEventListener("change", () => {
    setMode(modeEl.value);
    window.location.reload();
  });
}

async function bootstrap() {
  setKPIs();
  createDashboardCharts();
  fillIngresos();
  setupModeSelector();
  setupEgresos();
  setupDbModule();
  setupUsuarios();
  setupInformesGenerator();
  setupTabs();
  setupAuth();

  if (isApiMode() && currentSession?.token) {
    try {
      await hydrateFromApi();
    } catch (error) {
      console.warn("No se pudo cargar backend API, cambiando a modo demo:", error.message);
      setMode("demo");
      appMode = "demo";
      db = loadDb();
      users = loadUsers();
      clearSession();
      currentSession = null;
    }
  }

  await setupFacturacion();
  renderEgresos();
  await renderInformes();
  applyPermissionsUi();
}

bootstrap();
