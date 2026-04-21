# Frontend Módulos Faltantes - Análisis de Cobertura API

## Resumen Ejecutivo

El frontend cubre **~40%** de los endpoints disponibles en la API. Hay **4 módulos completamente faltantes** y **6 módulos con cobertura parcial**.

### Estadísticas Generales

| Métrica | Valor |
|---------|-------|
| Servicios API implementados | 9 de 10 |
| Módulos con cobertura completa | 1 (Auth) |
| Módulos con cobertura parcial | 6 |
| Módulos completamente faltantes | 3 |
| Endpoints totales en API | ~80+ |
| Endpoints implementados en frontend | ~32 |

---

## 1. MÓDULOS COMPLETAMENTE FALTANTES

### 📌 Review (`/api/reviews`)
**Impacto:** Alto | **Prioridad:** Media  
**Servicios implementados:** ❌ Ninguno

**Funcionalidad:** Sistema de reseñas de empresas por candidatos.

**Endpoints faltantes:**
- `GET /api/reviews/company/:companyId` — Listar reseñas de empresa
- `GET /api/reviews/company/:companyId/summary` — Resumen de calificaciones
- `GET /api/reviews/:id` — Detalle de reseña
- `GET /api/reviews/me/list` — Mis reseñas (Auth)
- `POST /api/reviews/` — Crear reseña
- `PATCH /api/reviews/:id` — Editar reseña
- `DELETE /api/reviews/:id` — Eliminar reseña
- `POST /api/reviews/:id/helpfulness` — Marcar como útil
- `DELETE /api/reviews/:id/helpfulness` — Remover marca útil
- `POST /api/reviews/:id/reports` — Reportar reseña
- `GET /api/reviews/admin/reported/list` — Reseñas reportadas (Admin)
- `GET /api/reviews/admin/:id/reports` — Detalles de reportes (Admin)
- `PATCH /api/reviews/admin/:id/status` — Moderar reseña (Admin)

**Implementar:**
1. Service: `src/js/services/review.service.js`
2. Page: `src/pages/company-reviews.page.js` (mostrar reseñas de empresa)
3. Page: `src/pages/my-reviews.page.js` (gestionar mis reseñas - candidates)
4. Page: `src/pages/review-moderation.page.js` (admin panel)
5. Components: Review card, star rating, comment section

---

### 📌 Notification (`/api/notifications`)
**Impacto:** Alto | **Prioridad:** Media  
**Servicios implementados:** ❌ Ninguno

**Funcionalidad:** Centro de notificaciones y sistema de alertas.

**Endpoints faltantes:**
- `GET /api/notifications/unread-count` — Contador de no leídas
- `PATCH /api/notifications/read-all` — Marcar todas como leídas
- `POST /api/notifications/alerts` — Crear alerta (búsquedas guardadas)
- `GET /api/notifications/alerts` — Listar mis alertas
- `GET /api/notifications/alerts/:id` — Detalle alerta
- `PATCH /api/notifications/alerts/:id` — Editar alerta
- `DELETE /api/notifications/alerts/:id` — Eliminar alerta
- `GET /api/notifications/` — Listar notificaciones
- `POST /api/notifications/` — Crear notificación (admin)
- `GET /api/notifications/:id` — Detalle notificación
- `PATCH /api/notifications/:id/read` — Marcar como leída
- `DELETE /api/notifications/:id` — Eliminar notificación

**Implementar:**
1. Service: `src/js/services/notification.service.js`
2. Page: `src/pages/notifications.page.js` (notification center)
3. Component: Notification bell with badge (navbar)
4. Component: Alert preferences modal
5. Polling/WebSocket integration (para live updates)

---

### 📌 Admin Panel (`/api/admin`)
**Impacto:** Alto | **Prioridad:** Baja (MVP)  
**Servicios implementados:** ✅ Existe pero incompleto

**Funcionalidad:** Gestión de usuarios y roles del sistema.

**Endpoints faltantes:**
- `GET /api/admin/roles` — Listar roles
- `GET /api/admin/roles/:name/users` — Usuarios por rol
- `GET /api/admin/users` — Listar todos los usuarios
- `GET /api/admin/users/:id/roles` — Roles de usuario
- `POST /api/admin/users/:id/roles` — Asignar rol
- `DELETE /api/admin/users/:id/roles` — Remover rol

**Implementar:**
1. Page: `src/pages/admin-dashboard.page.js` (reemplazar placeholder)
2. Page: `src/pages/admin-users.page.js` (gestión de usuarios)
3. Components: User table, role selector, role assignment modal
4. Filter/sort utilities for user listing

---

---

## 2. MÓDULOS CON COBERTURA PARCIAL

### 🟡 Company (`/api/companies`) — 0% Implementado
**Impacto:** Alto | **Prioridad:** Alta  
**Páginas actuales:** ❌ Ninguna (solo placeholders)

**¿Qué falta:**

#### Públicas (Sin Auth):
- ❌ Directorio de empresas (`GET /api/companies/`)
- ❌ Perfil de empresa (`GET /api/companies/:id`)
- ❌ Ubicaciones de empresa
- ❌ Beneficios de empresa
- ❌ Miembros de empresa

#### Para Recruiters:
- ❌ Registro de empresa (`POST /api/companies/`)
- ❌ Editar perfil de empresa (`PATCH /api/companies/:id`)
- ❌ Gestionar ubicaciones (CRUD)
- ❌ Gestionar beneficios (CRUD)
- ❌ Gestionar miembros del equipo (CRUD)
- ❌ Subir documentos de verificación

#### Para Admins:
- ❌ Revisar verificaciones de empresa

**Implementar:**
1. Page: `src/pages/companies.page.js` (listing + filtrado)
2. Page: `src/pages/company-profile.page.js` (public + edit mode)
3. Page: `src/pages/company-dashboard.page.js` (recruiter - reemplazar placeholder)
4. Page: `src/pages/company-verification.page.js` (upload docs)
5. Service: Extender `company.service.js` con todos los endpoints
6. Components: Company card, benefits list, locations, verification status

**Notas Importantes:**
- En `my-profile` es donde el recruiter debería gestionar su empresa
- Debe sincronizar con vacantes creadas
- Verificación de empresa = activación de cuenta recruiter

---

### 🟡 Application (`/api/applications`) — 60% Implementado
**Impacto:** Alto | **Prioridad:** Alta  
**Páginas actuales:** `applications.page.js`, `saved-jobs.page.js`

**¿Qué falta:**

#### Candidate Features:
- ✅ Aplicar a vacante
- ✅ Listar mis aplicaciones
- ✅ Guardar vacantes
- ❌ **Detalle de aplicación** con timeline + comentarios
- ❌ Retirar aplicación (`PATCH /api/applications/:id`)
- ❌ Seguir empresas (`POST/GET/DELETE /api/applications/follows`)

#### Recruiter Features:
- ❌ Ver aplicantes por vacante
- ❌ Cambiar estado de aplicación (`POST /api/applications/:id/status`)
- ❌ Ver historial de cambios (`GET /api/applications/:id/history`)
- ❌ Agregar comentarios a candidatos (`POST /api/applications/:id/comments`)

#### Comentarios (Ambos roles):
- ❌ Ver comentarios (`GET /api/applications/:id/comments`)
- ❌ Editar comentarios (`PATCH /api/applications/comments/:id`)
- ❌ Eliminar comentarios (`DELETE /api/applications/comments/:id`)

**Implementar:**
1. Page: `src/pages/application-detail.page.js` (vista detallada con timeline)
2. Page: `src/pages/recruiter-applications.page.js` (por vacante)
3. Page: `src/pages/followed-companies.page.js`
4. Component: Application timeline/history
5. Component: Comments section (reusable)
6. Service: Extender `application.service.js`

---

### 🟡 Vacancy (`/api/vacancies`) — 70% Implementado
**Impacto:** Alto | **Prioridad:** Alta  
**Páginas actuales:** `vacancies.page.js`, `vacancy-detail.page.js`, `my-vacancies.page.js`, `create-vacancy.page.js`

**¿Qué falta:**

#### Candidate (Read-only):
- ✅ Listar vacantes
- ✅ Ver detalle
- ❌ Filtrar por categoría (endpoints existen pero no usados en UI)

#### Recruiter:
- ✅ Crear vacante
- ❌ **Editar vacante** (`PATCH /api/vacancies/:id`)
- ❌ **Eliminar vacante** (`DELETE /api/vacancies/:id`)
- ❌ **Cerrar vacante** (`PATCH /api/vacancies/:id/close`)
- ❌ **Archivar vacante** (`PATCH /api/vacancies/:id/archive`)
- ❌ Editar skills de vacante (`PATCH /api/vacancies/skills/:id`)
- ❌ Eliminar skills de vacante (`DELETE /api/vacancies/skills/:id`)
- ❌ Editar benefits de vacante (`PATCH /api/vacancies/benefits/:id`)
- ❌ Eliminar benefits de vacante (`DELETE /api/vacancies/benefits/:id`)

#### Admin:
- ❌ Gestionar categorías (`POST/PATCH/DELETE /api/vacancies/categories`)

**Implementar:**
1. Page: `src/pages/vacancy-edit.page.js` (editar vacante existente)
2. Modal/drawer: Edit vacancy metadata
3. Modal/drawer: Manage skills (add/edit/remove)
4. Modal/drawer: Manage benefits (add/edit/remove)
5. Action buttons: Close/Archive/Delete
6. Category management page (admin only)
7. Enhanced filtering in `vacancies.page.js`

---

### 🟡 Forum (`/api/forum`) — 10% Implementado
**Impacto:** Medio | **Prioridad:** Media  
**Páginas actuales:** `forum.page.js` (skeleton vacío)

**¿Qué falta:**

#### Categories (Públicas):
- ❌ Listar categorías (`GET /api/forum/categories`)
- ❌ Ver categoría (`GET /api/forum/categories/:id`)
- ❌ Admin: CRUD categorías

#### Threads:
- ❌ Listar threads (`GET /api/forum/threads`)
- ❌ Ver thread (`GET /api/forum/threads/:id`)
- ❌ Crear thread (`POST /api/forum/threads`)
- ❌ Editar thread (`PATCH /api/forum/threads/:id`)
- ❌ Eliminar thread (`DELETE /api/forum/threads/:id`)

#### Posts:
- ❌ Listar posts en thread (`GET /api/forum/threads/:id/posts`)
- ❌ Crear post (`POST /api/forum/threads/:id/posts`)
- ❌ Ver post (`GET /api/forum/posts/:id`)
- ❌ Editar post (`PATCH /api/forum/posts/:id`)
- ❌ Eliminar post (`DELETE /api/forum/posts/:id`)

#### Reports:
- ❌ Reportar thread (`POST /api/forum/threads/:id/reports`)
- ❌ Reportar post (`POST /api/forum/posts/:id/reports`)
- ❌ Admin: Listar reportes, moderar contenido

**Implementar:**
1. Page: `src/pages/forum-categories.page.js`
2. Page: `src/pages/forum-threads.page.js` (listado por categoría)
3. Page: `src/pages/forum-thread-detail.page.js` (thread con posts)
4. Page: `src/pages/forum-moderation.page.js` (admin)
5. Modal: Create/edit thread
6. Component: Post card with reply chain
7. Component: Report dialog
8. Service: Implement complete `forumService`

---

### 🟡 Resource (`/api/resources`) — 30% Implementado
**Impacto:** Medio | **Prioridad:** Media  
**Páginas actuales:** `resources.page.js` (listado básico)

**¿Qué falta:**

#### Public:
- ✅ Listar recursos
- ❌ Categorías de recursos (endpoint exists, no UI)
- ❌ Ver detalles de recurso con ratings
- ❌ Ver recursos relacionados

#### User Features:
- ❌ Calificar recurso (`POST /api/resources/:id/ratings`)

#### Admin:
- ❌ CRUD categorías de recursos
- ❌ CRUD recursos
- ❌ Gestionar recursos relacionados

**Implementar:**
1. Page: `src/pages/resource-categories.page.js`
2. Page: `src/pages/resource-detail.page.js` (con ratings y relacionados)
3. Admin page: Resource management
4. Component: Resource card with rating
5. Component: Star rating widget
6. Service: Extend `resourceService` 

---

### 🟡 Candidate Profile (`/api/candidate`) — 90% Implementado
**Impacto:** Medio | **Prioridad:** Media  
**Páginas actuales:** `my-profile.page.js`, `edit-my-profile.page.js`, `cv.page.js`

**¿Qué falta:**

- ✅ Profile CRUD
- ✅ Experience CRUD
- ✅ Education CRUD
- ✅ Skills CRUD
- ✅ Languages CRUD
- ✅ CV upload/delete
- ❌ **Interests** (`POST/GET/DELETE /api/candidate/profile/:id/interests`)

**Implementar:**
1. Section en `edit-my-profile.page.js`: Intereses laborales
2. Service: `candidateService.addInterest()`, `getInterests()`, `deleteInterest()`
3. UI: Tag selector para intereses

---

---

## 3. MÓDULOS COMPLETAMENTE IMPLEMENTADOS

### ✅ Auth (`/api/auth`) — 100% Implementado
**Servicios:** `auth.service.js` ✅  
**Páginas:** `login.page.js`, `register.page.js` ✅

Todos los endpoints cubiertos:
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/refresh`
- ✅ `POST /api/auth/logout`
- ✅ `GET /api/auth/me`

---

---

## 4. PRIORIZACIÓN POR FASE

### 🔥 FASE 1: MVP Essentials (High Impact)
**Objetivo:** Cobertura de flujos principales

1. **Company Module (All endpoints)**
   - Company profile pages (public + recruiter edit)
   - Company verification flow
   - **Impact:** Necesario para recruiters completen perfil

2. **Application Details (Missing pages)**
   - Application detail page con timeline + comentarios
   - Recruiter: ver aplicantes por vacante
   - **Impact:** Flujo end-to-end para candidatos

3. **Vacancy Management (Complete CRUD)**
   - Edit/delete vacancies
   - Close/archive actions
   - Manage skills + benefits
   - **Impact:** Recruiters pueden gestionar ofertas completamente

### 📌 FASE 2: Enhanced Features (Medium Impact)

4. **Review System (Complete)**
   - Company reviews by candidates
   - Admin moderation
   - **Impact:** Feedback transparente

5. **Forum (Complete)**
   - Categories, threads, posts
   - Moderation
   - **Impact:** Community engagement

6. **Notifications (Complete)**
   - Notification center
   - Job alerts
   - **Impact:** User engagement

### 📋 FASE 3: Polish & Admin (Low Priority)

7. **Admin Panel**
   - User management
   - Role assignment
   - **Impact:** System administration

8. **Resource Management**
   - Admin CRUD
   - Enhanced browsing
   - **Impact:** Learning resources

9. **Candidate Interests**
   - Simple feature
   - **Impact:** Better job matching

---

## 5. IMPACTO POR MÓDULO

| Módulo | Pages | Service Methods | Routes | Estimated Hours | Priority |
|--------|-------|-----------------|--------|-----------------|----------|
| Company | 3 | 15+ | 4+ | 16 | 🔴 High |
| Application Detail | 2 | 8+ | 2+ | 12 | 🔴 High |
| Vacancy Edit | 1 | 6+ | 3+ | 8 | 🔴 High |
| Review | 3 | 10+ | 3+ | 12 | 🟡 Medium |
| Forum | 4 | 20+ | 4+ | 20 | 🟡 Medium |
| Notification | 2 | 10+ | 3+ | 12 | 🟡 Medium |
| Resource Detail | 2 | 8+ | 2+ | 8 | 🟡 Medium |
| Admin | 2 | 6+ | 2+ | 8 | 🟢 Low |
| Candidate Interests | 1 | 3 | 1 | 2 | 🟢 Low |

---

## 6. RECOMENDACIONES

### Estrategia de Implementación

1. **Start with Company module** — Essential blocker para recruiters
2. **Then Application details** — Completa flujo candidate-recruiter
3. **Then Vacancy management** — Cierra recruiter workflows
4. **Parallel: Notifications** — Quick win, improve UX
5. **Then Review system** — Feedback loop
6. **Then Forum** — Community features
7. **Finally: Admin panel** — System administration

### Architectural Improvements Needed

- [ ] Add routing for all new pages in `main.js`
- [ ] Extend role guards for recruiter-specific features
- [ ] Consider WebSocket/polling for real-time notifications
- [ ] Modals/drawers library for actions (edit, delete, confirm)
- [ ] Better error handling & validation
- [ ] Loading states for async operations
- [ ] Toast/notification UI for user feedback
- [ ] Pagination utilities for large lists

### Code Quality

- Follow existing patterns:
  - Service layer for all API calls
  - Page controllers with async initialization
  - Event delegation in page scope
  - Store for global auth state
  - HTML rendered from template strings
- Add error boundaries for each page
- Consistent form handling patterns
