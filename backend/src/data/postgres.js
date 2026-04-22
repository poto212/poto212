import pkg from 'pg';
import { initialData } from './db.js';

const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
let pool = null;

function getPool() {
  if (!DATABASE_URL) throw new Error('DATABASE_URL no configurada para proveedor postgres');
  if (!pool) pool = new Pool({ connectionString: DATABASE_URL });
  return pool;
}

async function ensureSchema() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS records (
      entity TEXT NOT NULL,
      id INTEGER NOT NULL,
      data JSONB NOT NULL,
      PRIMARY KEY(entity, id)
    );
  `);
}

async function entityCount(entity) {
  const { rows } = await getPool().query('SELECT COUNT(*)::int AS count FROM records WHERE entity = $1', [entity]);
  return rows[0]?.count || 0;
}

export async function initPostgres() {
  await ensureSchema();

  for (const [entity, items] of Object.entries(initialData)) {
    const count = await entityCount(entity);
    if (count > 0) continue;
    for (const item of items) {
      await getPool().query('INSERT INTO records(entity, id, data) VALUES ($1, $2, $3::jsonb)', [entity, Number(item.id), JSON.stringify(item)]);
    }
  }
}

export async function pgList(entity) {
  const { rows } = await getPool().query('SELECT data FROM records WHERE entity = $1 ORDER BY id ASC', [entity]);
  return rows.map((r) => r.data);
}

export async function pgGetById(entity, id) {
  const { rows } = await getPool().query('SELECT data FROM records WHERE entity = $1 AND id = $2', [entity, Number(id)]);
  return rows[0]?.data || null;
}

export async function pgNextId(entity) {
  const { rows } = await getPool().query('SELECT COALESCE(MAX(id), 0)::int AS max FROM records WHERE entity = $1', [entity]);
  return (rows[0]?.max || 0) + 1;
}

export async function pgCreate(entity, payload) {
  const id = await pgNextId(entity);
  const record = { id, ...payload };
  await getPool().query('INSERT INTO records(entity, id, data) VALUES ($1, $2, $3::jsonb)', [entity, id, JSON.stringify(record)]);
  return record;
}

export async function pgUpdate(entity, id, payload) {
  const existing = await pgGetById(entity, id);
  if (!existing) return null;
  const updated = { ...existing, ...payload, id: Number(id) };
  await getPool().query('UPDATE records SET data = $3::jsonb WHERE entity = $1 AND id = $2', [entity, Number(id), JSON.stringify(updated)]);
  return updated;
}

export async function pgDelete(entity, id) {
  await getPool().query('DELETE FROM records WHERE entity = $1 AND id = $2', [entity, Number(id)]);
}

export async function closePostgres() {
  if (pool) await pool.end();
}
