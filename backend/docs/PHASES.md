# Roadmap backend por fases

## Phase 1 (actual, avanzado)
- Login JWT (con contraseñas hasheadas en storage demo)
- Roles/permisos
- Normalización automática de passwords legacy en texto plano
- CRUD entidades maestras y egresos
- Abstracción de storage (json/postgres)
- Validación por entidad y respuestas 400 con detalle de campos
- Headers de seguridad, CORS configurable, rate limit, request id y logging JSON

## Phase 2 (actual, avanzado)
- Facturación con IVA por condición fiscal
- Simulación CAE
- Generación backend de PDF `application/pdf` para factura emitida

## Phase 3 (actual, avanzado)
- Informes de resumen
- Envío de factura por mail con proveedor SMTP configurable
- Fallback `MAIL_PROVIDER=console` para desarrollo sin SMTP

## Próximo paso sugerido (productivo)
1. Migrar storage JSONB genérico a esquema PostgreSQL relacional con migraciones.
2. Integrar WSAA/WSFEv1 real de AFIP con certificado, clave privada y numeración por punto de venta.
3. Reemplazar el PDF mínimo por plantilla fiscal/comercial con branding y QR.
4. Ampliar auditoría persistente por operación y métricas para monitoreo.
