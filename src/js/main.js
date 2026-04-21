// TrabajaHoy - Main Application Entry Point
import { store } from "./core/store.js";
import { config } from "./core/config.js";
import { router } from "./core/router.js";
import { storage } from "./utils/storage.js";
import { authService } from "./services/auth.service.js";
import { api } from "./services/api.js";
import {
  ROLE,
  getDashboardRouteForRoles,
  resolveRolesFromPayload,
} from "./core/roles.js";
import { renderNavbar, renderPage, renderRoleShell } from "./utils/ui.js";

// ── Public pages ────────────────────────────────────────────────────────────
import { initLandingPage } from "@pages/landing.page.js";
import { initLoginPage } from "@pages/login.page.js";
import { initRegisterPage } from "@pages/register.page.js";
import { initVacanciesPage } from "@pages/vacancies.page.js";
import { initVacancyDetailPage } from "@pages/vacancy-detail.page.js";
import { initResourcesPage } from "@pages/resources.page.js";
import { initResourceDetailPage } from "@pages/resource-detail.page.js";
import { initForumPage } from "@pages/forum.page.js";
import { initForumThreadPage } from "@pages/forum-thread.page.js";

// ── Company public profile (any user) ───────────────────────────────────────
import { initCompanyPublicProfilePage } from "@pages/company-public-profile.page.js";

// ── Candidate pages ──────────────────────────────────────────────────────────
import { initCandidateDashboardPage } from "@pages/candidate-dashboard.page.js";
import { initMyProfilePage } from "@pages/my-profile.page.js";
import { initEditMyProfilePage } from "@pages/edit-my-profile.page.js";
import { initSavedJobsPage } from "@pages/saved-jobs.page.js";
import { initApplicationsPage } from "@pages/applications.page.js";
import { initCandidateApplicationDetailPage } from "@pages/candidate-application-detail.page.js";
import { initCVPage } from "@pages/cv.page.js";

// ── Recruiter / company pages ────────────────────────────────────────────────
import { initCompanyProfilePage } from "@pages/company-profile.page.js";
import { initEditCompanyProfilePage } from "@pages/edit-company-profile.page.js";
import { initMyVacanciesPage } from "@pages/my-vacancies.page.js";
import { initCreateVacancyPage } from "@pages/create-vacancy.page.js";
import { initEditVacancyPage } from "@pages/edit-vacancy.page.js";
import { initCompanyApplicantsPage } from "@pages/company-applicants.page.js";
import { initApplicantDetailPage } from "@pages/applicant-detail.page.js";
import { initCandidatePublicProfilePage } from "@pages/candidate-public-profile.page.js";
import { initCompanyMembersPage } from "@pages/company-members.page.js";

// ── Admin / moderator pages ──────────────────────────────────────────────────
import { initAdminResourcesPage } from "@pages/admin-resources.page.js";
import { initAdminForumPage } from "@pages/admin-forum.page.js";

let logoutInProgress = false;

// ============================================================
// Loading Helpers
// ============================================================
function showLoading(message = "Cargando...") {
  document.getElementById("app").innerHTML = `
    <div class="app-loading">
      <div class="app-loading__spinner"></div>
      <p class="app-loading__text">${message}</p>
    </div>
  `;
}

// ============================================================
// API Health Check
// ============================================================
async function checkApiHealth() {
  try {
    const response = await api.get("/health");
    const isHealthy =
      response?.status === "success" ||
      response?.success === true ||
      response?.data?.success === true;
    store.set("apiHealthy", isHealthy);
    return isHealthy;
  } catch (error) {
    console.error("API health check failed:", error.message);
    store.set("apiHealthy", false);
    return false;
  }
}

function renderApiError() {
  document.getElementById("app").innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;padding:40px 20px;">
      <div style="background:white;border-radius:16px;padding:48px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.1);text-align:center;">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin-bottom:24px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h1 style="font-size:24px;margin-bottom:12px;color:#111827;">No se puede conectar con el servidor</h1>
        <p style="color:#6b7280;margin-bottom:24px;">Verifica tu conexión a internet e intenta de nuevo.</p>
        <button id="retry-btn" style="padding:12px 32px;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;">
          Reintentar
        </button>
      </div>
    </div>
  `;
  document.getElementById("retry-btn").addEventListener("click", async () => {
    const healthy = await checkApiHealth();
    if (healthy) window.location.reload();
  });
}

function getCurrentPathFromHash() {
  const hash = window.location.hash.slice(1);
  return (hash || config.ROUTES.LANDING).split("?")[0];
}

function isAuthEntrypointPath(path) {
  return [
    config.ROUTES.LANDING,
    config.ROUTES.LOGIN,
    config.ROUTES.REGISTER_CANDIDATE,
  ].includes(path);
}

function bindGlobalAuthUiEvents() {
  document.addEventListener(
    "click",
    async (event) => {
      const logoutBtn = event.target.closest("#logout-btn");
      if (!logoutBtn) return;

      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }

      if (logoutInProgress) return;
      logoutInProgress = true;
      try {
        await authService.logout();
        window.location.hash = "#/";
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        logoutInProgress = false;
      }
    },
    true,
  );
}

// ============================================================
// Restore Session
// ============================================================
async function restoreSession() {
  const { accessToken, refreshToken, user, roles } = storage.getAuthSession();
  const storedRoles = Array.isArray(roles) ? roles : [];
  const resolvedRoles = resolveRolesFromPayload({ user, roles });
  const hasUserObject = Boolean(
    user && typeof user === "object" && !Array.isArray(user),
  );
  const hasAccessToken = Boolean(accessToken);
  const hasSessionArtifacts =
    hasAccessToken ||
    Boolean(refreshToken) ||
    hasUserObject ||
    storedRoles.length > 0;

  if (!hasAccessToken) {
    if (hasSessionArtifacts) {
      console.warn("Discarding stale auth artifacts: missing access token.");
      store.clearAuth();
      storage.clearAuthSession();
    }
    return false;
  }

  if (!hasUserObject) {
    console.warn("Discarding invalid session: missing user payload.");
    store.clearAuth();
    storage.clearAuthSession();
    return false;
  }

  store.setAuth({ accessToken, refreshToken }, user, resolvedRoles);
  storage.setAuthSession({
    accessToken,
    refreshToken,
    user,
    roles: store.getRoles(),
  });

  if (store.getRoles().length === 0) {
    try {
      const profile = await authService.fetchCurrentUserProfile();
      storage.setAuthSession({
        accessToken,
        refreshToken,
        user: profile.user,
        roles: profile.roles,
      });
    } catch (error) {
      console.warn("Session restoration failed:", error?.message || error);
      store.clearAuth();
      storage.clearAuthSession();
      return false;
    }

    if (store.getRoles().length === 0) {
      console.warn(
        "Discarding session: authenticated user has no assigned role.",
      );
      store.clearAuth();
      storage.clearAuthSession();
      return false;
    }
  }
  return true;
}

// ============================================================
// Register Routes
// ============================================================
function registerRoutes() {
  // ── Public ──────────────────────────────────────────────────────────────
  router.on(config.ROUTES.LANDING, initLandingPage, { redirectIfAuth: true });
  router.on(config.ROUTES.LOGIN, initLoginPage, { redirectIfAuth: true });
  router.on(config.ROUTES.REGISTER_CANDIDATE, initRegisterPage, {
    redirectIfAuth: true,
  });

  router.on(config.ROUTES.VACANCIES, initVacanciesPage);

  router.on(config.ROUTES.VACANCY_DETAIL, async (params) => {
    await initVacancyDetailPage(params.id);
  });

  router.on(config.ROUTES.RESOURCES, initResourcesPage);

  router.on(config.ROUTES.RESOURCE_DETAIL, async (params) => {
    await initResourceDetailPage(params.id);
  });

  router.on(config.ROUTES.FORUM, initForumPage);

  router.on(config.ROUTES.FORUM_THREAD, async (params) => {
    await initForumThreadPage(params.id);
  });

  // Public company profile (any visitor can view)
  router.on(config.ROUTES.COMPANY_PUBLIC_PROFILE, async (params) => {
    await initCompanyPublicProfilePage(params.id);
  });

  // ── Candidate ────────────────────────────────────────────────────────────
  router.on(config.ROUTES.CANDIDATE_DASHBOARD, initCandidateDashboardPage, {
    requiresAuth: true,
    roles: [ROLE.CANDIDATE],
  });

  // Recruiter/admin: view a candidate's public profile by userId
  // MUST be registered BEFORE MY_PROFILE (/candidate/profile) to avoid :userId being shadowed
  router.on(config.ROUTES.CANDIDATE_PUBLIC_PROFILE, async (params) => {
    await initCandidatePublicProfilePage(params.userId);
  }, {
    requiresAuth: true,
    roles: [ROLE.RECRUITER, ROLE.ADMIN],
  });

  router.on(config.ROUTES.MY_PROFILE, initMyProfilePage, {
    requiresAuth: true,
    roles: [ROLE.CANDIDATE],
  });

  router.on(config.ROUTES.EDIT_PROFILE, initEditMyProfilePage, {
    requiresAuth: true,
    roles: [ROLE.CANDIDATE],
  });

  router.on(config.ROUTES.MANAGE_CV, initCVPage, {
    requiresAuth: true,
    roles: [ROLE.CANDIDATE],
  });

  router.on(config.ROUTES.SAVED_JOBS, initSavedJobsPage, {
    requiresAuth: true,
    roles: [ROLE.CANDIDATE],
  });

  router.on(config.ROUTES.MY_APPLICATIONS, initApplicationsPage, {
    requiresAuth: true,
    roles: [ROLE.CANDIDATE],
  });

  router.on(config.ROUTES.APPLICATION_DETAIL, async (params) => {
    await initCandidateApplicationDetailPage(params.id);
  }, {
    requiresAuth: true,
    roles: [ROLE.CANDIDATE],
  });

  // ── Recruiter / Company ───────────────────────────────────────────────────
  // Company dashboard — reuses the company profile page as the main hub
  router.on(
    config.ROUTES.COMPANY_DASHBOARD,
    (params, query) => initCompanyProfilePage(params, query),
    {
      requiresAuth: true,
      roles: [ROLE.RECRUITER, ROLE.ADMIN],
    },
  );

  router.on(
    config.ROUTES.COMPANY_PROFILE,
    (params, query) => initCompanyProfilePage(params, query),
    {
      requiresAuth: true,
      roles: [ROLE.RECRUITER, ROLE.ADMIN],
    },
  );

  router.on(
    config.ROUTES.EDIT_COMPANY_PROFILE,
    (params, query) => initEditCompanyProfilePage(params, query),
    {
      requiresAuth: true,
      roles: [ROLE.RECRUITER, ROLE.ADMIN],
    },
  );

  router.on(config.ROUTES.MY_VACANCIES, initMyVacanciesPage, {
    requiresAuth: true,
    roles: [ROLE.RECRUITER, ROLE.ADMIN],
  });

  router.on(config.ROUTES.CREATE_VACANCY, initCreateVacancyPage, {
    requiresAuth: true,
    roles: [ROLE.RECRUITER, ROLE.ADMIN],
  });

  router.on(config.ROUTES.EDIT_VACANCY, async (params) => {
    await initEditVacancyPage(params.id);
  }, {
    requiresAuth: true,
    roles: [ROLE.RECRUITER, ROLE.ADMIN],
  });

  // IMPORTANT: register the more-specific /create route BEFORE /:id/applicants
  router.on(config.ROUTES.VACANCY_APPLICANTS, async (params) => {
    await initCompanyApplicantsPage(params.id);
  }, {
    requiresAuth: true,
    roles: [ROLE.RECRUITER, ROLE.ADMIN],
  });

  router.on(config.ROUTES.APPLICANT_DETAIL, async (params) => {
    await initApplicantDetailPage(params.id);
  }, {
    requiresAuth: true,
    roles: [ROLE.RECRUITER, ROLE.ADMIN],
  });

  router.on(config.ROUTES.COMPANY_MEMBERS, initCompanyMembersPage, {
    requiresAuth: true,
    roles: [ROLE.RECRUITER, ROLE.ADMIN],
  });

  // ── Admin / Moderator ─────────────────────────────────────────────────────
  router.on(
    config.ROUTES.ADMIN_DASHBOARD,
    createAdminDashboardPage(),
    {
      requiresAuth: true,
      roles: [ROLE.ADMIN],
    },
  );

  router.on(
    config.ROUTES.ADMIN_USERS,
    createPlaceholderPage(
      "Gestión de Usuarios",
      "Administra los usuarios del sistema.",
    ),
    {
      requiresAuth: true,
      roles: [ROLE.ADMIN],
    },
  );

  router.on(
    config.ROUTES.ADMIN_RESOURCES,
    (params, query) => initAdminResourcesPage(params, query),
    {
      requiresAuth: true,
      roles: [ROLE.ADMIN, ROLE.MODERATOR],
    },
  );

  router.on(
    config.ROUTES.ADMIN_FORUM,
    (params, query) => initAdminForumPage(params, query),
    {
      requiresAuth: true,
      roles: [ROLE.ADMIN, ROLE.MODERATOR],
    },
  );
}

// ============================================================
// Admin Dashboard Page
// ============================================================
function createAdminDashboardPage() {
  return async function () {
    const isAuthenticated = store.get("isAuthenticated");
    const user = store.get("user");
    const userRoles = store.getRoles();
    const primaryRole = store.getPrimaryRole();
    const navbar = renderNavbar({ activeRoute: config.ROUTES.ADMIN_DASHBOARD, isAuthenticated, user, roles: userRoles, primaryRole });

    const cards = [
      {
        href: config.ROUTES.ADMIN_USERS,
        icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        label: "Usuarios",
        desc: "Gestionar usuarios del sistema",
        color: "#3b82f6",
        bg: "#eff6ff",
      },
      {
        href: config.ROUTES.ADMIN_RESOURCES,
        icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
        label: "Recursos",
        desc: "Crear, editar y publicar recursos",
        color: "#10b981",
        bg: "#ecfdf5",
      },
      {
        href: config.ROUTES.ADMIN_FORUM,
        icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
        label: "Foro",
        desc: "Moderar reportes y administrar hilos",
        color: "#8b5cf6",
        bg: "#f5f3ff",
      },
    ];

    const main = `
      <div class="adm-container">
        <div class="adm-header">
          <h1 class="adm-title">Panel de Administración</h1>
          <p class="adm-subtitle">Bienvenido, ${user?.firstName || "Administrador"}. Gestiona el sistema desde aquí.</p>
        </div>
        <div class="adm-grid">
          ${cards.map(c => `
            <a href="#${c.href}" class="adm-card" style="--card-color:${c.color};--card-bg:${c.bg}">
              <div class="adm-card__icon" style="background:${c.bg};color:${c.color}">${c.icon}</div>
              <div>
                <h2 class="adm-card__label">${c.label}</h2>
                <p class="adm-card__desc">${c.desc}</p>
              </div>
              <svg class="adm-card__arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          `).join("")}
        </div>
      </div>
    `;

    const styles = `
      .adm-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 40px 0 60px; }
      .adm-container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
      .adm-header { margin-bottom: 36px; }
      .adm-title { font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 6px; }
      .adm-subtitle { color: #6b7280; font-size: 16px; margin: 0; }
      .adm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
      .adm-card { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); text-decoration: none; border: 2px solid transparent; transition: all 0.2s ease; }
      .adm-card:hover { border-color: var(--card-color); box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-2px); }
      .adm-card__icon { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .adm-card__label { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 4px; }
      .adm-card__desc { font-size: 14px; color: #6b7280; margin: 0; }
      .adm-card__arrow { margin-left: auto; color: #d1d5db; flex-shrink: 0; transition: color 0.2s, transform 0.2s; }
      .adm-card:hover .adm-card__arrow { color: var(--card-color); transform: translateX(4px); }
      @media (max-width: 640px) { .adm-grid { grid-template-columns: 1fr; } }
    `;

    document.getElementById("app").innerHTML = renderPage({
      navbar,
      main,
      pageClass: "adm-page",
      extraStyles: styles,
    });
  };
}

// ============================================================
// Placeholder Page Helper
// ============================================================
function createPlaceholderPage(title, description) {
  return async function () {
    const isAuthenticated = store.get("isAuthenticated");
    const user = store.get("user");
    const userRoles = store.getRoles();
    const primaryRole = store.getPrimaryRole();
    const panelRoute = getDashboardRouteForRoles(userRoles, config.ROUTES.LANDING);
    const fullName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Usuario";

    const navbar = renderNavbar({
      activeRoute: panelRoute,
      isAuthenticated,
      user,
      roles: userRoles,
      primaryRole,
      extraHeaderContent: isAuthenticated
        ? `<span class="main-placeholder__user">${fullName}</span>`
        : "",
    });

    const shell = renderRoleShell({
      title,
      subtitle: description,
      roles: userRoles,
      primaryRole,
      actions: `<a href="#${panelRoute}" class="btn btn--outline">Volver al panel</a>`,
      content: `
        <div class="main-placeholder__empty">
          <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#d1d5db" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <p>Esta sección estará disponible próximamente.</p>
        </div>
      `,
    });

    const extraStyles = `
      .role-placeholder-page { min-height: calc(100vh - 70px); background: #f9fafb; }
      .main-placeholder__user { color: #6b7280; font-size: 13px; }
      .main-placeholder__empty { text-align: center; color: #9ca3af; padding: 26px 12px; }
      .main-placeholder__empty svg { margin-bottom: 16px; }
      .main-placeholder__empty p { margin: 0; font-size: 14px; }
      @media (max-width: 768px) { .main-placeholder__user { display: none; } }
    `;

    document.getElementById("app").innerHTML = renderPage({
      navbar,
      main: shell,
      pageClass: "role-placeholder-page",
      extraStyles,
    });
  };
}

// ============================================================
// Initialize Application
// ============================================================
async function init() {
  bindGlobalAuthUiEvents();

  // Restore session
  const sessionRestored = await restoreSession();

  if (sessionRestored) {
    const currentPath = getCurrentPathFromHash();
    if (isAuthEntrypointPath(currentPath)) {
      const dashboardRoute = getDashboardRouteForRoles(
        store.getRoles(),
        config.ROUTES.LANDING,
      );
      window.location.hash = `#${dashboardRoute}`;
    }
  }

  // Check API health
  const apiHealthy = await checkApiHealth();
  if (!apiHealthy) {
    renderApiError();
    return;
  }

  // Register all routes
  registerRoutes();

  // Initialize the router (handles initial route + hash changes)
  router.init();
}

// Start the application
init();
