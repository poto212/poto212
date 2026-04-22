# Backend Demo - Sistema de Gestion

Backend en **fases** para complementar el front actual.

## Fases implementadas

- **Fase 1:** autenticación, sesiones JWT, usuarios/roles/permisos y CRUD base (ahora con storage `json` o `postgres`).
- **Fase 2:** facturación demo con reglas IVA y simulación CAE + endpoint PDF stub.
- **Fase 3:** informes de resumen y endpoint demo para envío de factura por mail.

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
