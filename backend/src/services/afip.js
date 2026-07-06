export function buildQrPayload(factura) {
  return Buffer.from(JSON.stringify({
    ver: 1,
    fecha: factura.fecha,
    cuit: process.env.AFIP_CUIT || process.env.DEFAULT_TENANT_CUIT || '30999999997',
    ptoVta: Number(process.env.AFIP_PTO_VTA || 1),
    tipoCmp: factura.tipo,
    nroCmp: factura.id,
    importe: Number(factura.total),
    moneda: 'PES',
    ctz: 1,
    tipoDocRec: 80,
    nroDocRec: factura.clienteId,
    tipoCodAut: 'E',
    codAut: factura.cae || null
  })).toString('base64url');
}

export async function requestCAE({ tipo, total }) {
  if (process.env.AFIP_MODE === 'real') {
    const required = ['AFIP_CUIT', 'AFIP_CERT_PATH', 'AFIP_KEY_PATH', 'AFIP_WSFE_URL'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) throw new Error(`AFIP real no configurado. Faltan: ${missing.join(', ')}`);
    // Punto de integración productivo: WSAA loginCms + WSFEv1 FECAESolicitar.
    // Se deja explícito para no emitir comprobantes fiscales sin credenciales reales.
    throw new Error('AFIP_MODE=real requiere implementar firma WSAA/WSFEv1 con certificado productivo/homologación');
  }
  const cae = `${Math.floor(10 ** 13 + Math.random() * 9 * 10 ** 13)}`;
  const vence = new Date();
  vence.setDate(vence.getDate() + 10);
  return { cae, vencimiento: vence.toISOString().slice(0, 10), provider: 'AFIP_DEMO', tipo, total };
}
