function escapePdfText(value) {
  return String(value ?? '').replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

export function buildInvoicePdf(factura) {
  const lines = [
    `${process.env.DEFAULT_TENANT_NAME || 'Empresa Demo'} - Comprobante fiscal/comercial`,
    `Factura ${factura.tipo}`,
    `Fecha: ${factura.fecha}`,
    `Cliente: ${factura.cliente}`,
    `Condición IVA: ${factura.condicionIVA}`,
    `Concepto: ${factura.concepto}`,
    `Neto: ${Number(factura.neto).toFixed(2)}`,
    `IVA: ${Number(factura.iva).toFixed(2)}`,
    `Total: ${Number(factura.total).toFixed(2)}`,
    `CAE: ${factura.cae || 'N/D'} - Vto: ${factura.caeVto || 'N/D'}`,
    `QR fiscal: ${factura.qr || 'N/D'}`,
    `Emitido por: ${factura.creadoPor || 'sistema'}`
  ];
  const text = lines.map((line, idx) => `BT /F1 12 Tf 50 ${760 - idx * 24} Td (${escapePdfText(line)}) Tj ET`).join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(text)} >> stream\n${text}\nendstream endobj`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf-8');
}
