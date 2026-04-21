# 🗂️ API Endpoints Reference - Coverage Map

This is a quick lookup table showing which endpoints are implemented in the frontend.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented |
| 🟡 | Partially implemented |
| ❌ | Not implemented |
| 🔒 | Requires authentication |
| 👤 | Candidate role only |
| 💼 | Recruiter role only |
| 🛡️ | Admin role only |

---

## Authentication Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `/api/auth/register` | POST | ❌ | ✅ Complete | register.page.js |
| `/api/auth/login` | POST | ❌ | ✅ Complete | login.page.js |
| `/api/auth/refresh` | POST | ❌ | ✅ Complete | auth.service.js |
| `/api/auth/logout` | POST | 🔒 | ✅ Complete | auth.service.js |
| `/api/auth/me` | GET | 🔒 | ✅ Complete | auth.service.js |

**Summary:** ✅ 5/5 endpoints implemented

---

## Candidate Profile Endpoints

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `POST /candidate/profile` | POST | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/:id` | GET | 🔒👤 | ✅ Yes | my-profile.page.js |
| `PATCH /candidate/profile/:id` | PATCH | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `DELETE /candidate/profile/:id` | DELETE | 🔒👤 | ❌ No | Account deletion not implemented |
| `POST /candidate/profile/:id/experiences` | POST | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/:id/experiences` | GET | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/experiences/:id` | GET | 🔒👤 | ✅ Yes | candidateService |
| `PATCH /candidate/profile/experiences/:id` | PATCH | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `DELETE /candidate/profile/experiences/:id` | DELETE | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `POST /candidate/profile/:id/education` | POST | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/:id/education` | GET | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/education/:id` | GET | 🔒👤 | ✅ Yes | candidateService |
| `PATCH /candidate/profile/education/:id` | PATCH | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `DELETE /candidate/profile/education/:id` | DELETE | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `POST /candidate/profile/:id/skills` | POST | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/:id/skills` | GET | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/skills/:id` | GET | 🔒👤 | ✅ Yes | candidateService |
| `PATCH /candidate/profile/skills/:id` | PATCH | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `DELETE /candidate/profile/skills/:id` | DELETE | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `POST /candidate/profile/:id/languages` | POST | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/:id/languages` | GET | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `GET /candidate/profile/languages/:id` | GET | 🔒👤 | ✅ Yes | candidateService |
| `PATCH /candidate/profile/languages/:id` | PATCH | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `DELETE /candidate/profile/languages/:id` | DELETE | 🔒👤 | ✅ Yes | edit-my-profile.page.js |
| `POST /candidate/profile/:id/cv` | POST | 🔒👤 | ✅ Yes | cv.page.js |
| `GET /candidate/profile/:id/cv` | GET | 🔒👤 | ✅ Yes | cv.page.js |
| `GET /candidate/profile/cv/:id` | GET | 🔒👤 | ✅ Yes | candidateService |
| `DELETE /candidate/profile/:id/cv` | DELETE | 🔒👤 | ✅ Yes | cv.page.js |
| `POST /candidate/profile/:id/interests` | POST | 🔒👤 | ❌ No | **TODO:** Add to edit-my-profile |
| `GET /candidate/profile/:id/interests` | GET | 🔒👤 | ❌ No | **TODO:** Show in profile |
| `DELETE /candidate/profile/:id/interests` | DELETE | 🔒👤 | ❌ No | **TODO:** Allow delete |

**Summary:** ✅ 26/29 endpoints (3 missing for interests)

---

## Company Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `GET /companies/` | GET | ❌ | ❌ No | **TODO:** companies.page.js |
| `GET /companies/:id` | GET | ❌ | ❌ No | **TODO:** company-profile.page.js |
| `GET /companies/:id/locations` | GET | ❌ | ❌ No | **TODO:** part of company-profile |
| `GET /companies/:id/benefits` | GET | ❌ | ❌ No | **TODO:** part of company-profile |
| `GET /companies/:id/members` | GET | ❌ | ❌ No | **TODO:** part of company-profile |
| `POST /companies/` | POST | 🔒💼 | ❌ No | **TODO:** company-dashboard.page.js |
| `PATCH /companies/:id` | PATCH | 🔒💼 | ❌ No | **TODO:** company-profile.page.js |
| `DELETE /companies/:id` | DELETE | 🔒💼 | ❌ No | **TODO:** company delete action |
| `POST /companies/:id/locations` | POST | 🔒💼 | ❌ No | **TODO:** manage locations modal |
| `PATCH /companies/:id/locations/:locId` | PATCH | 🔒💼 | ❌ No | **TODO:** edit location modal |
| `DELETE /companies/:id/locations/:locId` | DELETE | 🔒💼 | ❌ No | **TODO:** delete location action |
| `POST /companies/:id/benefits` | POST | 🔒💼 | ❌ No | **TODO:** manage benefits modal |
| `PATCH /companies/:id/benefits/:benId` | PATCH | 🔒💼 | ❌ No | **TODO:** edit benefit modal |
| `DELETE /companies/:id/benefits/:benId` | DELETE | 🔒💼 | ❌ No | **TODO:** delete benefit action |
| `POST /companies/:id/members` | POST | 🔒💼 | ❌ No | **TODO:** add team member modal |
| `PATCH /companies/:id/members/:memId` | PATCH | 🔒💼 | ❌ No | **TODO:** edit member modal |
| `DELETE /companies/:id/members/:memId` | DELETE | 🔒💼 | ❌ No | **TODO:** remove member action |
| `POST /companies/:id/verification` | POST | 🔒💼 | ❌ No | **TODO:** company-verification.page.js |
| `GET /companies/:id/verification` | GET | 🔒💼 | ❌ No | **TODO:** verification status |
| `GET /companies/:id/verification/documents` | GET | 🔒💼 | ❌ No | **TODO:** view docs |
| `POST /companies/:id/verification/submissions/:submissionId/review` | POST | 🔒🛡️ | ❌ No | **TODO:** admin approval |

**Summary:** ❌ 0/21 endpoints implemented ⚠️ **CRITICAL BLOCKER**

---

## Application Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `POST /applications/` | POST | 🔒👤 | ✅ Yes | vacancies.page.js |
| `GET /applications/` | GET | 🔒 | ✅ Yes | applications.page.js |
| `GET /applications/:id` | GET | 🔒 | 🟡 Partial | No detail page |
| `PATCH /applications/:id` | PATCH | 🔒👤 | ❌ No | **TODO:** withdraw application |
| `POST /applications/saved-jobs` | POST | 🔒👤 | ✅ Yes | vacancies.page.js |
| `GET /applications/saved-jobs` | GET | 🔒👤 | ✅ Yes | saved-jobs.page.js |
| `DELETE /applications/saved-jobs/:id` | DELETE | 🔒👤 | ✅ Yes | saved-jobs.page.js |
| `POST /applications/follows` | POST | 🔒👤 | ❌ No | **TODO:** follow company button |
| `GET /applications/follows` | GET | 🔒👤 | ❌ No | **TODO:** followed-companies.page.js |
| `DELETE /applications/follows/:id` | DELETE | 🔒👤 | ❌ No | **TODO:** unfollow action |
| `POST /applications/:id/status` | POST | 🔒💼 | ❌ No | **TODO:** recruiter status updates |
| `GET /applications/:id/history` | GET | 🔒 | ❌ No | **TODO:** timeline component |
| `POST /applications/:id/comments` | POST | 🔒 | ❌ No | **TODO:** comments section |
| `GET /applications/:id/comments` | GET | 🔒 | ❌ No | **TODO:** view comments |
| `GET /applications/comments/:id` | GET | 🔒 | ❌ No | **TODO:** get single comment |
| `PATCH /applications/comments/:id` | PATCH | 🔒 | ❌ No | **TODO:** edit comment |
| `DELETE /applications/comments/:id` | DELETE | 🔒 | ❌ No | **TODO:** delete comment |

**Summary:** ✅ 5/17 implemented + 🟡 1 partial (35% coverage)

---

## Vacancy Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `GET /vacancies/` | GET | ❌ | ✅ Yes | vacancies.page.js |
| `GET /vacancies/:id` | GET | ❌ | ✅ Yes | vacancy-detail.page.js |
| `GET /vacancies/categories` | GET | ❌ | 🟡 Partial | Listed but filters not used |
| `GET /vacancies/categories/:id` | GET | ❌ | ❌ No | **TODO:** category detail page |
| `POST /vacancies/categories` | POST | 🔒🛡️ | ❌ No | **TODO:** admin category creation |
| `PATCH /vacancies/categories/:id` | PATCH | 🔒🛡️ | ❌ No | **TODO:** admin category edit |
| `DELETE /vacancies/categories/:id` | DELETE | 🔒🛡️ | ❌ No | **TODO:** admin category delete |
| `GET /vacancies/manage/all` | GET | 🔒💼 | ✅ Yes | my-vacancies.page.js |
| `GET /vacancies/manage/:id` | GET | 🔒💼 | ❌ No | **TODO:** vacancy detail/edit |
| `POST /vacancies/` | POST | 🔒💼 | ✅ Yes | create-vacancy.page.js |
| `PATCH /vacancies/:id` | PATCH | 🔒💼 | ❌ No | **TODO:** vacancy-edit.page.js |
| `DELETE /vacancies/:id` | DELETE | 🔒💼 | ❌ No | **TODO:** delete action |
| `PATCH /vacancies/:id/close` | PATCH | 🔒💼 | ❌ No | **TODO:** close action |
| `PATCH /vacancies/:id/archive` | PATCH | 🔒💼 | ❌ No | **TODO:** archive action |
| `POST /vacancies/:id/skills` | POST | 🔒💼 | 🟡 Partial | In create-vacancy, missing edit |
| `PATCH /vacancies/skills/:id` | PATCH | 🔒💼 | ❌ No | **TODO:** edit skill modal |
| `DELETE /vacancies/skills/:id` | DELETE | 🔒💼 | ❌ No | **TODO:** delete skill action |
| `POST /vacancies/:id/benefits` | POST | 🔒💼 | 🟡 Partial | In create-vacancy, missing edit |
| `PATCH /vacancies/benefits/:id` | PATCH | 🔒💼 | ❌ No | **TODO:** edit benefit modal |
| `DELETE /vacancies/benefits/:id` | DELETE | 🔒💼 | ❌ No | **TODO:** delete benefit action |

**Summary:** ✅ 4/20 + 🟡 3 partial (35% coverage) ⚠️ **HIGH BLOCKER**

---

## Forum Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `GET /forum/categories` | GET | ❌ | ❌ No | **TODO:** forum-categories.page.js |
| `GET /forum/categories/:id` | GET | ❌ | ❌ No | **TODO:** category detail page |
| `POST /forum/categories` | POST | 🔒🛡️ | ❌ No | **TODO:** admin create category |
| `PATCH /forum/categories/:id` | PATCH | 🔒🛡️ | ❌ No | **TODO:** admin edit category |
| `DELETE /forum/categories/:id` | DELETE | 🔒🛡️ | ❌ No | **TODO:** admin delete category |
| `GET /forum/threads` | GET | ❌ | ❌ No | **TODO:** forum-threads.page.js |
| `GET /forum/threads/:id` | GET | ❌ | ❌ No | **TODO:** forum-thread-detail.page.js |
| `POST /forum/threads` | POST | 🔒 | ❌ No | **TODO:** create thread modal |
| `PATCH /forum/threads/:id` | PATCH | 🔒 | ❌ No | **TODO:** edit thread |
| `DELETE /forum/threads/:id` | DELETE | 🔒 | ❌ No | **TODO:** delete thread |
| `GET /forum/threads/:id/posts` | GET | ❌ | ❌ No | **TODO:** part of thread-detail |
| `POST /forum/threads/:id/posts` | POST | 🔒 | ❌ No | **TODO:** reply to thread |
| `GET /forum/posts/:id` | GET | ❌ | ❌ No | **TODO:** post detail page |
| `PATCH /forum/posts/:id` | PATCH | 🔒 | ❌ No | **TODO:** edit post |
| `DELETE /forum/posts/:id` | DELETE | 🔒 | ❌ No | **TODO:** delete post |
| `POST /forum/threads/:id/reports` | POST | 🔒 | ❌ No | **TODO:** report thread |
| `POST /forum/posts/:id/reports` | POST | 🔒 | ❌ No | **TODO:** report post |
| `GET /forum/reports` | GET | 🔒🛡️ | ❌ No | **TODO:** forum-moderation.page.js |
| `GET /forum/reports/:id` | GET | 🔒🛡️ | ❌ No | **TODO:** report detail |
| `PATCH /forum/reports/:id` | PATCH | 🔒🛡️ | ❌ No | **TODO:** moderate report |

**Summary:** ❌ 0/20 endpoints implemented (0% coverage)

---

## Review Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `GET /reviews/company/:companyId` | GET | ❌ | ❌ No | **TODO:** company-reviews.page.js |
| `GET /reviews/company/:companyId/summary` | GET | ❌ | ❌ No | **TODO:** company profile widget |
| `GET /reviews/:id` | GET | ❌ | ❌ No | **TODO:** review detail |
| `GET /reviews/me/list` | GET | 🔒 | ❌ No | **TODO:** my-reviews.page.js |
| `POST /reviews/` | POST | 🔒 | ❌ No | **TODO:** create review modal |
| `PATCH /reviews/:id` | PATCH | 🔒 | ❌ No | **TODO:** edit review |
| `DELETE /reviews/:id` | DELETE | 🔒 | ❌ No | **TODO:** delete review |
| `POST /reviews/:id/helpfulness` | POST | 🔒 | ❌ No | **TODO:** mark helpful |
| `DELETE /reviews/:id/helpfulness` | DELETE | 🔒 | ❌ No | **TODO:** unmark helpful |
| `POST /reviews/:id/reports` | POST | 🔒 | ❌ No | **TODO:** report review |
| `GET /reviews/admin/reported/list` | GET | 🔒🛡️ | ❌ No | **TODO:** review-moderation.page.js |
| `GET /reviews/admin/:id/reports` | GET | 🔒🛡️ | ❌ No | **TODO:** review reports detail |
| `PATCH /reviews/admin/:id/status` | PATCH | 🔒🛡️ | ❌ No | **TODO:** admin moderate |

**Summary:** ❌ 0/13 endpoints implemented (0% coverage) ⚠️ **Service missing**

---

## Resource Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `GET /resources/categories` | GET | ❌ | ❌ No | **TODO:** resource-categories.page.js |
| `GET /resources/categories/:id` | GET | ❌ | ❌ No | **TODO:** category detail |
| `GET /resources/` | GET | ❌ | ✅ Yes | resources.page.js |
| `GET /resources/:id` | GET | ❌ | ❌ No | **TODO:** resource-detail.page.js |
| `GET /resources/:id/ratings` | GET | ❌ | ❌ No | **TODO:** show ratings on detail |
| `GET /resources/:id/related` | GET | ❌ | ❌ No | **TODO:** related resources section |
| `POST /resources/categories` | POST | 🔒🛡️ | ❌ No | **TODO:** admin create category |
| `PATCH /resources/categories/:id` | PATCH | 🔒🛡️ | ❌ No | **TODO:** admin edit category |
| `DELETE /resources/categories/:id` | DELETE | 🔒🛡️ | ❌ No | **TODO:** admin delete category |
| `POST /resources/` | POST | 🔒🛡️ | ❌ No | **TODO:** admin create resource |
| `PATCH /resources/:id` | PATCH | 🔒🛡️ | ❌ No | **TODO:** admin edit resource |
| `DELETE /resources/:id` | DELETE | 🔒🛡️ | ❌ No | **TODO:** admin delete resource |
| `POST /resources/:id/related` | POST | 🔒🛡️ | ❌ No | **TODO:** admin link related |
| `DELETE /resources/related/:id` | DELETE | 🔒🛡️ | ❌ No | **TODO:** admin unlink related |
| `POST /resources/:id/ratings` | POST | 🔒 | ❌ No | **TODO:** rate resource |

**Summary:** ✅ 1/15 endpoints (7% coverage)

---

## Notification Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `GET /notifications/unread-count` | GET | 🔒 | ❌ No | **TODO:** navbar badge |
| `PATCH /notifications/read-all` | PATCH | 🔒 | ❌ No | **TODO:** mark all read button |
| `POST /notifications/alerts` | POST | 🔒 | ❌ No | **TODO:** create job alert |
| `GET /notifications/alerts` | GET | 🔒 | ❌ No | **TODO:** my-alerts.page.js |
| `GET /notifications/alerts/:id` | GET | 🔒 | ❌ No | **TODO:** alert detail |
| `PATCH /notifications/alerts/:id` | PATCH | 🔒 | ❌ No | **TODO:** edit alert |
| `DELETE /notifications/alerts/:id` | DELETE | 🔒 | ❌ No | **TODO:** delete alert |
| `GET /notifications/` | GET | 🔒 | ❌ No | **TODO:** notifications.page.js |
| `POST /notifications/` | POST | 🔒🛡️ | ❌ No | **TODO:** admin send notification |
| `GET /notifications/:id` | GET | 🔒 | ❌ No | **TODO:** notification detail |
| `PATCH /notifications/:id/read` | PATCH | 🔒 | ❌ No | **TODO:** mark read |
| `DELETE /notifications/:id` | DELETE | 🔒 | ❌ No | **TODO:** delete notification |

**Summary:** ❌ 0/12 endpoints implemented (0% coverage) ⚠️ **Service missing**

---

## Admin Endpoints

| Endpoint | Method | Auth | Status | Page/Service |
|----------|--------|------|--------|--------------|
| `GET /admin/roles` | GET | 🔒🛡️ | ❌ No | **TODO:** admin-dashboard.page.js |
| `GET /admin/roles/:name/users` | GET | 🔒🛡️ | ❌ No | **TODO:** users by role |
| `GET /admin/users` | GET | 🔒🛡️ | ❌ No | **TODO:** admin-users.page.js |
| `GET /admin/users/:id/roles` | GET | 🔒🛡️ | ❌ No | **TODO:** user detail |
| `POST /admin/users/:id/roles` | POST | 🔒🛡️ | ❌ No | **TODO:** assign role modal |
| `DELETE /admin/users/:id/roles` | DELETE | 🔒🛡️ | ❌ No | **TODO:** remove role action |

**Summary:** ❌ 0/6 endpoints implemented (0% coverage)

---

## Summary Statistics

```
Total Endpoints: ~80
Fully Implemented (✅): 34 endpoints (42%)
Partially Implemented (🟡): 5 endpoints (6%)
Not Implemented (❌): 41 endpoints (51%)

By Module:
├─ Auth              ✅ 100% (5/5)
├─ Candidate         ✅ 90% (26/29)
├─ Application       🟡 35% (5/17)
├─ Vacancy           🟡 35% (7/20)
├─ Company           ❌ 0% (0/21)
├─ Forum             ❌ 0% (0/20)
├─ Review            ❌ 0% (0/13)
├─ Resource          ❌ 7% (1/15)
├─ Notification      ❌ 0% (0/12)
└─ Admin             ❌ 0% (0/6)

Critical Gaps:
🔴 Company (21 missing) — Blocks recruiter onboarding
🔴 Application (12 missing) — Blocks communication
🔴 Vacancy (13 missing) — Blocks job management
🟡 Forum (20 missing) — Community features
🟡 Review (13 missing) — Feedback system
🟡 Notification (12 missing) — User engagement
```

---

## How to Use This Reference

1. **Find an endpoint** in this table
2. **Check the status:**
   - ✅ Already implemented → use the existing code
   - 🟡 Partially done → extend the existing code
   - ❌ Not implemented → create new files/code
3. **Follow the TODO suggestion** to implement missing endpoints
4. **Reference the MISSING_MODULES.md** for detailed requirements

---

## Quick Links

- [ANALYSIS_SUMMARY.md](./ANALYSIS_SUMMARY.md) — Executive summary
- [MISSING_MODULES.md](./MISSING_MODULES.md) — Detailed module breakdown
- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) — Step-by-step roadmap
- [copilot-instructions.md](./copilot-instructions.md) — Code patterns & conventions
