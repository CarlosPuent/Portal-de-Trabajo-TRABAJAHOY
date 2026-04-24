# Copilot Instructions for TrabajaHoy Frontend

## Build, Test, and Lint Commands

**Development server:**
```bash
npm run dev
```
Starts Vite dev server at `http://localhost:5173`

**Production build:**
```bash
npm run build
```
Outputs to `dist/`

**Preview production build:**
```bash
npm run preview
```
Serves the compiled build locally for testing before deployment

**Tests:**
Currently no automated test suite is configured. The placeholder script `npm run test` will exit with an error.

## High-Level Architecture

### Core Concepts

**Hash-Based SPA Routing:**
- The application is a single-page application (SPA) using hash-based routing (`#/path`)
- Router logic is in `src/js/core/router.js`
- No trailing slashes in route definitions (e.g., `#/candidate-dashboard` not `#/candidate-dashboard/`)
- Routes can have optional guard conditions: `requiresAuth`, `roles` (array), `redirectIfAuth`

**Authentication & Session Management:**
- JWT-based authentication with access token + optional refresh token
- Session stored in `localStorage` via `src/js/utils/storage.js`
- Auth state restored on app initialization via `restoreSession()` in `main.js`
- Multiple roles per user supported (candidate, recruiter, admin)
- Auth context available globally via `store` module

**Role-Based Access Control (RBAC):**
- Three main roles: `candidate`, `recruiter`, `admin`
- Routes can require specific roles via route guards
- Role resolution happens in `src/js/core/roles.js`
- Dashboard routing adapts based on user's primary role

**API Integration:**
- Centralized HTTP client: `src/js/services/api.js` (Axios-based)
- All API endpoints consumed through domain-specific services in `src/js/services/`
- API responses follow standard envelope: `{ status, data, message, pagination, timestamp }`
- Base URL configurable via `VITE_API_BASE_URL` env var, defaults to:
  - Dev: `http://localhost:3000/api`
  - Prod: `https://trabajahoy-backend-production.up.railway.app/api`

**Page Controller Pattern:**
- Each route has an async init function in `src/pages/*.page.js`
- Controllers render HTML to `#app` element
- Event listeners bound inside controller scope to avoid global pollution

### Directory Structure

```
src/
├─ js/
│  ├─ core/              # Framework modules
│  │  ├─ config.js       # Routes and env config
│  │  ├─ router.js       # Hash router with guards
│  │  ├─ store.js        # Global state (auth, UI)
│  │  └─ roles.js        # RBAC utilities
│  ├─ services/          # API clients and domain logic
│  │  ├─ api.js          # HTTP client (Axios)
│  │  ├─ auth.service.js # Login/logout/session
│  │  ├─ vacancy.service.js
│  │  ├─ candidate.service.js
│  │  ├─ application.service.js
│  │  └─ ...others
│  ├─ utils/             # UI helpers and storage
│  │  ├─ ui.js           # renderNavbar, renderPage, renderRoleShell
│  │  ├─ storage.js      # localStorage wrapper
│  │  └─ form.js, etc.
│  ├─ components/        # Reusable UI snippets (minimal use)
│  └─ main.js            # App entry, route registration, init
├─ pages/                # Page controllers (one per route)
├─ styles/               # Global CSS
└─ images/              # Static assets

public/                  # Static files, 404.html for SPA routing
dist/                    # Build output (generated)
```

## Key Conventions

### Page Controller Pattern

Every route handler is an async function that:
1. Receives `params` (URL segments) and `query` (query string)
2. Renders HTML to `document.getElementById("app")`
3. Binds event listeners within the rendered scope
4. Uses utility functions for consistent UI (navbar, page shells)

Example:
```javascript
export async function initMyPage(params, query) {
  const app = document.getElementById("app");
  
  // Fetch data
  const data = await myService.fetchData();
  
  // Render
  const navbar = renderNavbar({...});
  const shell = renderRoleShell({...});
  app.innerHTML = renderPage({ navbar, main: shell });
  
  // Bind events
  app.addEventListener("click", (e) => {
    if (e.target.matches(".btn-save")) {
      myService.save(data);
    }
  });
}
```

### Store Module (Global State)

Use `src/js/core/store.js` for auth and UI state:
```javascript
import { store } from "@core/store.js";

// Auth state
store.setAuth(tokens, user, roles);
store.get("isAuthenticated");
store.getRoles();
store.getPrimaryRole();

// Generic state
store.set("key", value);
store.get("key");
store.clearAuth();
```

### Service Layer

Each major domain has a service module (`src/js/services/*.service.js`):
- Wraps API calls from `api.js`
- Handles response parsing and error handling
- Returns domain objects or throws errors
- All services return promises

Example:
```javascript
export const vacancyService = {
  async getAll(query = {}) {
    const response = await api.get("/vacancies", { params: query });
    return response.data;
  },
  async getById(id) { ... },
  async create(dto) { ... }
};
```

### Authorization Guards in Routes

Routes with `requiresAuth` or `roles` are guarded automatically:
```javascript
router.on("/protected-route", pageHandler, {
  requiresAuth: true,
  roles: [ROLE.CANDIDATE],  // Array of allowed roles
  redirectIfAuth: true      // Redirect authenticated users away (e.g., login page)
});
```

### Environment Configuration

- `VITE_API_BASE_URL` — Override default API base URL
- Set in `.env.local` for development or injected in CI/CD
- Resolved in `src/js/core/config.js`

### Styling Approach

- Global styles in `src/styles/`
- BEM-style class naming convention
- Inline styles in page controllers acceptable for dynamic/temporary content
- Mobile-first responsive design

### API Response Handling

All API responses follow this envelope:
```javascript
{
  status: "success" | "error",
  data: { ... },
  message: "optional",
  pagination: { total, page, limit, totalPages },
  timestamp: "ISO-8601"
}
```

The `api.js` client extracts `data` automatically for successful responses. Services pass through the data to page controllers.

### Form Handling

- Use `storage.getFormData()` / `storage.setFormData()` for form persistence
- Submit handlers should validate before calling service methods
- Display success/error messages to users via UI notifications

### Deployment & Base Path

- Production base path: `/TRABAJAHOY-FRONTEND/` (GitHub Pages)
- Set in `vite.config.js` based on build mode
- SPA routing fallback: `public/404.html` copied to `dist/404.html` by deployment workflow
- GitHub Actions workflow: `.github/workflows/deploy.yml`

## Placeholder Pages

The following routes are registered but show placeholder UI:
- Company dashboard (`#/company-dashboard`)
- Company profile (`#/company-profile`)
- Admin dashboard (`#/admin-dashboard`)
- Admin users (`#/admin-users`)

These are intentionally incomplete per the project roadmap. When implementing:
1. Create the page controller in `src/pages/*.page.js`
2. Import and register in `main.js`
3. Add service layer methods as needed
4. Follow existing page patterns for consistency

## API Integration Notes

- Backend DTOs documented in `GUIA_ENDPOINTS_FRONTEND.md`
- All authenticated endpoints require `Authorization: Bearer <token>` header (added by `api.js` automatically)
- Pagination queries use `?page=<n>&limit=<n>` format
- Multipart requests (file uploads) handled in specialized services (e.g., CV upload)

## Common Pitfalls to Avoid

1. **Don't add event listeners to `document` globally.** Always use event delegation on rendered elements or unbind listeners to prevent duplicates.
2. **Don't call `store.set()` after logout.** Auth data is cleared by `store.clearAuth()`.
3. **Don't hardcode API URLs.** Always use `config.API_BASE_URL` or relative paths through `api.js`.
4. **Don't forget role checks.** If a feature is role-specific, guard the route and hide UI elements based on `store.getRoles()`.
5. **Hash routes don't need leading slashes in `#` assignment.** Use `#/path` not `##/path`.
