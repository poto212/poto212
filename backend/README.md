# Backend Demo - Sistema de Gestion

Backend en **fases** para complementar el front actual, ahora orientado a MySQL por defecto para dejar atrás el storage JSON en backend.

## Fases implementadas

- **Fase 1:** autenticación, sesiones JWT, usuarios/roles/permisos y CRUD base con storage `mysql` por defecto (`postgres` queda como adapter alternativo).
- **Fase 2:** facturación con reglas IVA, simulación CAE y PDF backend en `application/pdf`.
- **Fase 3:** informes de resumen y envío de factura por mail vía SMTP configurable (con fallback `console` para desarrollo).

## Ejecutar con MySQL

1. Crear base/tablas:

```bash
mysql -u root -p < sql/mysql-init.sql
```

2. Configurar entorno:

```bash
cp .env.example .env
# editar MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD y MYSQL_DATABASE
```

3. Instalar y levantar:

```bash
npm install
npm run seed
npm run start
```

Servidor: `http://localhost:4000`

## Proveedor de base de datos

Por defecto usa **MySQL relacional** con tablas por entidad, `tenants` y `audit_logs`:

```env
DB_PROVIDER=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=sistema_gestion
DEFAULT_TENANT_ID=1
DEFAULT_TENANT_NAME=Empresa Demo
```

PostgreSQL sigue disponible como adapter alternativo si necesitás migrar o comparar proveedores:

```env
DB_PROVIDER=postgres
DATABASE_URL=postgresql://user:pass@localhost:5432/sistema_gestion
```

## Usuarios demo

- `admin/admin123`
- `vendedor/vendedor123`
- `tesoreria/tesoreria123`
- `contador/contador123`

## Endpoints principales

- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/entities/:entity`
- `POST /api/entities/productos/stock-barcode`
- `POST /api/facturas/simular-cae`
- `POST /api/facturas`
- `GET /api/facturas`
- `GET /api/facturas/:id/pdf`
- `GET /api/informes/resumen`
- `GET /api/informes/egresos-por-categoria`
- `GET /api/informes/stock-alertas`
- `GET /api/informes/caja`
- `POST /api/informes/enviar-factura-mail-demo`
- `GET /api/backup/mysql.sql`
- `POST /api/backup/mysql/restore`
- `GET /api/auth/tenants`
- `POST /api/auth/switch-tenant`

## Seguridad, validación y observabilidad

- Validación por entidad/factura con respuestas `400` y detalle por campo.
- Headers de seguridad, CORS configurable (`CORS_ORIGIN`) y rate limit (`RATE_LIMIT_*`).
- `X-Request-Id` por request y logs JSON con método, ruta, estado y duración.
- Auditoría persistente en `audit_logs` para altas, modificaciones y bajas MySQL.
- Tablas operativas para items de factura, pagos, cobranzas, depósitos y movimientos de stock.

## Mail y PDF

- El PDF de factura se genera en backend como `application/pdf`.
- Para envío real configurar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM`.
- En desarrollo, `MAIL_PROVIDER=console` permite probar el flujo sin SMTP externo.

## Tests

```bash
npm test
```

## Backup MySQL

El usuario `admin` puede descargar un dump SQL desde la UI (Base de Datos > Backup MySQL) o directamente con:

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:4000/api/backup/mysql.sql -o backup.sql
```

Para restaurar, la UI exige seleccionar un `.sql` generado por el sistema y escribir `RESTAURAR`. El endpoint valida el encabezado del backup y sólo acepta sentencias `SET FOREIGN_KEY_CHECKS`, transacción, `DELETE` e `INSERT` sobre tablas operativas permitidas.

```bash
curl -X POST http://localhost:4000/api/backup/mysql/restore \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"confirm":"RESTAURAR","sql":"-- Sistema Gestion MySQL backup\n..."}'
```

## Multiempresa

- `tenants` se administra desde la pestaña Base de Datos > Empresas.
- El login y el selector de la topbar trabajan con `tenantId`; el backend agrega `tenantId` al JWT y filtra clientes, productos, egresos, facturas, pagos, cobranzas, depósitos y stock por empresa.
- `POST /api/auth/switch-tenant` emite una nueva sesión para cambiar de empresa. Los usuarios no admin requieren existir y estar activos en la empresa destino; admin puede administrar tenants globalmente.

## Docker / CI

- `docker-compose up --build` levanta MySQL, backend y frontend.
- `.github/workflows/ci.yml` ejecuta tests backend contra MySQL en CI.
