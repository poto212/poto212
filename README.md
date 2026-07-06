# Demo MVP - Sistema de Gestion

Prototipo front-end de gestión comercial/administrativa con pestañas de Inicio, Ingresos, Egresos, Base de Datos, Informes y Tesorería.

## Incluye

- Dashboard con KPIs y gráficos.
- Egresos completo con alta + listado + búsqueda.
- Arquitectura unificada Frontend + Backend: el front usa por defecto la API (`http://localhost:4000`) para auth, entidades, facturas e informes.
- Backend orientado a MySQL por defecto; el modo demo localStorage queda sólo para demostraciones offline del frontend.
- Informes con resumen financiero dinámico, gráfico por categoría de egresos y generador de informes (ventas/egresos/utilidad/stock) con exportación CSV.
- Facturación electrónica en modo demo: solicitud CAE (simulada), discriminación de IVA por condición fiscal (RI/Monotributo/Consumidor Final), impresión, PDF y envío por email (mailto).
- Usuarios, sesiones y roles (admin, vendedor, tesoreria, contador) con permisos por módulo/acción en modo demo.

## Ejecutar (modo API recomendado)

```bash
cd backend
cp .env.example .env
# crear MySQL con: mysql -u root -p < sql/mysql-init.sql
npm install
npm run seed
npm run start
```

En otra terminal:

```bash
python3 -m http.server 4173
```

Luego abrir `http://localhost:4173`.

> El backend ya no usa JSON como storage principal: configurá MySQL en `backend/.env`. Si querés probar sólo la UI sin backend, cambiá el selector **Modo datos** a `Demo local`.

## Backend demo por fases

Se agregó un backend de referencia en `backend/` con Fase 1/2/3 (auth+roles, facturación demo, informes y mail demo). Ver `backend/README.md`.


## Capturas automáticas de pestañas

1. Levantá el front:

```bash
python3 -m http.server 4173
```

2. En otra terminal ejecutá:

```bash
bash scripts/take-tabs-screenshots.sh
```

Se generan imágenes en `artifacts/tabs/`:
- `inicio.png`
- `ingresos.png`
- `egresos.png`
- `base-datos.png`
- `informes.png`
- `tesoreria.png`

## Capturas responsive por viewport

Con el front levantado:

```bash
bash scripts/take-responsive-screenshots.sh
```

Genera capturas en `artifacts/responsive/` para:
- `desktop-1200.png`
- `tablet-768.png`
- `mobile-480.png`
