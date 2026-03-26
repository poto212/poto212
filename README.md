# Demo MVP - Sistema de Gestion

Prototipo front-end de gestión comercial/administrativa con pestañas de Inicio, Ingresos, Egresos, Base de Datos, Informes y Tesorería.

## Incluye

- Dashboard con KPIs y gráficos.
- Egresos completo con alta + listado + búsqueda.
- Base de datos de prueba funcional en `localStorage` para Clientes/Proveedores/Productos (ABM, edición, borrado, export JSON y reset demo).
- Informes con resumen financiero dinámico, gráfico por categoría de egresos y generador de informes (ventas/egresos/utilidad/stock) con exportación CSV.
- Facturación electrónica en modo demo: solicitud CAE (simulada), discriminación de IVA por condición fiscal (RI/Monotributo/Consumidor Final), impresión, PDF y envío por email (mailto).

## Ejecutar

```bash
python3 -m http.server 4173
```

Luego abrir `http://localhost:4173`.
