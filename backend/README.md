# Backend Demo - Sistema de Gestion

Backend en **fases** para complementar el front actual.

## Fases implementadas

- **Fase 1:** autenticación, sesiones JWT, usuarios/roles/permisos y CRUD base (ahora con storage `json` o `postgres`).
- **Fase 2:** facturación con reglas IVA, simulación CAE y PDF backend en `application/pdf`.
- **Fase 3:** informes de resumen y envío de factura por mail vía SMTP configurable (con fallback `console` para desarrollo).

## Ejecutar

```bash
cd backend
npm install
npm run start
```

Servidor: `http://localhost:4000`

## Proveedor de base de datos

Por defecto usa `json` (archivo local).

Para pasar a PostgreSQL:

```bash
cp .env.example .env
# editar .env: DB_PROVIDER=postgres y DATABASE_URL=...
npm run start
```

## Usuarios demo

- `admin/admin123`
- `vendedor/vendedor123`
- `tesoreria/tesoreria123`
- `contador/contador123`

## Endpoints principales

- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/entities/:entity`
- `POST /api/facturas/simular-cae`
- `POST /api/facturas`
- `GET /api/facturas`
- `GET /api/facturas/:id/pdf`
- `GET /api/informes/resumen`
- `GET /api/informes/egresos-por-categoria`
- `POST /api/informes/enviar-factura-mail-demo`


> Nota: si existía `db.json` con passwords legacy en texto plano, se normalizan a hash en el primer arranque.


## Seguridad, validación y observabilidad

- Validación por entidad/factura con respuestas `400` y detalle por campo.
- Headers de seguridad, CORS configurable (`CORS_ORIGIN`) y rate limit (`RATE_LIMIT_*`).
- `X-Request-Id` por request y logs JSON con método, ruta, estado y duración.

## Mail y PDF

- El PDF de factura se genera en backend como `application/pdf`.
- Para envío real configurar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM`.
- En desarrollo, `MAIL_PROVIDER=console` permite probar el flujo sin SMTP externo.

## Tests

```bash
npm test
```
