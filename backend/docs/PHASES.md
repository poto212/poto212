# Roadmap backend por fases

## Phase 1 (actual, avanzado)
- Login JWT (con contraseñas hasheadas en storage demo)
- Roles/permisos
- CRUD entidades maestras y egresos
- MySQL relacional por defecto con tablas por entidad, tenant demo y auditoría persistente
- PostgreSQL queda como adapter alternativo
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

## Stock (actual, avanzado)
- Carga rápida de stock por lector de código de barras/SKU
- Endpoint `POST /api/entities/productos/stock-barcode`
- Actualización de stock auditada en MySQL

## Responsive UI (actual, avanzado)
- Drawer móvil para navegación lateral
- Topbar apilable en viewports chicos
- Tablas convertidas a cards en mobile
- Breakpoints 1200px, 900px, 768px y 480px
- Controles táctiles con altura mínima de 44/48px

## Próximo paso sugerido (productivo)
1. Agregar migraciones versionadas y normalizar más tablas (items de factura, pagos, cobranzas, movimientos de stock).
2. Integrar WSAA/WSFEv1 real de AFIP con certificado, clave privada y numeración por punto de venta.
3. Reemplazar el PDF mínimo por plantilla fiscal/comercial con branding y QR.
4. Ampliar multiempresa para múltiples tenants administrables desde UI.
5. Agregar pruebas visuales Playwright por viewports (1200px, 768px, 480px).
