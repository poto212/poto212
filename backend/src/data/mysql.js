import mysql from 'mysql2/promise';
import { initialData } from './db.js';

let pool = null;

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

async function ensureSchema() {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS records (
      entity VARCHAR(80) NOT NULL,
      id INT NOT NULL,
      data JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY(entity, id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function entityCount(entity) {
  const [rows] = await getPool().execute('SELECT COUNT(*) AS count FROM records WHERE entity = ?', [entity]);
  return Number(rows[0]?.count || 0);
}

export async function initMysql() {
  await ensureSchema();
  for (const [entity, items] of Object.entries(initialData)) {
    const count = await entityCount(entity);
    if (count > 0) continue;
    for (const item of items) {
      await getPool().execute('INSERT INTO records(entity, id, data) VALUES (?, ?, CAST(? AS JSON))', [entity, Number(item.id), JSON.stringify(item)]);
    }
  }
}

export async function mysqlList(entity) {
  const [rows] = await getPool().execute('SELECT data FROM records WHERE entity = ? ORDER BY id ASC', [entity]);
  return rows.map((row) => (typeof row.data === 'string' ? JSON.parse(row.data) : row.data));
}

export async function mysqlGetById(entity, id) {
  const [rows] = await getPool().execute('SELECT data FROM records WHERE entity = ? AND id = ?', [entity, Number(id)]);
  const data = rows[0]?.data;
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function mysqlNextId(entity) {
  const [rows] = await getPool().execute('SELECT COALESCE(MAX(id), 0) AS max FROM records WHERE entity = ?', [entity]);
  return Number(rows[0]?.max || 0) + 1;
}

export async function mysqlCreate(entity, payload) {
  const id = await mysqlNextId(entity);
  const record = { id, ...payload };
  await getPool().execute('INSERT INTO records(entity, id, data) VALUES (?, ?, CAST(? AS JSON))', [entity, id, JSON.stringify(record)]);
  return record;
}

export async function mysqlUpdate(entity, id, payload) {
  const existing = await mysqlGetById(entity, id);
  if (!existing) return null;
  const updated = { ...existing, ...payload, id: Number(id) };
  await getPool().execute('UPDATE records SET data = CAST(? AS JSON) WHERE entity = ? AND id = ?', [JSON.stringify(updated), entity, Number(id)]);
  return updated;
}

export async function mysqlDelete(entity, id) {
  await getPool().execute('DELETE FROM records WHERE entity = ? AND id = ?', [entity, Number(id)]);
}

export async function closeMysql() {
  if (pool) await pool.end();
  pool = null;
}
