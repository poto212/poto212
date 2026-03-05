const STORAGE_KEY = "poto212-demo-db-v1";

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
    { id: "C001", nombre: "ArgenTech SRL", cuit: "30-71234567-8", telefono: "11-4444-1111", localidad: "CABA" },
    { id: "C002", nombre: "Comercial Nexo", cuit: "30-71999888-0", telefono: "341-555-1212", localidad: "Rosario" }
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

let db = loadDb();
let activeEntity = "clientes";
let editingId = null;
let reportesChart;
let egresosEventsBound = false;

function loadDb() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDb));
    return structuredClone(seedDb);
  }
  return JSON.parse(raw);
}

function persistDb() {
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

  document.getElementById("egresoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.monto = Number(data.monto);
    db.egresos.unshift(data);
    persistDb();
    e.target.reset();
    renderEgresos(document.getElementById("egresosSearch").value);
  });

  document.getElementById("egresosSearch").addEventListener("input", (e) => renderEgresos(e.target.value));
  egresosEventsBound = true;
}

const entityConfig = {
  clientes: ["id", "nombre", "cuit", "telefono", "localidad"],
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

  document.getElementById("entityForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target).entries());
    if (activeEntity === "productos") {
      form.stock = Number(form.stock);
      form.costo = Number(form.costo);
      form.precio = Number(form.precio);
    }

    if (editingId) {
      const idx = db[activeEntity].findIndex((x) => x.id === editingId);
      db[activeEntity][idx] = form;
    } else {
      db[activeEntity].push(form);
    }

    editingId = null;
    persistDb();
    renderEntityUi();
    refreshProveedorOptions();
  });

  document.getElementById("entityRows").addEventListener("click", (e) => {
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
      db[activeEntity] = db[activeEntity].filter((x) => x.id !== delId);
      persistDb();
      renderEntityUi();
      refreshProveedorOptions();
    }
  });

  document.getElementById("entitySearch").addEventListener("input", (e) => renderEntityRows(e.target.value));

  document.getElementById("dbReset").addEventListener("click", () => {
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

function renderInformes() {
  const ingresos = ingresosRows.reduce((a, i) => a + i[5], 0);
  const egresos = db.egresos.reduce((a, e) => a + Number(e.monto), 0);
  const utilidad = ingresos - egresos;
  const margen = ingresos ? (utilidad / ingresos) * 100 : 0;

  document.getElementById("repIngresos").textContent = formatMoney(ingresos);
  document.getElementById("repEgresos").textContent = formatMoney(egresos);
  document.getElementById("repUtilidad").textContent = formatMoney(utilidad);
  document.getElementById("repMargen").textContent = `${margen.toFixed(1)}%`;
  document.getElementById("tesoreriaPagar").textContent = formatMoney(db.egresos.filter((e) => e.estado === "Pendiente").reduce((a, e) => a + Number(e.monto), 0));
  document.getElementById("tesoreriaDisponible").textContent = formatMoney(ingresos - egresos);

  const byCategory = db.egresos.reduce((acc, e) => {
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

setKPIs();
createDashboardCharts();
fillIngresos();
setupEgresos();
setupDbModule();
renderEgresos();
renderInformes();
setupTabs();
