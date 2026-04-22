import { readDb, writeDb, nextId } from './db.js';
import { initPostgres, pgList, pgGetById, pgCreate, pgUpdate, pgDelete } from './postgres.js';

const provider = process.env.DB_PROVIDER || 'json';

export async function initStorage() {
  if (provider === 'postgres') {
    await initPostgres();
  }
}

export async function list(entity) {
  if (provider === 'postgres') return pgList(entity);
  const db = readDb();
  return db[entity] || [];
}

export async function getById(entity, id) {
  if (provider === 'postgres') return pgGetById(entity, id);
  const db = readDb();
  return (db[entity] || []).find((x) => Number(x.id) === Number(id)) || null;
}

export async function create(entity, payload) {
  if (provider === 'postgres') return pgCreate(entity, payload);
  const db = readDb();
  const item = { id: nextId(db[entity] || []), ...payload };
  db[entity] = db[entity] || [];
  db[entity].push(item);
  writeDb(db);
  return item;
}

export async function update(entity, id, payload) {
  if (provider === 'postgres') return pgUpdate(entity, id, payload);
  const db = readDb();
  db[entity] = db[entity] || [];
  const idx = db[entity].findIndex((x) => Number(x.id) === Number(id));
  if (idx < 0) return null;
  db[entity][idx] = { ...db[entity][idx], ...payload, id: Number(id) };
  writeDb(db);
  return db[entity][idx];
}

export async function remove(entity, id) {
  if (provider === 'postgres') return pgDelete(entity, id);
  const db = readDb();
  db[entity] = (db[entity] || []).filter((x) => Number(x.id) !== Number(id));
  writeDb(db);
}

export function getProvider() {
  return provider;
}
