const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CUIT_RE = /^\d{2}-?\d{8}-?\d$/;
const IVA_CONDICIONES = ['Responsable Inscripto', 'Monotributista', 'Consumidor Final'];
const ROLES = ['admin', 'vendedor', 'tesoreria', 'contador'];

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function requireString(payload, field, errors, { min = 1, max = 160 } = {}) {
  const value = cleanString(payload[field]);
  if (typeof value !== 'string' || value.length < min) {
    errors[field] = 'Campo requerido';
    return undefined;
  }
  if (value.length > max) errors[field] = `Máximo ${max} caracteres`;
  return value;
}

function optionalString(payload, field, errors, { max = 160 } = {}) {
  const value = cleanString(payload[field]);
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') {
    errors[field] = 'Debe ser texto';
    return undefined;
  }
  if (value.length > max) errors[field] = `Máximo ${max} caracteres`;
  return value;
}

function requireNumber(payload, field, errors, { min = 0 } = {}) {
  const value = Number(payload[field]);
  if (!Number.isFinite(value) || value < min) {
    errors[field] = `Debe ser un número mayor o igual a ${min}`;
    return undefined;
  }
  return value;
}

function requireEnum(payload, field, allowed, errors) {
  const value = cleanString(payload[field]);
  if (!allowed.includes(value)) {
    errors[field] = `Valor inválido. Permitidos: ${allowed.join(', ')}`;
    return undefined;
  }
  return value;
}

function validateEmail(value, errors, field = 'email') {
  if (value && !EMAIL_RE.test(value)) errors[field] = 'Email inválido';
}

function validateCuit(value, errors) {
  if (value && !CUIT_RE.test(value)) errors.cuit = 'CUIT inválido';
}

function result(data, errors) {
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function validateEntity(entity, payload = {}, { partial = false } = {}) {
  const errors = {};
  const data = {};
  const required = partial ? optionalString : requireString;

  if (entity === 'clientes') {
    data.nombre = required(payload, 'nombre', errors);
    data.cuit = optionalString(payload, 'cuit', errors, { max: 13 });
    data.telefono = optionalString(payload, 'telefono', errors, { max: 40 });
    data.localidad = optionalString(payload, 'localidad', errors, { max: 80 });
    data.condicionIVA = partial
      ? optionalString(payload, 'condicionIVA', errors)
      : requireEnum(payload, 'condicionIVA', IVA_CONDICIONES, errors);
    if (data.condicionIVA && !IVA_CONDICIONES.includes(data.condicionIVA)) errors.condicionIVA = 'Condición IVA inválida';
    data.email = optionalString(payload, 'email', errors, { max: 160 });
    validateCuit(data.cuit, errors);
    validateEmail(data.email, errors);
  } else if (entity === 'proveedores') {
    data.nombre = required(payload, 'nombre', errors);
    data.cuit = optionalString(payload, 'cuit', errors, { max: 13 });
    data.telefono = optionalString(payload, 'telefono', errors, { max: 40 });
    data.localidad = optionalString(payload, 'localidad', errors, { max: 80 });
    data.email = optionalString(payload, 'email', errors, { max: 160 });
    validateCuit(data.cuit, errors);
    validateEmail(data.email, errors);
  } else if (entity === 'productos') {
    data.nombre = required(payload, 'nombre', errors);
    data.codigo = required(payload, 'codigo', errors, { max: 60 });
    data.stock = partial && payload.stock === undefined ? undefined : requireNumber(payload, 'stock', errors, { min: 0 });
    data.costo = partial && payload.costo === undefined ? undefined : requireNumber(payload, 'costo', errors, { min: 0 });
    data.precio = partial && payload.precio === undefined ? undefined : requireNumber(payload, 'precio', errors, { min: 0 });
    data.categoria = optionalString(payload, 'categoria', errors, { max: 80 });
  } else if (entity === 'egresos') {
    data.tipo = requireEnum(payload, 'tipo', ['Compra', 'Gasto'], errors);
    data.proveedor = required(payload, 'proveedor', errors);
    data.categoria = required(payload, 'categoria', errors, { max: 80 });
    data.fecha = required(payload, 'fecha', errors, { max: 10 });
    data.vencimiento = required(payload, 'vencimiento', errors, { max: 10 });
    data.estado = requireEnum(payload, 'estado', ['Pendiente', 'Pagado'], errors);
    data.monto = requireNumber(payload, 'monto', errors, { min: 1 });
    data.nota = optionalString(payload, 'nota', errors, { max: 500 });
  } else if (entity === 'users') {
    data.username = required(payload, 'username', errors, { min: 3, max: 40 });
    data.nombre = required(payload, 'nombre', errors, { max: 120 });
    data.rol = requireEnum(payload, 'rol', ROLES, errors);
    if (!partial || payload.password) data.password = requireString(payload, 'password', errors, { min: 8, max: 120 });
    data.activo = payload.activo !== false;
  } else {
    errors.entity = 'Entidad no soportada';
  }

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  if (payload.id !== undefined) data.id = payload.id;
  return result(data, errors);
}

export function validateFactura(payload = {}) {
  const errors = {};
  const data = {
    clienteId: requireNumber(payload, 'clienteId', errors, { min: 1 }),
    condicionIVA: payload.condicionIVA ? requireEnum(payload, 'condicionIVA', IVA_CONDICIONES, errors) : undefined,
    neto: requireNumber(payload, 'neto', errors, { min: 1 }),
    alicuota: payload.alicuota === undefined ? 21 : requireNumber(payload, 'alicuota', errors, { min: 0 }),
    concepto: requireString(payload, 'concepto', errors, { max: 240 }),
    cae: optionalString(payload, 'cae', errors, { max: 20 }) || null,
    caeVto: optionalString(payload, 'caeVto', errors, { max: 10 }) || null
  };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  return result(data, errors);
}

export function validateMailPayload(payload = {}) {
  const errors = {};
  const data = {
    facturaId: requireNumber(payload, 'facturaId', errors, { min: 1 }),
    to: requireString(payload, 'to', errors, { max: 160 })
  };
  validateEmail(data.to, errors, 'to');
  return result(data, errors);
}
