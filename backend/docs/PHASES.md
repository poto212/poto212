# Roadmap backend por fases

## Phase 1 (actual, avanzado)
- Login JWT (con contraseñas hasheadas en storage demo)
- Roles/permisos
- CRUD entidades maestras y egresos
- MySQL relacional por defecto con tablas por entidad, tenant demo y auditoría persistente
- Tablas agregadas: `factura_items`, `pagos`, `cobranzas`, `depositos`, `stock_movimientos`
- PostgreSQL queda como adapter alternativo
- Validación por entidad y respuestas 400 con detalle de campos
- Headers de seguridad, CORS configurable, rate limit, request id y logging JSON

## Phase 2 (actual, avanzado)
- Facturación con IVA por condición fiscal
- CAE mediante servicio AFIP configurable (`AFIP_MODE=demo|real`) con guardrails para modo real
- QR fiscal/base64 para comprobante
- Generación backend de PDF `application/pdf` para factura emitida
- Items de factura persistidos en `factura_items`

## Phase 3 (actual, avanzado)
- Informes de resumen
- Informes de caja (`/api/informes/caja`)
- Alertas de stock (`/api/informes/stock-alertas`)
- Envío de factura por mail con proveedor SMTP configurable
- Fallback `MAIL_PROVIDER=console` para desarrollo sin SMTP

## Stock (actual, avanzado)
- Carga rápida de stock por lector de código de barras/SKU
- Endpoint `POST /api/entities/productos/stock-barcode`
- Movimientos de stock en `stock_movimientos`
- Depósitos en `depositos`
- Actualización de stock auditada en MySQL

## Responsive UI (actual, avanzado)
- Drawer móvil para navegación lateral
- Topbar apilable en viewports chicos
- Tablas convertidas a cards en mobile
- Breakpoints 1200px, 900px, 768px y 480px
- Controles táctiles con altura mínima de 44/48px

## DevOps/CI (actual, base)
- Dockerfile backend
- `docker-compose.yml` con MySQL, backend y frontend estático
- Workflow GitHub Actions para MySQL + backend tests

## Próximo paso sugerido (productivo)
1. Convertir las tablas actuales a migraciones versionadas formales.
2. Completar implementación WSAA/WSFEv1 real con firma de certificado y ambiente homologación/producción.
3. Reemplazar el PDF mínimo por plantilla fiscal/comercial con diseño final y QR visual.
4. Ampliar multiempresa para múltiples tenants administrables desde UI con switching real por sesión.
5. Agregar pruebas visuales Playwright por viewports (1200px, 768px, 480px) al CI.
