import * as storage from '../data/storage.js';

const BACKUP_ENTITIES = ['tenants', 'users', 'clientes', 'proveedores', 'productos', 'egresos', 'facturas', 'factura_items', 'pagos', 'cobranzas', 'depositos', 'stock_movimientos'];

function sqlValue(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "''")}'`;
}

function insertStatement(table, row) {
  const columns = Object.keys(row);
  const values = columns.map((column) => sqlValue(row[column]));
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

export async function buildMysqlBackup() {
  const lines = [
    '-- Sistema Gestion MySQL backup',
    `-- Generated at: ${new Date().toISOString()}`,
    'SET FOREIGN_KEY_CHECKS=0;',
    'START TRANSACTION;'
  ];

  for (const entity of BACKUP_ENTITIES) {
    const rows = await storage.list(entity).catch(() => []);
    lines.push('', `-- ${entity}`, `DELETE FROM ${entity};`);
    for (const row of rows) lines.push(insertStatement(entity, row));
  }

  lines.push('', 'COMMIT;', 'SET FOREIGN_KEY_CHECKS=1;', '');
  return lines.join('\n');
}
