# TrabajaHoy Frontend

Frontend del portal de empleo TrabajaHoy. La aplicacion principal es una SPA en `src/` construida con Vite y conectada a backend por API REST.

## Descripcion breve

Este repositorio implementa la interfaz de usuario para flujos de candidatos y reclutadores con autenticacion por roles, navegacion por hash y consumo de servicios HTTP.

## Stack tecnologico

- Vite 8
- JavaScript modular (ESM)
- Axios
- CSS
- GitHub Actions + GitHub Pages para despliegue

## Estructura general

```text
.
├─ src/
│  ├─ js/
│  │  ├─ core/        # config, router, store, roles
│  │  ├─ services/    # api client + servicios de dominio
│  │  └─ utils/       # helpers UI, storage, formularios
│  ├─ pages/          # controladores de vistas SPA
│  └─ styles/         # estilos globales
├─ public/
├─ .github/workflows/deploy.yml
├─ index.html
├─ vite.config.js
└─ package.json
```

## Requisitos previos

- Node.js 20+
- npm

## Instalacion

```bash
npm install
```

## Variables de entorno

Archivo recomendado para desarrollo local: `.env.local`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Resolucion actual de API base URL en `src/js/core/config.js`:

- Si `VITE_API_BASE_URL` existe, se usa ese valor.
- Si no existe:
  - en desarrollo usa `http://localhost:3000/api`
  - en produccion usa `https://trabajahoy-backend-production.up.railway.app/api`

## Ejecucion en desarrollo

```bash
npm run dev
```

Servidor local por defecto: `http://localhost:5173`

## Scripts disponibles

Definidos en `package.json`:

- `npm run dev`: inicia Vite en modo desarrollo
- `npm run build`: genera build de produccion en `dist/`
- `npm run preview`: sirve localmente el build generado
- `npm run test`: script placeholder (no hay suite de tests automatizados configurada)

## Build para produccion

```bash
npm run build
```

Salida: `dist/`

## Despliegue

El repositorio incluye workflow en `.github/workflows/deploy.yml` para GitHub Pages:

- Trigger en `push` a `main` o `master`
- Trigger manual con `workflow_dispatch`
- Ejecuta `npm ci` y `npm run build`
- Inyecta `VITE_API_BASE_URL` de produccion en el job de build
- Copia `public/404.html` a `dist/404.html` para soporte SPA
- Publica artifacts en GitHub Pages

Configuracion relevante de Vite (`vite.config.js`):

- `base` en produccion: `/Portal-de-Trabajo-TRABAJAHOY/`

## Flujos implementados

### Candidate

- Login y registro de candidato
- Dashboard de candidato
- Busqueda de vacantes y detalle
- Guardar vacantes
- Postular a vacantes
- Ver postulaciones
- Ver/editar perfil
- Gestion de CV

### Recruiter

- Login (por rol)
- Crear vacante
- Ver mis vacantes
- Publicar vacantes en estado draft

## Notas importantes

- La SPA activa y mantenida se ejecuta desde `src/`.
- Existen assets legacy en `views/`; no forman parte del routing funcional principal en `src/js/main.js`.
- Algunas rutas de empresa/admin siguen como placeholder en `main.js` (por ejemplo dashboard/perfil de empresa y panel admin).

## Estado actual del proyecto

Estado: MVP funcional por roles con flujos candidate y recruiter operativos para demo tecnica.

Pendiente en esta rama principal:

- Completar modulos de empresa/admin que siguen en placeholder
- Extender gestion recruiter (por ejemplo edicion avanzada y gestion de postulantes)
