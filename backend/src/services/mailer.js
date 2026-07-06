import net from 'net';
import tls from 'tls';
import { buildInvoicePdf } from './pdf.js';

function readLine(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (chunk) => {
      buffer += chunk.toString('utf-8');
      if (/\r?\n$/.test(buffer)) {
        socket.off('data', onData);
        resolve(buffer);
      }
    };
    socket.on('data', onData);
    socket.once('error', reject);
  });
}

async function command(socket, line, expected = /^[23]/) {
  if (line) socket.write(`${line}\r\n`);
  const response = await readLine(socket);
  if (!expected.test(response)) throw new Error(`SMTP rechazó comando ${line || '<connect>'}: ${response.trim()}`);
  return response;
}

function smtpSocket() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host) throw new Error('SMTP_HOST no configurado');
  return port === 465 ? tls.connect({ host, port }) : net.connect({ host, port });
}

function base64(value) {
  return Buffer.from(String(value), 'utf-8').toString('base64');
}

function mimeMessage({ from, to, subject, text, pdfBuffer }) {
  const boundary = `poto212-${Date.now()}`;
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
    '',
    `--${boundary}`,
    'Content-Type: application/pdf; name="factura.pdf"',
    'Content-Disposition: attachment; filename="factura.pdf"',
    'Content-Transfer-Encoding: base64',
    '',
    pdfBuffer.toString('base64').match(/.{1,76}/g).join('\r\n'),
    `--${boundary}--`,
    ''
  ].join('\r\n');
}

export async function sendInvoiceMail({ factura, to }) {
  if (process.env.MAIL_PROVIDER === 'console' || !process.env.SMTP_HOST) {
    return { ok: true, provider: 'console', status: 'rendered', detail: 'SMTP no configurado; email renderizado en consola' };
  }

  const from = process.env.SMTP_FROM || 'facturacion@example.com';
  const socket = smtpSocket();
  await command(socket, null);
  await command(socket, `EHLO ${process.env.SMTP_EHLO || 'localhost'}`);
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    await command(socket, 'AUTH LOGIN', /^334/);
    await command(socket, base64(process.env.SMTP_USER), /^334/);
    await command(socket, base64(process.env.SMTP_PASS), /^235/);
  }
  await command(socket, `MAIL FROM:<${from}>`);
  await command(socket, `RCPT TO:<${to}>`);
  await command(socket, 'DATA', /^354/);
  const body = mimeMessage({
    from,
    to,
    subject: `Factura ${factura.tipo} - ${factura.cliente}`,
    text: `Adjuntamos factura. Total: ${factura.total}. CAE: ${factura.cae || 'N/D'}`,
    pdfBuffer: buildInvoicePdf(factura)
  });
  await command(socket, `${body}\r\n.`);
  await command(socket, 'QUIT', /^221/);
  socket.end();
  return { ok: true, provider: 'smtp', status: 'sent' };
}
