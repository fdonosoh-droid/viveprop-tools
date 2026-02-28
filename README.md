# viveprop-tools

Plataforma interna de herramientas inmobiliarias para **ViveProp**. Consolida aplicaciones de evaluacion financiera y comercial bajo un shell unificado con autenticacion, navegacion y control de acceso por corredor.

## Origen

Las personas de ViveProp crearon dos aplicaciones standalone con [Lovable.app](https://lovable.dev):

- **evaluacion-comercial** — Tasacion de propiedades: comparables, depreciacion y rentabilidad
- **perfilamiento-compradores** — Perfilamiento hipotecario: DTI, LTV, analisis de ingresos

Nosotros construimos **api** y **web** para integrarlas en una sola plataforma con login, navegacion lateral y permisos por usuario.

## Estructura del repositorio

```
viveprop-tools/
├── api/                          # Rails 8 API (autenticacion, permisos, corredores)
├── web/                          # React SPA unificada (shell + herramientas integradas)
├── evaluacion-comercial/         # App original Lovable (standalone, referencia)
├── perfilamiento-compradores/    # App original Lovable (standalone, referencia)
├── branding/                     # Logos, favicons, guia de colores
└── docs/                         # Documentacion de diseño y planes
```

## Stack

| Capa | Tecnologia |
|------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS 3, shadcn/ui |
| **Backend** | Ruby on Rails 8.1 (API mode), Puma |
| **Auth** | JWT (HS512), login contra base legacy |
| **PDF** | jsPDF + html2canvas |

## API Endpoints

```
POST   /api/v1/auth/login                    # Login (email + password)
GET    /api/v1/admin/tool_permissions         # Listar permisos (admin)
PATCH  /api/v1/admin/tool_permissions/:user_id # Actualizar permisos (admin)
GET    /api/v1/captacion/corredores           # Listar corredores ViveProp
```

## Mapa de la aplicacion

```
                          ┌──────────────┐
                          │    Login     │
                          │   (JWT)      │
                          └──────┬───────┘
                                 │
                          ┌──────┴───────┐
                          │  Dashboard   │
                          │  + Sidebar   │
                          └──┬────────┬──┘
                             │        │
              ┌──────────────┘        └──────────────┐
              │                                      │
    ┌─────────┴──────────┐             ┌─────────────┴──────────┐
    │  Evaluacion        │             │  Perfilamiento          │
    │  Comercial         │             │  Compradores            │
    │  /evaluacion-*     │             │  /perfilamiento-*       │
    └────────────────────┘             └────────────────────────┘

              ┌──────────────────────────────┐
              │  Admin  (solo admin)         │
              │  /admin                      │
              │  - Listar corredores         │
              │  - Activar/desactivar tools  │
              └──────────────────────────────┘
```

## Desarrollo local

### API (Rails)

```bash
cd api
bundle install
bin/rails db:setup
bin/rails server  # http://localhost:3000
```

### Web (React)

```bash
cd web
npm install
npm run dev  # http://localhost:5173
```

### Apps standalone (referencia)

```bash
cd evaluacion-comercial   # o perfilamiento-compradores
npm install
npm run dev  # http://localhost:8080
```
