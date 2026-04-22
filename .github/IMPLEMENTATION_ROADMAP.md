# 🗺️ Frontend Implementation Roadmap

## Quick Reference: Coverage by Module

```
┌─────────────────────┬───────────┬──────────┬──────────┐
│ Módulo              │ Coverage  │ Pages    │ Service  │
├─────────────────────┼───────────┼──────────┼──────────┤
│ Auth                │ ✅ 100%   │ 2/2      │ ✅       │
│ Candidate Profile   │ 🟡 90%    │ 3/3      │ ✅       │
│ Vacancy             │ 🟡 70%    │ 4/5      │ ✅       │
│ Application         │ 🟡 60%    │ 2/4      │ ✅       │
│ Forum               │ 🟠 10%    │ 1/5      │ ✅       │
│ Resource            │ 🟠 30%    │ 1/3      │ ✅       │
│ Company             │ 🔴 0%     │ 0/3      │ ✅       │
│ Review              │ 🔴 0%     │ 0/3      │ ❌       │
│ Notification        │ 🔴 0%     │ 0/2      │ ❌       │
│ Admin               │ 🔴 0%     │ 0/2      │ ✅       │
└─────────────────────┴───────────┴──────────┴──────────┘
```

---

## Implementation Priority Matrix

### 🚨 PHASE 1: Critical (Must-Have for MVP)

These are blockers for core user workflows.

#### 1️⃣ Company Module (0% → 100%)
```
Impact:    🔴🔴🔴 CRITICAL
Effort:    ⏱️⏱️⏱️⏱️ (16h estimated)
Blocker:   Recruiters cannot complete setup without company profile
```

**What to build:**
- [ ] `src/pages/companies.page.js` — Public company directory
- [ ] `src/pages/company-profile.page.js` — Company detail + edit
- [ ] `src/pages/company-dashboard.page.js` — Recruiter dashboard (replace placeholder)
- [ ] `src/pages/company-verification.page.js` — Document upload for verification
- [ ] Extend `company.service.js` with 15+ methods
- [ ] Components: company-card, benefits-list, locations-list

**Why first:**
- Recruiters need to register/edit company before creating vacancies
- Candidates need to see company profiles
- Verification unlocks full recruiter access

**API endpoints enabled:** 21 endpoints

---

#### 2️⃣ Application Details (60% → 100%)
```
Impact:    🔴🔴 HIGH
Effort:    ⏱️⏱️⏱️ (12h estimated)
Blocker:   Candidate-recruiter communication flow incomplete
```

**What to build:**
- [ ] `src/pages/application-detail.page.js` — Full application timeline
- [ ] `src/pages/recruiter-applications.page.js` — Recruiter view by vacancy
- [ ] `src/pages/followed-companies.page.js` — Saved companies list
- [ ] Components: application-timeline, comments-section, status-badge
- [ ] Extend `application.service.js` with status/comments/history methods

**Why second:**
- Completes the hiring pipeline (apply → track → communicate)
- Enables recruiters to manage applications
- Candidates see application progress

**API endpoints enabled:** 10 additional endpoints

---

#### 3️⃣ Vacancy Management (70% → 100%)
```
Impact:    🔴🔴 HIGH
Effort:    ⏱️⏱️ (8h estimated)
Blocker:   Recruiters can't edit/delete own vacancies
```

**What to build:**
- [ ] `src/pages/vacancy-edit.page.js` — Edit existing vacancy
- [ ] Modals: edit-metadata, manage-skills, manage-benefits
- [ ] Action buttons: close/archive/delete
- [ ] Extend `vacancy.service.js` with PATCH/DELETE methods

**Why third:**
- Quick win after company setup
- Completes recruiter self-service
- Candidates benefit from fresher job listings

**API endpoints enabled:** 8 additional endpoints

---

### 📊 PHASE 2: Important (Enhance User Experience)

These improve the product but aren't strict blockers.

#### 4️⃣ Notification System (0% → 100%)
```
Impact:    🟠🟠 MEDIUM
Effort:    ⏱️⏱️⏱️ (12h estimated)
Value:     Keeps users engaged, reduces support requests
```

**What to build:**
- [ ] `src/pages/notifications.page.js` — Notification center
- [ ] Navbar: notification bell with unread badge
- [ ] `src/js/services/notification.service.js` — Service layer
- [ ] Components: notification-item, alert-preferences-modal
- [ ] Polling/WebSocket for real-time updates

**Why important:**
- Job alert system (searches that match = instant notification)
- Application status updates
- Admin messages
- Forum replies

**API endpoints enabled:** 12 endpoints

---

#### 5️⃣ Review System (0% → 100%)
```
Impact:    🟠🟠 MEDIUM
Effort:    ⏱️⏱️⏱️ (12h estimated)
Value:     Social proof, candidate decision-making
```

**What to build:**
- [ ] `src/pages/company-reviews.page.js` — View company reviews
- [ ] `src/pages/my-reviews.page.js` — Manage my reviews (candidate)
- [ ] `src/pages/review-moderation.page.js` — Admin moderation
- [ ] `src/js/services/review.service.js` — Service layer
- [ ] Components: review-card, star-rating, report-dialog

**Why important:**
- Transparency builds trust
- Candidates make better decisions
- Companies motivated to improve

**API endpoints enabled:** 13 endpoints

---

#### 6️⃣ Forum (10% → 100%)
```
Impact:    🟠 MEDIUM
Effort:    ⏱️⏱️⏱️⏱️ (20h estimated)
Value:     Community, peer support, networking
```

**What to build:**
- [ ] `src/pages/forum-categories.page.js` — Category browser
- [ ] `src/pages/forum-threads.page.js` — Threads by category
- [ ] `src/pages/forum-thread-detail.page.js` — Thread with posts
- [ ] `src/pages/forum-moderation.page.js` — Admin mod tools
- [ ] Extend/create complete `forum.service.js`
- [ ] Components: thread-card, post-item, report-dialog

**Why important:**
- Builds community around the platform
- Reduces support load (peer help)
- Increases time-on-site

**API endpoints enabled:** 20+ endpoints

---

### ✨ PHASE 3: Nice-to-Have (Completeness)

#### 7️⃣ Resource Management (30% → 100%)
```
Impact:    🟡 LOW-MEDIUM
Effort:    ⏱️⏱️ (8h estimated)
Value:     Learning resources, candidate upskilling
```

**What to build:**
- [ ] `src/pages/resource-detail.page.js` — Resource with ratings
- [ ] `src/pages/resource-categories.page.js` — Browse by category
- [ ] Admin resource management page
- [ ] Components: resource-card, star-rating, related-resources

**API endpoints enabled:** 8 endpoints

---

#### 8️⃣ Admin Panel (0% → 100%)
```
Impact:    🟡 LOW
Effort:    ⏱️⏱️ (8h estimated)
Value:     System administration, compliance
```

**What to build:**
- [ ] Replace placeholder `admin-dashboard.page.js` (real implementation)
- [ ] `src/pages/admin-users.page.js` — User management
- [ ] Components: user-table, role-selector
- [ ] Extend `admin.service.js` with missing methods

**API endpoints enabled:** 6 endpoints

---

#### 9️⃣ Candidate Interests (90% → 100%)
```
Impact:    🟡 MINIMAL
Effort:    ⏱️ (2h estimated)
Value:     Better job matching recommendations
```

**What to build:**
- [ ] Add section to `edit-my-profile.page.js`
- [ ] UI: tag selector for job interests
- [ ] Service: `addInterest()`, `getInterests()`, `deleteInterest()`

**API endpoints enabled:** 3 endpoints

---

## Summary Table

| Phase | Modules | Pages | Services | Est. Hours | Priority |
|-------|---------|-------|----------|-----------|----------|
| 1️⃣ | Company, Application, Vacancy | 6 | 3 | 36 | 🔴 Critical |
| 2️⃣ | Notification, Review, Forum | 6 | 3 | 44 | 🟠 Important |
| 3️⃣ | Resource, Admin, Interests | 5 | 2 | 18 | ✨ Polish |
| **TOTAL** | **10 modules** | **17 pages** | **8 services** | **~98h** | — |

---

## Quick Start Checklist

### For Company Module
```bash
# 1. Create service file
touch src/js/services/company.service.js

# 2. Create page files
touch src/pages/companies.page.js
touch src/pages/company-profile.page.js
touch src/pages/company-dashboard.page.js
touch src/pages/company-verification.page.js

# 3. Register routes in src/js/main.js
# Add router.on() calls with proper role guards

# 4. Create components
mkdir -p src/js/components/company
touch src/js/components/company/company-card.js
touch src/js/components/company/benefits-list.js

# 5. Test each endpoint against API
npm run dev  # Start dev server
# Visit http://localhost:5173/#/companies
```

---

## Code Patterns to Follow

### Service Pattern
```javascript
// src/js/services/company.service.js
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

### Page Pattern
```javascript
// src/pages/company-profile.page.js
export async function initCompanyProfilePage(params, query) {
  const app = document.getElementById("app");
  
  // 1. Load data
  const company = await companyService.getById(params.id);
  
  // 2. Render
  const navbar = renderNavbar({...});
  const shell = renderRoleShell({
    title: company.name,
    content: `...html...`
  });
  app.innerHTML = renderPage({ navbar, main: shell });
  
  // 3. Bind events
  app.addEventListener("click", (e) => {
    if (e.target.matches(".btn-follow")) {
      // Handle follow
    }
  });
}
```

---

## Dependency Graph

```
Auth ✅
  └─→ Company (needed for recruiter)
       └─→ Vacancy (depends on Company)
            └─→ Application (depends on Vacancy)
                 └─→ Application Details (depends on Application)
                      └─→ Notification (notifies of changes)
                           └─→ Review (company reviews)

Forum (independent of hiring flow)
Resource (independent)
Admin (depends on Auth only)
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Company endpoints delay recruiter signup | HIGH | Implement this first |
| Missing comments blocks communication | HIGH | Priority in phase 1 |
| Notification system needed early | MEDIUM | Phase 2, but monitor |
| Real-time updates (WebSocket) | MEDIUM | Start with polling, upgrade later |
| Moderation tools needed before forum launch | MEDIUM | Admin features in phase 2 |

---

## Testing Strategy

After implementing each page:

1. **Manual testing**: Navigate through UI, verify data loads
2. **API validation**: Check network tab, verify request format
3. **Role-based access**: Test with different user roles
4. **Error states**: Break things intentionally (invalid ID, etc.)
5. **Loading states**: Verify spinners/placeholders appear
6. **Form validation**: Submit invalid data, check error messages

---

## Next Steps

1. ✅ Review this document
2. 📋 Create GitHub issues for Phase 1 modules
3. 🛠️ Start with Company module (critical path)
4. 🧪 Test thoroughly before moving to Phase 2
5. 📊 Track progress and adjust timeline
