<p align="center">
  <img src="./assets/banner-profile.svg" alt="Juan Diego Sánchez — Licenciado en Sistemas · Jefe de IT · Software, Infraestructura, Seguridad y Automatización" width="100%">
</p>

<h3 align="center">Sistemas reales. Infraestructura real. Automatización con criterio.</h3>

<p align="center">
  <img alt="Argentina" src="https://img.shields.io/badge/Argentina-75AADB?style=for-the-badge&logo=googlemaps&logoColor=white">
  <img alt="Licenciado en Sistemas" src="https://img.shields.io/badge/Licenciado_en_Sistemas-1D4ED8?style=for-the-badge">
  <img alt="Jefe de IT" src="https://img.shields.io/badge/Jefe_de_IT-0F766E?style=for-the-badge">
  <img alt="Desarrollo Full Stack" src="https://img.shields.io/badge/Full_Stack-7C3AED?style=for-the-badge">
</p>

<p align="center">
  <img alt="SaaS, CRM y ERP" src="https://img.shields.io/badge/SaaS_%7C_CRM_%7C_ERP-2563EB?style=flat-square">
  <img alt="Infraestructura y DevOps" src="https://img.shields.io/badge/Infraestructura_%7C_DevOps-0E7490?style=flat-square">
  <img alt="SecOps y observabilidad" src="https://img.shields.io/badge/SecOps_%7C_Observability-DC2626?style=flat-square">
  <img alt="Automatización e inteligencia artificial" src="https://img.shields.io/badge/Automation_%7C_AI-9333EA?style=flat-square">
  <img alt="Portfolio revisado el 21 de octubre de 2026" src="https://img.shields.io/badge/Revisado-21_Oct_2026-334155?style=flat-square">
</p>

<p align="center">
  <a href="#-perfil">Perfil</a> ·
  <a href="#-proyectos-principales">Proyectos principales</a> ·
  <a href="#-portfolio-completo">Portfolio</a> ·
  <a href="#-novedades-verificadas">Actualizaciones</a> ·
  <a href="#-arquitectura-y-practicas">Arquitectura y prácticas</a> ·
  <a href="#-stack-y-metodo">Stack y método</a>
</p>

---

## 👨‍💻 Perfil

Soy **Juan Diego Sánchez**, **Licenciado en Sistemas** y **Jefe de IT**. Diseño, desarrollo y opero soluciones que unen procesos de negocio, software, infraestructura y seguridad.

Mi trabajo se concentra en convertir planillas, operaciones manuales y aplicaciones heredadas en **plataformas integradas, auditables, observables y recuperables**. Me interesan tanto la experiencia del usuario como lo que ocurre después del deploy: permisos, datos, incidencias, backups y mantenimiento.

**Qué abordo:** SaaS multi-tenant · ERP/CRM · ITSM y gobierno IT · portales empresariales · integraciones/API · automatización · modernización legacy · observabilidad · seguridad por diseño.

| 🧩 Software | 🛡️ Seguridad | 📡 Observabilidad | ⚙️ Automatización |
|:--:|:--:|:--:|:--:|
| SaaS · ERP · CRM · ITSM | RBAC · MFA · Auditoría | Métricas · Logs · Alertas | APIs · Workers · Integraciones |

> **Sobre el portfolio:** varios productos son privados o de uso interno. Comparto alcance y tecnologías sin publicar código restringido, instalaciones de clientes, IPs, credenciales, datos de negocio ni accesos operativos. Los estados de staging, candidata y producción no son equivalentes.

## ⭐ Proyectos principales

### 🛡️ Apollo WebGuard — Observabilidad y SecOps

![Observabilidad](https://img.shields.io/badge/OBSERVABILITY-0369A1?style=flat-square) ![Seguridad](https://img.shields.io/badge/SECOPS-DC2626?style=flat-square)

Monitoreo y diagnóstico de servidores, servicios, contenedores y disponibilidad. Integra señales de Proxmox, Docker, Nginx, Uptime Kuma, Wazuh, Grafana, Prometheus, Loki y Alertmanager; contempla incidentes, evidencia, alertas, backups y recuperación. **Apollo observa infraestructura; ControlApp administra el portfolio de aplicaciones.**

`Linux` · `Docker` · `Proxmox` · `Prometheus` · `Grafana` · `SecOps`

---

### 🧭 ControlApp — Gobierno multiaplicación

![Multiapp](https://img.shields.io/badge/MULTI--APP-7C3AED?style=flat-square) ![Integración](https://img.shields.io/badge/READ--ONLY_FIRST-0F766E?style=flat-square)

Plano administrativo para clientes, aplicaciones, entornos, versiones, sesiones, auditoría, backups e incidentes. Usa **adaptadores de solo lectura**, collectors normalizados, catálogo de servicios y permisos por aplicación. El ecosistema ya contempla adapters para **Baudo, Toolbox, Exabyte ERP, Estudio Roza, TAU, Resinta y STM**, además de métricas de negocio saneadas. Las acciones remotas de riesgo no reciben ejecución implícita.

`Node.js` · `React` · `PostgreSQL` · `Redis` · `MFA` · `Approval Gate`

---

### 🏥 Health Turnos — SaaS sanitario multi-tenant

![HealthTech](https://img.shields.io/badge/HEALTHTECH-2563EB?style=flat-square) ![SaaS](https://img.shields.io/badge/MULTI--TENANT-0E7490?style=flat-square)

Agenda, pacientes, profesionales, sedes, historia clínica electrónica, laboratorios, radiología, cobros, booking público y colaboración. La **etapa 55** incorpora preparación defensiva para VPS, Turnstile y readiness orientado a WebGuard, sobre la base de Stage 54 (preflight, backups cifrados trazables, restore aislado y recuperación). **Preparación para despliegue no significa servicio público ya habilitado.**

`PostgreSQL` · `Prisma` · `Redis` · `Docker` · `RBAC` · `MFA`

---

### 💬 WA CRM Sender — Mensajería y automatización multiempresa

![Mensajería](https://img.shields.io/badge/MESSAGING-0E7490?style=flat-square) ![Integraciones](https://img.shields.io/badge/INTEGRATIONS-7C3AED?style=flat-square)

CRM, campañas, bandeja de equipo, API de integraciones y webhooks firmados. Su release **v3.14.0** documenta entrega saliente anti-duplicados, control multi-tenant RLS/BOLA, colas, DLQ, Security Gate y ensayo de recuperación.

`Node.js` · `PostgreSQL RLS` · `Redis/BullMQ` · `Workers` · `HMAC`

---

### 🧰 Toolbox — Utilidades técnicas privacy-first

![Toolbox](https://img.shields.io/badge/V1.0.0-STABLE-16A34A?style=flat-square) ![Privacy first](https://img.shields.io/badge/PRIVACY--FIRST-0369A1?style=flat-square)

Aplicación autoalojable con herramientas para PDF, imágenes, OCR, QR, certificados X.509/CSR, GeoIP, red, datos y soporte IT. **v1.0.0 estable**; prioriza procesamiento local, servicios externos explícitos, workers aislados y verificación de release. Preparada para integración de solo lectura con ControlApp sin perder independencia.

`PWA` · `Browser-first` · `Docker` · `Trivy/SBOM` · `E2E`

---

### ⚖️ Baudo — LegalTech y gestión jurídica

![Baudo](https://img.shields.io/badge/V1.0.0-INTERNAL_PRODUCTION-16A34A?style=flat-square) ![LegalTech](https://img.shields.io/badge/LEGALTECH-7C3AED?style=flat-square)

Plataforma jurídica y laboral con expedientes, clientes, timeline, tareas, documentos privados, RRHH, morosidad, importaciones transaccionales y portal del cliente. **v1.0.0** fue publicada como release de producción interna desde una fuente productiva verificada, con Prisma Migrate formalizado, backup/restore comprobado y evidencia de release. La publicación interna no implica exposición abierta a Internet.

`Node.js` · `TypeScript` · `PostgreSQL` · `Prisma` · `Redis` · `ClamAV`

## 🚀 Portfolio completo

| Dominio | Producto | Qué resuelve |
|:--|:--|:--|
| Finanzas | **TAU — Tu Administración Unificada** | Espacios personales, familiares y empresariales; cuentas, tarjetas, cuotas, OCR local, conciliación, reintegros, Control Center y adapter read-only para observación centralizada. |
| Seguros | **BrokerFlow / OLBROKER** | Clientes, pólizas, producción, siniestros, chat, importación transaccional y despliegues controlados Blue/Green. |
| LegalTech | **Baudo v1.0.0** | Gestión jurídica/laboral, expedientes, documentos privados, RRHH, morosidad, importaciones transaccionales y portal cliente. Release de **producción interna** publicado sobre código verificado. |
| CRM | **Apollo CRM** | CRM multiempresa modular con contactos, leads, oportunidades, Timeline 360, presencia colaborativa, scoring, integraciones y copiloto IA asistivo. |
| Gobierno IT | **IT Desk Romera** | Centro independiente para aplicaciones, identidades, permisos, sesiones, salud, seguridad y auditoría. **No procesa tickets ni reemplaza ITFlow/GLPI**. |
| ITSM / CMDB | **ITFlow + GLPI** | Mesa de ayuda, tickets, activos e inventario con GLPI como fuente de verdad, más portal, API, automatizaciones y Update Manager. |
| Comercio | **Exabyte ERP Store** | ERP + ecommerce: stock, cuentas corrientes, catálogo, proveedores, pagos, seriales/garantías, service e integración read-only con ControlApp. |
| Agro | **Silos / Resinta** | Modernización de sistema heredado, concurrencia, importaciones seguras, idempotencia durable y adapter read-only para ControlApp. |
| Finanzas | **Financiera RM** | Modernización financiera en entorno LAB, controles por sucursal, auditoría, antifraude consultivo y portal de Soporte IT. |
| Sindicatos | **STM** | Portal institucional/afiliado, padrón, importación transaccional, cuotas y pagos, documentos seguros, MFA, auditoría y administración IT local. |
| Contabilidad | **EstudioRoza Contable** | Sitio institucional, portal cliente y backoffice contable con documentación, vencimientos, auditoría, backups y adapter read-only. |
| Utilidades | **Toolbox v1.0.0** | Suite self-hosted privacy-first para PDF, imágenes, OCR, datos, certificados, GeoIP, QR y tareas IT. |
| Compras | **App Comprar Precios** | Comparación de precios por artículo, cantidad, peso, volumen y unidad. |
| Herramientas internas | **Firma Romera** | Generador institucional de firmas HTML para clientes de correo. |

## 🗓️ Novedades verificadas

**Revisión del 21 de octubre de 2026**, tomando como referencia el estado actualmente versionado en los repositorios:

- **Baudo v1.0.0 — producción interna:** publicación inmutable desde una fuente productiva verificada, con Prisma Migrate formalizado, backup/restore comprobado y release interno fijado al código desplegado. Esto no implica publicación abierta a Internet.
- **IT Desk Romera v0.13.0-stage:** nuevo repositorio independiente para gobierno tecnológico. Se separó de ITFlow/GLPI y de Financiera RM, con API, interfaz, MySQL propios, MFA, auditoría, CI/E2E/Security Gate y controles anti-SSRF.
- **Apollo CRM:** nuevo CRM multiempresa con ASP.NET Core, React, TypeScript, PostgreSQL y Docker. Está en desarrollo activo y preparación de piloto; todavía no se declara producción.
- **STM:** pasó de portal básico a plataforma integral con portal del afiliado, padrón transaccional, cuotas/pagos, documentos con cuarentena/antivirus, MFA, auditoría, backups/restore tests y adapter read-only para ControlApp.
- **ControlApp:** amplió el onboarding read-only hacia Exabyte, Estudio Roza, TAU y Resinta, sumó STM y una vista genérica de métricas de negocio saneadas, manteniendo el modelo deny-by-default.
- **Exabyte ERP Store / TAU / Resinta / Estudio Roza:** incorporaron o ampliaron contratos privados de observación para ControlApp sin entregar acceso directo a bases ni superficies de escritura.
- **Estado de revisión:** al 21/10 no hay un commit posterior verificable en Apollo WebGuard, OLBROKER, IT Desk Romera o Exabyte ERP Store respecto de las referencias ya publicadas; los avances que todavía no estén versionados no se presentan como terminados.

<details>
<summary><strong>Ver referencias técnicas verificadas</strong></summary>

| Sistema | Referencia actual |
|:--|:--|
| Baudo | `v1.0.0` · producción interna publicada |
| IT Desk Romera | `v0.13.0-stage` · staging / validación antes de promoción |
| Apollo CRM | desarrollo activo · preparación de piloto |
| Toolbox | `v1.0.0 estable` |
| ITFlow | `v0.7.1 estable` |
| WA CRM Sender | `v3.14.0` |
| Health Turnos | Stage 55 · defensa VPS / Turnstile / WebGuard readiness |
| TAU | `v0.6.0` + adapter read-only |
| Exabyte ERP Store | `6.2.0-rc.6` en el repositorio; candidata, no declarada estable |
| Silos / Resinta | `v3.2.1-stage21` + adapter read-only |
| Financiera RM | `0.11.0-LAB` |

</details>

## 🏗️ Arquitectura y prácticas

No hay una única arquitectura para todos los proyectos. Reutilizo **contratos y controles**, no acoplamiento entre bases de datos ni permisos administrativos compartidos.

~~~mermaid
flowchart LR
    U[Usuarios / Integraciones] --> P[HTTPS / Reverse Proxy]
    P --> A[Portales y APIs]
    A --> D[(Datos aislados)]
    A --> Q[Colas / Workers]
    A --> E[Eventos / Auditoría]
    S[Hosts / Contenedores] --> O[Apollo WebGuard]
    A -. Adaptadores read-only .-> C[ControlApp]
    O -. Estado / Incidentes .-> C
    E --> C
    I[IT Desk Romera] -. Identidades / Gobierno .-> A
~~~

| Seguridad | Confiabilidad | Operación |
|:--|:--|:--|
| RBAC, MFA, mínimo privilegio, BOLA/BFLA, RLS cuando corresponde | Health/readiness, preflight, idempotencia, retry/DLQ | Metrics, logs, correlation IDs, incidentes |
| Secretos fuera del repositorio, scopes/allowlists, auditoría | Backup con prueba de restauración, rollback, Blue/Green según el sistema | Catálogo de servicios, dashboards y evidencia |
| Security Gate, análisis de dependencias/SBOM y revisión humana | CI, tests, E2E, smoke antes de promoción | IA asistiva, sin permisos destructivos implícitos |

## 🛠️ Stack y método

<p align="center"><strong>Desarrollo</strong></p>
<p align="center">
  <img alt="TypeScript, JavaScript, Node.js, React, Next.js, .NET, Java, Spring y Python" src="https://skillicons.dev/icons?i=ts,js,nodejs,react,nextjs,dotnet,java,spring,python&theme=dark">
</p>

<p align="center"><strong>Datos · Infraestructura · DevOps</strong></p>
<p align="center">
  <img alt="PostgreSQL, MySQL, Redis, Linux, Ubuntu, Docker, Nginx, Git y GitHub" src="https://skillicons.dev/icons?i=postgres,mysql,redis,linux,ubuntu,docker,nginx,git,github&theme=dark">
</p>

<p align="center">
  <img alt="Proxmox" src="https://img.shields.io/badge/Proxmox-VE-E57000?style=for-the-badge&logo=proxmox&logoColor=white">
  <img alt="Grafana" src="https://img.shields.io/badge/Grafana-Observability-F46800?style=for-the-badge&logo=grafana&logoColor=white">
  <img alt="Prometheus" src="https://img.shields.io/badge/Prometheus-Metrics-E6522C?style=for-the-badge&logo=prometheus&logoColor=white">
  <img alt="Wazuh" src="https://img.shields.io/badge/Wazuh-SecOps-005571?style=for-the-badge">
</p>

**Stack transversal:** Prisma, colas de trabajo, GitHub Actions, Loki, Uptime Kuma, Trivy y ClamAV.

**Forma de trabajo**

> **PRESERVAR → REVISAR → CAMBIO MÍNIMO → VALIDAR → PROBAR → DOCUMENTAR**

Antes de declarar un cambio como terminado: verificar estado real, preservar datos y módulos estables, ejecutar las pruebas aplicables y documentar evidencia y procedimiento de recuperación.

---

<p align="center">
  <strong>Software · Infraestructura · Automatización · DevOps · SecOps · IA aplicada</strong><br>
  <a href="https://github.com/poto212">Perfil GitHub</a> ·
  <a href="https://github.com/poto212?tab=repositories">Repositorios visibles</a>
  <br><sub>Portfolio técnico · Proyectos públicos y privados documentados sin exponer infraestructura sensible.</sub>
</p>

<p align="center">
  <img alt="Pie decorativo azul y cian" width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=95&section=footer&color=0:020617,50:1d4ed8,100:06b6d4">
</p>
