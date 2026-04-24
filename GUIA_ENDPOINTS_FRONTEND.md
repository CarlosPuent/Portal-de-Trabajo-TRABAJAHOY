# Guía de endpoints para frontend (TrabajaHoy Backend)

## Base URL, auth y formato de respuesta

- **Base URL local:** `http://localhost:3000`
- **Header auth:** `Authorization: Bearer <accessToken>`
- **Formato de respuesta estándar:**

```json
{
  "status": "success",
  "data": {},
  "message": "opcional",
  "timestamp": "ISO",
  "pagination": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 }
}
```

- **Paginación común:** `?page=<n>&limit=<n>` (limit máx. 100).

> Cuando una ruta usa `validateDto(...)`, el body debe cumplir el DTO indicado.

## Auth (`/api/auth`)

- `POST /api/auth/register` — Público — body: `registerDto`
- `POST /api/auth/login` — Público — body: `loginDto`
- `POST /api/auth/refresh` — Público — body: `refreshTokenDto`
- `POST /api/auth/logout` — Auth
- `GET /api/auth/me` — Auth

DTOs: `src/modules/auth/dtos/*.js`

## Candidate (`/api/candidate`) *(todas requieren Auth + rol `candidate`)*

### Perfil
- `POST /api/candidate/profile` — body: `createProfileDto`
- `GET /api/candidate/profile/:id`
- `PATCH /api/candidate/profile/:id` — body: `updateProfileDto`
- `DELETE /api/candidate/profile/:id`

### Experience
- `POST /api/candidate/profile/:candidateId/experiences` — body: `addExperienceDto`
- `GET /api/candidate/profile/experiences/:id`
- `PATCH /api/candidate/profile/experiences/:id` — body: `updateExperienceDto`
- `DELETE /api/candidate/profile/experiences/:id`
- `GET /api/candidate/profile/:id/experiences`

### Education
- `POST /api/candidate/profile/:candidateId/education` — body: `addEducationDto`
- `GET /api/candidate/profile/education/:id`
- `PATCH /api/candidate/profile/education/:id` — body: `updateEducationDto`
- `DELETE /api/candidate/profile/education/:id`
- `GET /api/candidate/profile/:id/education`

### Skills
- `POST /api/candidate/profile/:candidateId/skills` — body: `addSkillDto`
- `GET /api/candidate/profile/skills/:id`
- `PATCH /api/candidate/profile/skills/:id` — body: `updateSkillDto`
- `DELETE /api/candidate/profile/skills/:id`
- `GET /api/candidate/profile/:id/skills`

### Languages
- `POST /api/candidate/profile/:candidateId/languages` — body: `addLanguageDto`
- `GET /api/candidate/profile/languages/:id`
- `PATCH /api/candidate/profile/languages/:id` — body: `updateLanguageDto`
- `DELETE /api/candidate/profile/languages/:id`
- `GET /api/candidate/profile/:id/languages`

### CV
- `POST /api/candidate/profile/:candidateId/cv` — multipart/form-data, campo `file`
- `GET /api/candidate/profile/cv/:id`
- `DELETE /api/candidate/profile/cv/:id`
- `GET /api/candidate/profile/:id/cv`

### Interests
- `POST /api/candidate/profile/:candidateId/interests` — body libre esperado por servicio (incluye `interest`)
- `GET /api/candidate/profile/interests/:id`
- `DELETE /api/candidate/profile/interests/:id`
- `GET /api/candidate/profile/:id/interests`

DTOs: `src/modules/candidate/dtos/*.js`

## Company (`/api/companies`)

### Públicos
- `GET /api/companies/`
- `GET /api/companies/:id`
- `GET /api/companies/:id/locations`
- `GET /api/companies/:id/benefits`
- `GET /api/companies/:id/members`

### Auth
- `POST /api/companies/` — body: `createCompanyDto`
- `PATCH /api/companies/:id` — body: `updateCompanyDto`
- `DELETE /api/companies/:id`

- `POST /api/companies/:id/locations` — body: `addLocationDto`
- `PATCH /api/companies/:id/locations/:locId` — body: `addLocationDto`
- `DELETE /api/companies/:id/locations/:locId`

- `POST /api/companies/:id/benefits` — body: `addBenefitDto`
- `PATCH /api/companies/:id/benefits/:benId` — body: `addBenefitDto`
- `DELETE /api/companies/:id/benefits/:benId`

- `POST /api/companies/:id/members` — body: `addMemberDto`
- `PATCH /api/companies/:id/members/:memId` — body: `addMemberDto`
- `DELETE /api/companies/:id/members/:memId`

- `POST /api/companies/:id/verification` — multipart/form-data, campo `documents` (hasta 10)
- `GET /api/companies/:id/verification`
- `GET /api/companies/:id/verification/documents`

### Auth + rol admin
- `POST /api/companies/:id/verification/submissions/:submissionId/review`

DTOs: `src/modules/company/dtos/*.js`

## Application (`/api/applications`) *(todas requieren Auth)*

### Applications
- `POST /api/applications/` — rol `candidate` — body: `applyJobDto`
- `GET /api/applications/` — roles `candidate|recruiter|admin`
- `GET /api/applications/:id` — roles `candidate|recruiter|admin`
- `PATCH /api/applications/:id` — rol `candidate` — body: `updateApplicationDto`

### Saved jobs
- `POST /api/applications/saved-jobs` — rol `candidate` — body: `saveJobDto`
- `GET /api/applications/saved-jobs` — rol `candidate`
- `DELETE /api/applications/saved-jobs/:id` — rol `candidate`

### Company follows
- `POST /api/applications/follows` — rol `candidate` — body: `followCompanyDto`
- `GET /api/applications/follows` — rol `candidate`
- `DELETE /api/applications/follows/:id` — rol `candidate`

### Status/history/comments
- `POST /api/applications/:id/status` — roles `recruiter|admin` — body: `changeStatusDto`
- `GET /api/applications/:id/history` — roles `candidate|recruiter|admin`
- `POST /api/applications/:id/comments` — roles `candidate|recruiter|admin` — body: `addCommentDto`
- `GET /api/applications/:id/comments` — roles `candidate|recruiter|admin`
- `GET /api/applications/comments/:id` — roles `candidate|recruiter|admin`
- `PATCH /api/applications/comments/:id` — roles `candidate|recruiter|admin` — body: `updateCommentDto`
- `DELETE /api/applications/comments/:id` — roles `candidate|recruiter|admin`

DTOs: `src/modules/application/dtos/*.js`

## Forum (`/api/forum`)

### Categories
- `GET /api/forum/categories`
- `GET /api/forum/categories/:id`
- `POST /api/forum/categories` — roles `admin|moderator` — body: `createCategoryDto`
- `PATCH /api/forum/categories/:id` — roles `admin|moderator` — body: `updateCategoryDto`
- `DELETE /api/forum/categories/:id` — roles `admin|moderator`

### Threads
- `GET /api/forum/threads`
- `GET /api/forum/threads/:id`
- `POST /api/forum/threads` — Auth — body: `createThreadDto`
- `PATCH /api/forum/threads/:id` — Auth — body: `updateThreadDto`
- `DELETE /api/forum/threads/:id` — Auth

### Posts y reports
- `GET /api/forum/threads/:id/posts`
- `POST /api/forum/threads/:id/posts` — Auth — body: `createPostDto`
- `POST /api/forum/threads/:id/reports` — Auth — body: `createForumReportDto`
- `GET /api/forum/posts/:id`
- `PATCH /api/forum/posts/:id` — Auth — body: `updatePostDto`
- `DELETE /api/forum/posts/:id` — Auth
- `POST /api/forum/posts/:id/reports` — Auth — body: `createForumReportDto`

### Moderación reportes
- `GET /api/forum/reports` — roles `admin|moderator`
- `GET /api/forum/reports/:id` — roles `admin|moderator`
- `PATCH /api/forum/reports/:id` — roles `admin|moderator` — body: `updateForumReportDto`

DTOs: `src/modules/forum/dtos/*.js`

## Resource (`/api/resources`)

### Públicos (auth opcional para enriquecer contexto usuario)
- `GET /api/resources/categories`
- `GET /api/resources/categories/:id`
- `GET /api/resources/`
- `GET /api/resources/:id`
- `GET /api/resources/:id/ratings`
- `GET /api/resources/:id/related`

### Auth + roles admin/moderator
- `POST /api/resources/categories` — body: `createResourceCategoryDto`
- `PATCH /api/resources/categories/:id` — body: `updateResourceCategoryDto`
- `DELETE /api/resources/categories/:id`
- `POST /api/resources/` — body: `createResourceDto`
- `PATCH /api/resources/:id` — body: `updateResourceDto`
- `DELETE /api/resources/:id`
- `POST /api/resources/:id/related` — body: `createRelatedResourceDto`
- `DELETE /api/resources/related/:id`

### Auth
- `POST /api/resources/:id/ratings` — body: `rateResourceDto`

DTOs: `src/modules/resource/dtos/*.js`

## Review (`/api/reviews`)

### Públicos
- `GET /api/reviews/company/:companyId`
- `GET /api/reviews/company/:companyId/summary`
- `GET /api/reviews/:id`

### Auth
- `GET /api/reviews/me/list`
- `POST /api/reviews/` — body: `createReviewDto`
- `PATCH /api/reviews/:id` — body: `updateReviewDto`
- `DELETE /api/reviews/:id`
- `POST /api/reviews/:id/helpfulness` — body: `rateHelpfulDto`
- `DELETE /api/reviews/:id/helpfulness`
- `POST /api/reviews/:id/reports` — body: `reportReviewDto`

### Auth + roles admin/moderator
- `GET /api/reviews/admin/reported/list`
- `GET /api/reviews/admin/:id/reports`
- `PATCH /api/reviews/admin/:id/status` — body: `moderateReviewDto`

DTOs: `src/modules/review/dtos/*.js`

## Notification (`/api/notifications`) *(todas requieren Auth)*

- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/read-all`

### Alerts
- `POST /api/notifications/alerts` — body: `createAlertDto`
- `GET /api/notifications/alerts`
- `GET /api/notifications/alerts/:id`
- `PATCH /api/notifications/alerts/:id` — body: `updateAlertDto`
- `DELETE /api/notifications/alerts/:id`

### Notifications
- `GET /api/notifications/`
- `POST /api/notifications/` — body: `createNotificationDto`
- `GET /api/notifications/:id`
- `PATCH /api/notifications/:id/read` — body: `markReadDto`
- `DELETE /api/notifications/:id`

DTOs: `src/modules/notification/dtos/*.js`

## Admin (`/api/admin`) *(todas requieren Auth + rol `admin`)*

- `GET /api/admin/roles`
- `GET /api/admin/roles/:name/users`
- `GET /api/admin/users`
- `GET /api/admin/users/:id/roles`
- `POST /api/admin/users/:id/roles` — body: `assignRoleDto`
- `DELETE /api/admin/users/:id/roles` — body: `removeRoleDto`

DTOs: `src/modules/admin/dtos/*.js`

## Vacancy (`/api/vacancies`)

### Públicos
- `GET /api/vacancies/`
- `GET /api/vacancies/categories`
- `GET /api/vacancies/categories/:id`
- `GET /api/vacancies/skills/:id`
- `GET /api/vacancies/benefits/:id`
- `GET /api/vacancies/:id/skills`
- `GET /api/vacancies/:id/benefits`
- `GET /api/vacancies/:id`

### Auth + rol admin
- `POST /api/vacancies/categories` — body: `createJobCategoryDto`
- `PATCH /api/vacancies/categories/:id` — body: `updateJobCategoryDto`
- `DELETE /api/vacancies/categories/:id`

### Auth + roles recruiter/admin
- `GET /api/vacancies/manage/all`
- `GET /api/vacancies/manage/:id`
- `POST /api/vacancies/` — body: `createVacancyDto`
- `PATCH /api/vacancies/:id` — body: `updateVacancyDto`
- `DELETE /api/vacancies/:id`
- `PATCH /api/vacancies/:id/close`
- `PATCH /api/vacancies/:id/archive`

- `POST /api/vacancies/:id/skills` — body: `createVacancySkillDto`
- `PATCH /api/vacancies/skills/:id` — body: `updateVacancySkillDto`
- `DELETE /api/vacancies/skills/:id`

- `POST /api/vacancies/:id/benefits` — body: `createVacancyBenefitDto`
- `PATCH /api/vacancies/benefits/:id` — body: `updateVacancyBenefitDto`
- `DELETE /api/vacancies/benefits/:id`

DTOs: `src/modules/vacancy/dtos/*.js`

---

## Recomendaciones para el agente frontend

1. Centralizar un cliente HTTP con:
   - `baseURL`
   - inyección de `Authorization` cuando exista token
   - manejo uniforme del envelope `{ status, data, message, pagination, timestamp }`
2. Definir tipos de request/response tomando como fuente los DTOs de backend por módulo.
3. Tratar rutas con roles como guardas de UI (ocultar acciones si el usuario no tiene rol).
