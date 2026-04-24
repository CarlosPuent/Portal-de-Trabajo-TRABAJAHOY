# ⚡ Quick Reference Card

Keep this open while developing. Copy-paste as needed.

---

## File Structure

```
src/
├─ js/
│  ├─ core/
│  │  ├─ config.js       ← Routes, API base URL
│  │  ├─ router.js       ← Hash router with guards
│  │  ├─ store.js        ← Global auth state
│  │  └─ roles.js        ← RBAC utilities
│  ├─ services/
│  │  ├─ api.js          ← HTTP client
│  │  ├─ auth.service.js
│  │  ├─ candidate.service.js
│  │  ├─ vacancy.service.js
│  │  ├─ application.service.js
│  │  ├─ company.service.js      ← TODO: Complete this
│  │  ├─ forum.service.js
│  │  ├─ resource.service.js
│  │  ├─ admin.service.js
│  │  ├─ review.service.js       ← TODO: Create this
│  │  └─ notification.service.js ← TODO: Create this
│  ├─ utils/
│  │  ├─ ui.js           ← renderPage, renderNavbar, renderRoleShell
│  │  ├─ storage.js      ← localStorage wrapper
│  │  └─ form.js         ← Form helpers
│  ├─ components/
│  │  └─ toast.js        ← Toast notifications
│  └─ main.js            ← Route registration, init
├─ pages/
│  ├─ landing.page.js    ✅
│  ├─ login.page.js      ✅
│  ├─ register.page.js   ✅
│  ├─ vacancies.page.js  ✅
│  ├─ vacancy-detail.page.js ✅
│  ├─ candidate-dashboard.page.js ✅
│  ├─ my-profile.page.js ✅
│  ├─ edit-my-profile.page.js ✅
│  ├─ saved-jobs.page.js ✅
│  ├─ applications.page.js ✅
│  ├─ my-vacancies.page.js ✅
│  ├─ create-vacancy.page.js ✅
│  ├─ resources.page.js  ✅
│  ├─ forum.page.js      🟡 (skeleton)
│  ├─ cv.page.js         ✅
│  ├─ companies.page.js          ← TODO
│  ├─ company-profile.page.js    ← TODO
│  ├─ company-dashboard.page.js  ← TODO (replace placeholder)
│  ├─ company-verification.page.js ← TODO
│  ├─ application-detail.page.js ← TODO
│  ├─ recruiter-applications.page.js ← TODO
│  └─ ... more TODOs in MISSING_MODULES.md
├─ styles/
│  └─ global CSS
└─ images/
   └─ static assets
```

---

## Code Snippets

### Create a New Service

```javascript
// src/js/services/company.service.js
import { api } from '@services/api';

export const companyService = {
  async getAll(query = {}) {
    const response = await api.get('/companies', { params: query });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  async create(dto) {
    const response = await api.post('/companies', dto);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.patch(`/companies/${id}`, dto);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  }
};
```

### Create a New Page

```javascript
// src/pages/company-profile.page.js
import { store } from "@core/store.js";
import { renderNavbar, renderPage, renderRoleShell } from "@utils/ui.js";
import { companyService } from "@services/company.service.js";

export async function initCompanyProfilePage(params, query) {
  const app = document.getElementById("app");
  
  try {
    // 1. Load data
    const company = await companyService.getById(params.id);
    const isAuthenticated = store.get("isAuthenticated");
    const userRoles = store.getRoles();
    
    // 2. Render
    const navbar = renderNavbar({
      activeRoute: "/companies",
      isAuthenticated,
      user: store.get("user"),
      roles: userRoles
    });

    const shell = renderRoleShell({
      title: company.name,
      subtitle: company.industry,
      roles: userRoles,
      content: `
        <div class="company-profile">
          <p>${company.description}</p>
          <p>📍 ${company.location}</p>
          <p>👥 ${company.employeeCount} employees</p>
        </div>
      `
    });

    app.innerHTML = renderPage({
      navbar,
      main: shell
    });

    // 3. Bind events
    app.addEventListener("click", (e) => {
      if (e.target.matches(".btn-follow")) {
        handleFollow(company.id);
      }
    });
  } catch (error) {
    console.error("Failed to load company:", error);
    app.innerHTML = `<p>Error loading company</p>`;
  }
}

async function handleFollow(companyId) {
  try {
    await applicationService.followCompany({ companyId });
    alert("✅ Company followed!");
  } catch (error) {
    alert("❌ Failed to follow company");
  }
}
```

### Register a New Route

```javascript
// In src/js/main.js - inside registerRoutes() function

router.on(config.ROUTES.COMPANY_PROFILE, async (params, query) => {
  await initCompanyProfilePage(params, query);
});

// Or with role guard:
router.on(config.ROUTES.COMPANY_DASHBOARD, initCompanyDashboardPage, {
  requiresAuth: true,
  roles: [ROLE.RECRUITER, ROLE.ADMIN]
});
```

### Add Route Config

```javascript
// In src/js/core/config.js
export const ROUTES = {
  // ... existing routes
  COMPANY_PROFILE: "/companies/:id",
  COMPANIES: "/companies",
  COMPANY_DASHBOARD: "/company-dashboard",
  COMPANY_VERIFICATION: "/company-verification"
};
```

### Use Store for State

```javascript
import { store } from "@core/store.js";

// Get auth state
const isAuth = store.get("isAuthenticated");
const user = store.get("user");
const roles = store.getRoles();
const primaryRole = store.getPrimaryRole();

// Set state
store.set("myKey", myValue);

// Check role
if (roles.includes(ROLE.RECRUITER)) {
  // Show recruiter features
}

// After login
store.setAuth(tokens, user, roles);

// After logout
store.clearAuth();
```

### Call API

```javascript
import { api } from "@services/api.js";

// GET
const response = await api.get("/endpoint");
const { data } = response;

// POST
const response = await api.post("/endpoint", { field: "value" });

// PATCH
const response = await api.patch("/endpoint/123", { field: "updated" });

// DELETE
const response = await api.delete("/endpoint/123");

// With query params
const response = await api.get("/items", { 
  params: { page: 1, limit: 10, sort: "name" } 
});
```

---

## Common Patterns

### Handle Auth Guard

```javascript
// Route with guard
router.on(config.ROUTES.MY_PROFILE, initMyProfilePage, {
  requiresAuth: true,
  roles: [ROLE.CANDIDATE]
});

// Inside page, check role
if (!store.get("isAuthenticated")) {
  // Redirect to login
  window.location.hash = "#/login";
  return;
}

const userRoles = store.getRoles();
if (!userRoles.includes(ROLE.RECRUITER)) {
  // Show error or redirect
  app.innerHTML = "<p>Only recruiters can access this.</p>";
  return;
}
```

### Render Conditional UI

```javascript
const isRecruiter = store.getRoles().includes(ROLE.RECRUITER);

const shell = renderRoleShell({
  content: `
    <button>Always visible</button>
    ${isRecruiter ? `
      <button class="btn-edit">Edit Vacancy (Recruiter only)</button>
    ` : ''}
  `
});
```

### Handle Errors

```javascript
try {
  const data = await vacancyService.getById(id);
  // Success - render data
} catch (error) {
  console.error("Load error:", error);
  
  if (error.response?.status === 404) {
    app.innerHTML = "<p>Vacancy not found</p>";
  } else if (error.response?.status === 401) {
    window.location.hash = "#/login";
  } else {
    app.innerHTML = "<p>Error loading vacancy. Please try again.</p>";
  }
}
```

### Event Delegation

```javascript
// ✅ CORRECT: Delegate on rendered element
app.addEventListener("click", (e) => {
  if (e.target.matches(".btn-delete")) {
    handleDelete(e.target.dataset.id);
  }
  if (e.target.matches(".btn-edit")) {
    handleEdit(e.target.dataset.id);
  }
});

// ❌ WRONG: Direct listener on dynamically created elements
document.querySelector(".btn-delete").addEventListener("click", ...) 
// This breaks if .btn-delete is created AFTER the listener is set
```

---

## Environment Variables

```bash
# In .env.local or injected in CI/CD
VITE_API_BASE_URL=http://localhost:3000/api

# Dev default (in config.js)
# http://localhost:3000/api

# Prod default (in config.js)
# https://trabajahoy-backend-production.up.railway.app/api
```

---

## Build & Run Commands

```bash
# Development
npm run dev          # Starts at http://localhost:5173

# Production build
npm run build        # Output: dist/

# Preview prod build locally
npm run preview      # Serves dist/ locally

# Watch mode
npm run dev          # (Vite watches for changes)
```

---

## Roles & Permissions

```javascript
import { ROLE } from "@core/roles.js";

ROLE.CANDIDATE      // "candidate"
ROLE.RECRUITER      // "recruiter"
ROLE.ADMIN          // "admin"

// Check role
const userRoles = store.getRoles();
if (userRoles.includes(ROLE.RECRUITER)) {
  // User is recruiter
}

// Get primary role (first role)
const primary = store.getPrimaryRole();
```

---

## API Response Format

All responses follow this envelope:

```javascript
{
  "status": "success",           // or "error"
  "data": { /* actual data */ },
  "message": "optional message",
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "timestamp": "2026-04-20T19:00:00.000Z"
}
```

**Note:** The `api.js` client automatically extracts `.data` for you.

---

## Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success ✅ |
| 201 | Created | Resource created ✅ |
| 400 | Bad Request | Validation error, check form |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate or constraint violation |
| 500 | Server Error | Backend issue, retry or contact support |

---

## Routing Examples

### Hash routes (NO slashes after #)

```javascript
// ✅ CORRECT
window.location.hash = "#/candidate-dashboard";
window.location.hash = "#/vacancies";
window.location.hash = "#/companies/123";

// ❌ WRONG
window.location.hash = "#/candidate-dashboard/";  // Don't add trailing slash
window.location.hash = "##/something";             // Don't double #
```

### Route with params

```javascript
// Define route with :id parameter
router.on(config.ROUTES.COMPANY_PROFILE, async (params, query) => {
  const companyId = params.id;
  // Load company by ID
});

// Navigate to route with param
window.location.hash = "#/companies/123";

// With query string
window.location.hash = "#/vacancies?page=2&sort=newest";

// Access in page
export function initVacanciesPage(params, query) {
  const page = query.page || 1;
  const sort = query.sort || "newest";
}
```

---

## Testing Checklist

Before declaring a feature complete:

- [ ] Test with authenticated user
- [ ] Test with non-authenticated user
- [ ] Test with each required role
- [ ] Test invalid inputs
- [ ] Test API error scenarios
- [ ] Test network timeout
- [ ] Check browser console for errors
- [ ] Test on mobile view (if applicable)
- [ ] Verify all buttons/links work
- [ ] Check accessibility (keyboard navigation)

---

## Debugging Tips

### Check Network Requests
```
1. Open DevTools (F12)
2. Go to Network tab
3. Look for failed requests (red)
4. Click request → see full URL, headers, response
5. Check if Authorization header is present
```

### Check Store State
```javascript
// In browser console
import { store } from '@core/store.js'
console.log(store.get('isAuthenticated'))
console.log(store.getRoles())
console.log(store.get('user'))
```

### Check API Response Format
```javascript
// In network tab, click on request, see Response tab
// Should have: status, data, message, pagination, timestamp
```

### Enable Detailed Logging
```javascript
// In api.js or service, log requests/responses
console.log("Request:", method, url, data);
console.log("Response:", response.data);
console.log("Error:", error.response?.data);
```

---

## Performance Tips

- Don't fetch on every state change
- Use pagination for large lists
- Cache data when appropriate
- Defer non-critical loads
- Use CSS instead of JS for animations
- Minimize DOM manipulation in loops
- Use event delegation instead of multiple listeners

---

## Security Reminders

- ✅ Always use `api.js` (adds auth header automatically)
- ✅ Don't store sensitive data in localStorage except tokens
- ✅ Never hardcode API URLs
- ✅ Validate user input before sending to API
- ✅ Check roles before showing sensitive UI
- ❌ Don't log passwords or tokens
- ❌ Don't trust client-side role checks alone

---

## Module Implementation Order (Priority)

Based on ANALYSIS_SUMMARY.md:

1. **Company** (16h) — Blocker for recruiters
2. **Application Details** (12h) — Communication pipeline
3. **Vacancy Management** (8h) — Job lifecycle
4. **Notifications** (12h) — User engagement
5. **Reviews** (12h) — Feedback system
6. **Forum** (20h) — Community
7. **Resources** (8h) — Learning content
8. **Admin Panel** (8h) — System management
9. **Interests** (2h) — Job matching

---

## Common Gotchas

### Async/Await
```javascript
// ✅ CORRECT
export async function initPage(params, query) {
  const data = await service.fetch();
  // Use data here
}

// ❌ WRONG
export function initPage(params, query) {
  const data = service.fetch(); // Returns Promise, not data!
}
```

### Event Listeners
```javascript
// ✅ CORRECT: Bind to rendered element
const app = document.getElementById("app");
app.innerHTML = renderUI();
app.addEventListener("click", handler); // Added AFTER render

// ❌ WRONG: Bind before rendering
app.addEventListener("click", handler);
app.innerHTML = renderUI(); // Listeners lost!
```

### Role Checks
```javascript
// ✅ CORRECT
const roles = store.getRoles(); // Array
if (roles.includes(ROLE.RECRUITER)) { }

// ❌ WRONG
const role = store.getPrimaryRole(); // String
if (role === [ROLE.RECRUITER]) { } // Wrong comparison
```

### Hash Navigation
```javascript
// ✅ CORRECT
window.location.hash = "#/vacancies?page=2";

// ❌ WRONG
window.location.href = "vacancies"; // Use hash for SPA
document.location = "#vacancies";  // Unnecessary
```

---

**Last Updated:** 2026-04-20  
**Use this as a reference while coding!**
