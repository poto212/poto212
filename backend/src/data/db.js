import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve('backend/src/data/db.json');

const initialData = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', nombre: 'Administrador', rol: 'admin', activo: true },
    { id: 2, username: 'vendedor', password: 'vendedor123', nombre: 'Ventas', rol: 'vendedor', activo: true },
    { id: 3, username: 'tesoreria', password: 'tesoreria123', nombre: 'Tesorería', rol: 'tesoreria', activo: true },
    { id: 4, username: 'contador', password: 'contador123', nombre: 'Contador', rol: 'contador', activo: true }
  ],
  clientes: [
    { id: 1, nombre: 'ArgenTech SRL', cuit: '30-71234567-8', condicionIVA: 'Responsable Inscripto', email: 'compras@argentech.com' }
  ],
  proveedores: [
    { id: 1, nombre: 'Acero SA', cuit: '30-70123456-1', email: 'ventas@acero.com' }
  ],
  productos: [
    { id: 1, codigo: 'USB-C-01', nombre: 'Cable USB-C', stock: 3, costo: 2500, precio: 5200, categoria: 'Accesorios' }
  ],
  egresos: [
    { id: 1, tipo: 'Compra', proveedor: 'Acero SA', categoria: 'Insumos', fecha: '2026-03-04', estado: 'Pendiente', monto: 198000 }
  ],
  facturas: []
};

function ensureDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

export function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function nextId(items) {
  return items.length ? Math.max(...items.map((i) => Number(i.id))) + 1 : 1;
}
