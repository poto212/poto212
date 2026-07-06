import mysql from 'mysql2/promise';
import { initialData } from './db.js';
import { hashPassword, isHashedPassword } from '../services/security.js';

let pool = null;
const DEFAULT_TENANT_ID = Number(process.env.DEFAULT_TENANT_ID || 1);
const ENTITY_TABLES = {
  users: 'users',
  clientes: 'clientes',
  proveedores: 'proveedores',
  productos: 'productos',
  egresos: 'egresos',
  facturas: 'facturas',
  factura_items: 'factura_items',
  pagos: 'pagos',
  cobranzas: 'cobranzas',
  depositos: 'depositos',
  stock_movimientos: 'stock_movimientos',
  tenants: 'tenants'
};

function mysqlConfig() {
  if (process.env.MYSQL_URL) return process.env.MYSQL_URL;
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'sistema_gestion';
  return { host, port, user, password, database, waitForConnections: true, connectionLimit: 10, namedPlaceholders: true };
}

function getPool() {
  if (!pool) pool = mysql.createPool(mysqlConfig());
  return pool;
}

function normalizeSeed(entity, item) {
  if (entity === 'users') {
    const password = isHashedPassword(item.password) ? item.password : hashPassword(item.password);
    return { ...item, password };
  }
  return item;
}

async function ensureSchema() {
  const schema = [
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(80) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS tenants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(160) NOT NULL,
      cuit VARCHAR(20) NULL,
      activo BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      username VARCHAR(60) NOT NULL,
      password VARCHAR(255) NOT NULL,
      nombre VARCHAR(160) NOT NULL,
      rol VARCHAR(40) NOT NULL,
      activo BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_users_tenant_username (tenant_id, username),
      CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      nombre VARCHAR(160) NOT NULL,
      cuit VARCHAR(20) NULL,
      telefono VARCHAR(60) NULL,
      localidad VARCHAR(120) NULL,
      condicionIVA VARCHAR(60) NOT NULL,
      email VARCHAR(180) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_clientes_nombre (tenant_id, nombre),
      CONSTRAINT fk_clientes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS proveedores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      nombre VARCHAR(160) NOT NULL,
      cuit VARCHAR(20) NULL,
      telefono VARCHAR(60) NULL,
      localidad VARCHAR(120) NULL,
      email VARCHAR(180) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_proveedores_nombre (tenant_id, nombre),
      CONSTRAINT fk_proveedores_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      codigo VARCHAR(80) NOT NULL,
      nombre VARCHAR(160) NOT NULL,
      stock DECIMAL(14,2) NOT NULL DEFAULT 0,
      costo DECIMAL(14,2) NOT NULL DEFAULT 0,
      precio DECIMAL(14,2) NOT NULL DEFAULT 0,
      categoria VARCHAR(120) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_productos_tenant_codigo (tenant_id, codigo),
      INDEX idx_productos_nombre (tenant_id, nombre),
      CONSTRAINT fk_productos_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS egresos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      tipo VARCHAR(40) NOT NULL,
      proveedor VARCHAR(160) NOT NULL,
      categoria VARCHAR(120) NOT NULL,
      fecha DATE NOT NULL,
      vencimiento DATE NOT NULL,
      estado VARCHAR(40) NOT NULL,
      monto DECIMAL(14,2) NOT NULL,
      nota TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_egresos_fecha (tenant_id, fecha),
      CONSTRAINT fk_egresos_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS facturas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      fecha DATE NOT NULL,
      clienteId INT NOT NULL,
      cliente VARCHAR(160) NOT NULL,
      condicionIVA VARCHAR(60) NOT NULL,
      tipo VARCHAR(40) NOT NULL,
      concepto VARCHAR(240) NOT NULL,
      neto DECIMAL(14,2) NOT NULL,
      iva DECIMAL(14,2) NOT NULL,
      total DECIMAL(14,2) NOT NULL,
      cae VARCHAR(32) NULL,
      caeVto DATE NULL,
      qr TEXT NULL,
      creadoPor VARCHAR(80) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_facturas_fecha (tenant_id, fecha),
      CONSTRAINT fk_facturas_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      CONSTRAINT fk_facturas_cliente FOREIGN KEY (clienteId) REFERENCES clientes(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS factura_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      facturaId INT NOT NULL,
      productoId INT NULL,
      codigo VARCHAR(80) NULL,
      descripcion VARCHAR(240) NOT NULL,
      cantidad DECIMAL(14,2) NOT NULL,
      precioUnitario DECIMAL(14,2) NOT NULL,
      total DECIMAL(14,2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_factura_items_factura (tenant_id, facturaId),
      CONSTRAINT fk_factura_items_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      CONSTRAINT fk_factura_items_factura FOREIGN KEY (facturaId) REFERENCES facturas(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS pagos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      proveedor VARCHAR(160) NOT NULL,
      fecha DATE NOT NULL,
      metodo VARCHAR(80) NOT NULL,
      monto DECIMAL(14,2) NOT NULL,
      referencia VARCHAR(160) NULL,
      estado VARCHAR(40) NOT NULL DEFAULT 'Confirmado',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_pagos_fecha (tenant_id, fecha),
      CONSTRAINT fk_pagos_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS cobranzas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      cliente VARCHAR(160) NOT NULL,
      fecha DATE NOT NULL,
      metodo VARCHAR(80) NOT NULL,
      monto DECIMAL(14,2) NOT NULL,
      referencia VARCHAR(160) NULL,
      estado VARCHAR(40) NOT NULL DEFAULT 'Confirmada',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cobranzas_fecha (tenant_id, fecha),
      CONSTRAINT fk_cobranzas_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS depositos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      nombre VARCHAR(160) NOT NULL,
      ubicacion VARCHAR(180) NULL,
      activo BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_depositos_tenant_nombre (tenant_id, nombre),
      CONSTRAINT fk_depositos_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS stock_movimientos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      productoId INT NOT NULL,
      depositoId INT NULL,
      tipo VARCHAR(40) NOT NULL,
      cantidad DECIMAL(14,2) NOT NULL,
      motivo VARCHAR(180) NULL,
      referencia VARCHAR(160) NULL,
      fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_stock_producto (tenant_id, productoId),
      CONSTRAINT fk_stock_mov_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      CONSTRAINT fk_stock_mov_producto FOREIGN KEY (productoId) REFERENCES productos(id),
      CONSTRAINT fk_stock_mov_deposito FOREIGN KEY (depositoId) REFERENCES depositos(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      tenant_id INT NOT NULL,
      entity VARCHAR(80) NOT NULL,
      record_id INT NULL,
      action VARCHAR(40) NOT NULL,
      actor VARCHAR(120) NOT NULL DEFAULT 'system',
      before_data JSON NULL,
      after_data JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_entity (tenant_id, entity, record_id),
      CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];
  for (const statement of schema) await getPool().execute(statement);
  await getPool().execute("INSERT IGNORE INTO schema_migrations(version) VALUES ('001_initial_relational_schema')");
}

async function ensureTenant() {
  await getPool().execute('INSERT IGNORE INTO tenants(id, nombre, cuit) VALUES (?, ?, ?)', [DEFAULT_TENANT_ID, process.env.DEFAULT_TENANT_NAME || 'Empresa Demo', process.env.DEFAULT_TENANT_CUIT || null]);
}

async function entityCount(entity) {
  const table = ENTITY_TABLES[entity];
  if (entity === 'tenants') {
    const [rows] = await getPool().execute('SELECT COUNT(*) AS count FROM tenants');
    return Number(rows[0]?.count || 0);
  }
  const [rows] = await getPool().execute(`SELECT COUNT(*) AS count FROM ${table} WHERE tenant_id = ?`, [DEFAULT_TENANT_ID]);
  return Number(rows[0]?.count || 0);
}

async function audit(entity, action, recordId, beforeData, afterData, actor = 'system') {
  await getPool().execute(
    'INSERT INTO audit_logs(tenant_id, entity, record_id, action, actor, before_data, after_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [DEFAULT_TENANT_ID, entity, recordId || null, action, actor, beforeData ? JSON.stringify(beforeData) : null, afterData ? JSON.stringify(afterData) : null]
  );
}

function rowToEntity(row) {
  if (!row) return null;
  const clean = { ...row };
  delete clean.tenant_id;
  delete clean.created_at;
  delete clean.updated_at;
  return clean;
}

export async function initMysql() {
  await ensureSchema();
  await ensureTenant();
  for (const [entity, items] of Object.entries(initialData)) {
    if (!ENTITY_TABLES[entity]) continue;
    const count = await entityCount(entity);
    if (count > 0) continue;
    for (const item of items) await mysqlCreate(entity, normalizeSeed(entity, item), { audit: false });
  }
  if ((await entityCount('depositos')) === 0) await mysqlCreate('depositos', { nombre: 'Depósito Central', ubicacion: 'Casa central', activo: true }, { audit: false });
}

export async function mysqlList(entity) {
  const table = ENTITY_TABLES[entity];
  if (!table) throw new Error(`Entidad MySQL no soportada: ${entity}`);
  const [rows] = entity === 'tenants'
    ? await getPool().execute('SELECT * FROM tenants ORDER BY id ASC')
    : await getPool().execute(`SELECT * FROM ${table} WHERE tenant_id = ? ORDER BY id ASC`, [DEFAULT_TENANT_ID]);
  return rows.map(rowToEntity);
}

export async function mysqlGetById(entity, id) {
  const table = ENTITY_TABLES[entity];
  if (!table) throw new Error(`Entidad MySQL no soportada: ${entity}`);
  const [rows] = entity === 'tenants'
    ? await getPool().execute('SELECT * FROM tenants WHERE id = ?', [Number(id)])
    : await getPool().execute(`SELECT * FROM ${table} WHERE tenant_id = ? AND id = ?`, [DEFAULT_TENANT_ID, Number(id)]);
  return rowToEntity(rows[0]);
}

function insertSql(entity, payload) {
  const keys = Object.keys(payload).filter((key) => key !== 'id');
  const columns = entity === 'tenants' ? keys : ['tenant_id', ...keys];
  const placeholders = columns.map(() => '?');
  const values = entity === 'tenants' ? keys.map((key) => payload[key]) : [DEFAULT_TENANT_ID, ...keys.map((key) => payload[key])];
  return { sql: `INSERT INTO ${ENTITY_TABLES[entity]}(${columns.join(',')}) VALUES (${placeholders.join(',')})`, values };
}

export async function mysqlCreate(entity, payload, options = {}) {
  const { sql, values } = insertSql(entity, payload);
  const [result] = await getPool().execute(sql, values);
  const record = await mysqlGetById(entity, result.insertId);
  if (options.audit !== false) await audit(entity, 'create', record.id, null, record);
  return record;
}

export async function mysqlUpdate(entity, id, payload) {
  const existing = await mysqlGetById(entity, id);
  if (!existing) return null;
  const keys = Object.keys(payload).filter((key) => key !== 'id' && payload[key] !== undefined);
  if (!keys.length) return existing;
  const assignments = keys.map((key) => `${key} = ?`).join(', ');
  if (entity === 'tenants') {
    await getPool().execute(`UPDATE tenants SET ${assignments} WHERE id = ?`, [...keys.map((key) => payload[key]), Number(id)]);
  } else {
    await getPool().execute(`UPDATE ${ENTITY_TABLES[entity]} SET ${assignments} WHERE tenant_id = ? AND id = ?`, [...keys.map((key) => payload[key]), DEFAULT_TENANT_ID, Number(id)]);
  }
  const updated = await mysqlGetById(entity, id);
  await audit(entity, 'update', Number(id), existing, updated);
  return updated;
}

export async function mysqlDelete(entity, id) {
  const existing = await mysqlGetById(entity, id);
  if (entity === 'tenants') {
    await getPool().execute('DELETE FROM tenants WHERE id = ?', [Number(id)]);
  } else {
    await getPool().execute(`DELETE FROM ${ENTITY_TABLES[entity]} WHERE tenant_id = ? AND id = ?`, [DEFAULT_TENANT_ID, Number(id)]);
  }
  if (existing) await audit(entity, 'delete', Number(id), existing, null);
}

export async function closeMysql() {
  if (pool) await pool.end();
  pool = null;
}
