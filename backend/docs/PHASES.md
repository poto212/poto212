# Roadmap backend por fases

## Phase 1 (actual, avanzado)
- Login JWT (con contraseñas hasheadas en storage demo)
- Roles/permisos
- Normalización automática de passwords legacy en texto plano
- CRUD entidades maestras y egresos
- Abstracción de storage (json/postgres)

## Phase 2 (actual demo)
- Facturación con IVA por condición fiscal
- Simulación CAE
- Hook para generación PDF real

## Phase 3 (actual demo)
- Informes de resumen
- Hook para envío por mail real

## Próximo paso sugerido (productivo)
1. Migrar storage de JSON a PostgreSQL.
2. Integrar WSAA/WSFEv1 real de AFIP.
3. Implementar PDF real en backend + envío SMTP/API transaccional.
4. Auditoría y logs por operación.
