import { initPostgres, pgList, pgGetById, pgCreate, pgUpdate, pgDelete } from './postgres.js';
import { initMysql, mysqlList, mysqlGetById, mysqlCreate, mysqlUpdate, mysqlDelete } from './mysql.js';

const provider = process.env.DB_PROVIDER || 'mysql';

export async function initStorage() {
  if (provider === 'mysql') {
    await initMysql();
    return;
  }
  if (provider === 'postgres') {
    await initPostgres();
    return;
  }
  throw new Error(`DB_PROVIDER no soportado: ${provider}. Usá mysql o postgres.`);
}

export async function list(entity) {
  if (provider === 'mysql') return mysqlList(entity);
  if (provider === 'postgres') return pgList(entity);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function getById(entity, id) {
  if (provider === 'mysql') return mysqlGetById(entity, id);
  if (provider === 'postgres') return pgGetById(entity, id);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function create(entity, payload) {
  if (provider === 'mysql') return mysqlCreate(entity, payload);
  if (provider === 'postgres') return pgCreate(entity, payload);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function update(entity, id, payload) {
  if (provider === 'mysql') return mysqlUpdate(entity, id, payload);
  if (provider === 'postgres') return pgUpdate(entity, id, payload);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function remove(entity, id) {
  if (provider === 'mysql') return mysqlDelete(entity, id);
  if (provider === 'postgres') return pgDelete(entity, id);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export function getProvider() {
  return provider;
}
