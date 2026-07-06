import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DB_PROVIDER = process.env.DB_PROVIDER || 'mysql';
process.env.MAIL_PROVIDER = 'console';
process.env.RATE_LIMIT_MAX = '1000';

const { createApp } = await import('../src/server.js');
const { initStorage } = await import('../src/data/storage.js');

async function withServer(run) {
  await initStorage();
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function login(baseUrl) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert.equal(response.status, 200);
  return response.json();
}

test('health includes security headers and observability metadata', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(Boolean(response.headers.get('x-request-id')), true);
    assert.equal(body.capabilities.validation, true);
  });
});

test('entity endpoint rejects invalid payloads with field errors', async () => {
  await withServer(async (baseUrl) => {
    const { token } = await login(baseUrl);
    const response = await fetch(`${baseUrl}/api/entities/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nombre: '', email: 'no-es-email', condicionIVA: 'Responsable Inscripto' })
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.error, 'Datos inválidos');
    assert.equal(body.fields.nombre, 'Campo requerido');
    assert.equal(body.fields.email, 'Email inválido');
  });
});

test('invoice flow creates invoices, returns a real PDF response and renders mail', async () => {
  await withServer(async (baseUrl) => {
    const { token } = await login(baseUrl);
    const invoiceResponse = await fetch(`${baseUrl}/api/facturas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ clienteId: 1, neto: 1000, alicuota: 21, concepto: 'Servicio técnico' })
    });
    const invoice = await invoiceResponse.json();
    assert.equal(invoiceResponse.status, 201);
    assert.equal(invoice.total, 1210);

    const pdfResponse = await fetch(`${baseUrl}/api/facturas/${invoice.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
    const pdf = Buffer.from(await pdfResponse.arrayBuffer());
    assert.equal(pdfResponse.status, 200);
    assert.match(pdfResponse.headers.get('content-type'), /application\/pdf/);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');

    const mailResponse = await fetch(`${baseUrl}/api/informes/enviar-factura-mail-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ facturaId: invoice.id, to: 'cliente@example.com' })
    });
    const mail = await mailResponse.json();
    assert.equal(mailResponse.status, 200);
    assert.equal(mail.ok, true);
    assert.equal(mail.provider, 'console');
  });
});

test('barcode stock endpoint increments product stock by SKU/code', async () => {
  await withServer(async (baseUrl) => {
    const { token } = await login(baseUrl);
    const response = await fetch(`${baseUrl}/api/entities/productos/stock-barcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ codigo: 'USB-C-01', cantidad: 2 })
    });
    const product = await response.json();
    assert.equal(response.status, 200);
    assert.equal(product.codigo, 'USB-C-01');
    assert.equal(Number(product.stock) >= 5, true);
  });
});
