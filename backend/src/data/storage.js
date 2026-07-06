import { initPostgres, pgList, pgGetById, pgCreate, pgUpdate, pgDelete } from './postgres.js';
import { initMysql, mysqlList, mysqlGetById, mysqlCreate, mysqlUpdate, mysqlDelete, mysqlRestoreBackup } from './mysql.js';

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

export async function list(entity, options = {}) {
  if (provider === 'mysql') return mysqlList(entity, options);
  if (provider === 'postgres') return pgList(entity);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function getById(entity, id, options = {}) {
  if (provider === 'mysql') return mysqlGetById(entity, id, options);
  if (provider === 'postgres') return pgGetById(entity, id);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function create(entity, payload, options = {}) {
  if (provider === 'mysql') return mysqlCreate(entity, payload, options);
  if (provider === 'postgres') return pgCreate(entity, payload);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function update(entity, id, payload, options = {}) {
  if (provider === 'mysql') return mysqlUpdate(entity, id, payload, options);
  if (provider === 'postgres') return pgUpdate(entity, id, payload);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function remove(entity, id, options = {}) {
  if (provider === 'mysql') return mysqlDelete(entity, id, options);
  if (provider === 'postgres') return pgDelete(entity, id);
  throw new Error(`DB_PROVIDER no soportado: ${provider}`);
}

export async function restoreMysqlBackup(sqlDump) {
  if (provider !== 'mysql') throw new Error('La restauración SQL sólo está disponible con DB_PROVIDER=mysql');
  return mysqlRestoreBackup(sqlDump);
}

export function getProvider() {
  return provider;
}
