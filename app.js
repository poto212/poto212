const monthlyData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  ventas: [900000, 1100000, 980000, 1240000, 1180000, 1320000, 1270000, 1360000, 1490000, 1430000, 1570000, 1660000],
  otrosIngresos: [140000, 160000, 130000, 180000, 175000, 190000, 205000, 188000, 197000, 210000, 220000, 240000],
  compras: [420000, 510000, 490000, 560000, 540000, 580000, 570000, 600000, 620000, 640000, 665000, 690000],
  gastos: [220000, 235000, 240000, 250000, 260000, 275000, 282000, 290000, 310000, 305000, 320000, 340000]
};

const current = { ventas: 1660000, ventasPrev: 1570000, cantidad: 148, cantidadPrev: 139 };

const ingresosRows = [
  ["Venta", "FAC-000231", "Ferretería Sur", "04/03/2026", "Confirmada", 128000],
  ["Presupuesto", "PRE-000119", "Casa Delta", "04/03/2026", "Enviado", 79000],
  ["Otro ingreso", "ING-000088", "Servicio técnico", "03/03/2026", "Cobrado", 35000],
  ["Venta", "FAC-000230", "Electro Norte", "03/03/2026", "Pendiente", 214000]
];

const egresosRows = [
  ["Compra", "Acero SA", "04/03/2026", "15/03/2026", "Pendiente", 198000],
  ["Gasto", "Internet Fibra", "03/03/2026", "03/03/2026", "Pagado", 32000],
  ["Compra", "Insumos Delta", "02/03/2026", "12/03/2026", "Pendiente", 146000],
  ["Gasto", "Sueldos", "01/03/2026", "01/03/2026", "Pagado", 410000]
];

const clientes = ["ArgenTech SRL · CUIT 30-71234567-8", "Distribuidora Sur · CUIT 30-70111222-3", "Comercial Nexo · CUIT 30-71999888-0"];
const stockCritico = ["Cable USB-C (Stock: 3)", "Router Mesh X1 (Stock: 2)", "Tóner HP 12A (Stock: 4)"];
const cobros = ["FAC-000231 · Transferencia · $128.000", "CC Cliente Delta · Efectivo · $64.500", "Servicio técnico · MP · $35.000"];
const pagos = ["Compra Acero SA · Banco Río · $198.000", "Gasto Internet · Débito · $32.000", "Pago CC Insumos Delta · Cheque · $75.000"];

const formatMoney = (n) => `$ ${n.toLocaleString("es-AR")}`;
const percentDiff = (curr, prev) => ((curr - prev) / prev) * 100;

function setKPIs() {
  const promedio = current.ventas / current.cantidad;
  const promedioPrev = current.ventasPrev / current.cantidadPrev;

  document.getElementById("ventasCreadas").textContent = formatMoney(current.ventas);
  document.getElementById("ventaPromedio").textContent = formatMoney(Math.round(promedio));
  document.getElementById("cantidadVentas").textContent = current.cantidad;

  renderDelta("ventasDelta", percentDiff(current.ventas, current.ventasPrev));
  renderDelta("promedioDelta", percentDiff(promedio, promedioPrev));
  renderDelta("cantidadDelta", percentDiff(current.cantidad, current.cantidadPrev));
}

function renderDelta(id, value) {
  const el = document.getElementById(id);
  el.textContent = `${value >= 0 ? "+" : ""}${value.toFixed(1)}% vs mes anterior`;
  el.classList.toggle("positive", value >= 0);
}

function createCharts() {
  const egresosTotal = 690000 + 340000;

  new Chart(document.getElementById("ingresosComposicion"), {
    type: "doughnut",
    data: {
      labels: ["Ventas", "Otros ingresos"],
      datasets: [{ data: [current.ventas, 240000], backgroundColor: ["#2f7ef7", "#60a5fa"] }]
    }
  });

  new Chart(document.getElementById("egresosComposicion"), {
    type: "doughnut",
    data: {
      labels: ["Compras", "Gastos"],
      datasets: [{ data: [690000, 340000], backgroundColor: ["#ef4444", "#f59e0b"] }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${((ctx.raw / egresosTotal) * 100).toFixed(1)}%`
          }
        }
      }
    }
  });

  new Chart(document.getElementById("mensualChart"), {
    type: "line",
    data: {
      labels: monthlyData.labels,
      datasets: [
        { label: "Ventas", data: monthlyData.ventas, borderColor: "#2f7ef7", tension: 0.25 },
        { label: "Otros ingresos", data: monthlyData.otrosIngresos, borderColor: "#60a5fa", tension: 0.25 },
        { label: "Compras", data: monthlyData.compras, borderColor: "#ef4444", tension: 0.25 },
        { label: "Gastos", data: monthlyData.gastos, borderColor: "#f59e0b", tension: 0.25 }
      ]
    }
  });

  const agingLabels = ["A vencer", "Vencido", "0-30", "31-60", "+90"];

  new Chart(document.getElementById("cobrarAging"), {
    type: "bar",
    data: {
      labels: agingLabels,
      datasets: [{ label: "$", data: [520000, 210000, 390000, 240000, 140000], backgroundColor: "#3b82f6" }]
    }
  });

  new Chart(document.getElementById("pagarAging"), {
    type: "bar",
    data: {
      labels: agingLabels,
      datasets: [{ label: "$", data: [360000, 180000, 290000, 210000, 110000], backgroundColor: "#ef4444" }]
    }
  });

  new Chart(document.getElementById("diarioChart"), {
    type: "bar",
    data: {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      datasets: [
        { label: "Total ventas", data: [260000, 310000, 280000, 350000, 420000, 190000], backgroundColor: "#2f7ef7" },
        { label: "Venta promedio", data: [19000, 21000, 20000, 23000, 24000, 16000], backgroundColor: "#93c5fd" },
        { label: "Cantidad", data: [14, 16, 15, 17, 21, 10], backgroundColor: "#1d4ed8" },
        { label: "Productos vendidos", data: [41, 48, 44, 52, 63, 30], backgroundColor: "#bfdbfe" }
      ]
    }
  });

  new Chart(document.getElementById("categoriaChart"), {
    type: "pie",
    data: {
      labels: ["Electrónica", "Hogar", "Servicios", "Accesorios"],
      datasets: [{ data: [38, 27, 19, 16], backgroundColor: ["#2563eb", "#4f46e5", "#06b6d4", "#0ea5e9"] }]
    }
  });

  const ranking = [
    "Cable HDMI 2m - 97 uds",
    "Mouse inalámbrico - 85 uds",
    "Kit domótica básico - 72 uds",
    "Servicio instalación - 48 servicios",
    "Router dual band - 45 uds"
  ];

  document.getElementById("ranking").innerHTML = ranking.map((item) => `<li>${item}</li>`).join("");
}

function fillRows(tableId, rows) {
  document.getElementById(tableId).innerHTML = rows
    .map((row) => `<tr>${row.map((col, i) => `<td>${i === row.length - 1 ? formatMoney(col) : col}</td>`).join("")}</tr>`)
    .join("");
}

function fillList(id, data) {
  document.getElementById(id).innerHTML = data.map((item) => `<li>${item}</li>`).join("");
}

function setReportsSummary() {
  const ingresos = current.ventas + 240000;
  const egresos = 690000 + 340000;
  const utilidad = ingresos - egresos;
  const margen = (utilidad / ingresos) * 100;

  document.getElementById("repIngresos").textContent = formatMoney(ingresos);
  document.getElementById("repEgresos").textContent = formatMoney(egresos);
  document.getElementById("repUtilidad").textContent = formatMoney(utilidad);
  document.getElementById("repMargen").textContent = `${margen.toFixed(1)}%`;
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const sections = document.querySelectorAll(".tab-content");
  const title = document.getElementById("section-title");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      sections.forEach((section) => section.classList.remove("active"));
      document.getElementById(tab.dataset.tab).classList.add("active");

      title.textContent = tab.dataset.tab === "inicio" ? "Dashboard de Inicio" : tab.textContent;
    });
  });
}

setKPIs();
createCharts();
fillRows("ingresosRows", ingresosRows);
fillRows("egresosRows", egresosRows);
fillList("clientesList", clientes);
fillList("stockList", stockCritico);
fillList("cobrosList", cobros);
fillList("pagosList", pagos);
setReportsSummary();
setupTabs();
