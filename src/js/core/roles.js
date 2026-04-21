import { config } from "@core/config";

export const ROLE = Object.freeze({
  ADMIN: "admin",
  RECRUITER: "recruiter",
  COMPANY_ADMIN: "company_admin",
  CANDIDATE: "candidate",
  MODERATOR: "moderator",
});

export const VALID_ROLES = Object.freeze(Object.values(ROLE));

export const ROLE_PRIORITY = Object.freeze([
  ROLE.ADMIN,
  ROLE.MODERATOR,
  ROLE.COMPANY_ADMIN,
  ROLE.RECRUITER,
  ROLE.CANDIDATE,
]);

const COMPANY_ROLE_NAVIGATION = Object.freeze([
  { href: `#${config.ROUTES.COMPANY_DASHBOARD}`, label: "Dashboard empresa" },
  { href: `#${config.ROUTES.MY_VACANCIES}`, label: "Mis Vacantes" },
  { href: `#${config.ROUTES.COMPANY_PROFILE}`, label: "Perfil empresa" },
  { href: `#${config.ROUTES.CREATE_VACANCY}`, label: "Crear Vacante" },
]);

export const DASHBOARD_BY_ROLE = Object.freeze({
  [ROLE.CANDIDATE]: config.ROUTES.CANDIDATE_DASHBOARD,
  [ROLE.RECRUITER]: config.ROUTES.COMPANY_DASHBOARD,
  [ROLE.COMPANY_ADMIN]: config.ROUTES.COMPANY_DASHBOARD,
  [ROLE.ADMIN]: config.ROUTES.ADMIN_DASHBOARD,
  [ROLE.MODERATOR]: config.ROUTES.ADMIN_FORUM,
});

const PUBLIC_NAVIGATION = Object.freeze([
  { href: `#${config.ROUTES.LANDING}`, label: "Inicio" },
  { href: `#${config.ROUTES.VACANCIES}`, label: "Buscar empleos" },
  { href: `#${config.ROUTES.RESOURCES}`, label: "Recursos" },
  { href: `#${config.ROUTES.FORUM}`, label: "Foro" },
]);

const ROLE_NAVIGATION = Object.freeze({
  [ROLE.CANDIDATE]: [
    { href: `#${config.ROUTES.CANDIDATE_DASHBOARD}`, label: "Dashboard" },
    { href: `#${config.ROUTES.VACANCIES}`, label: "Buscar empleos" },
    { href: `#${config.ROUTES.SAVED_JOBS}`, label: "Guardados" },
    { href: `#${config.ROUTES.MY_APPLICATIONS}`, label: "Mis postulaciones" },
    { href: `#${config.ROUTES.MY_PROFILE}`, label: "Mi Perfil" },
    { href: `#${config.ROUTES.MANAGE_CV}`, label: "CV" },
    { href: `#${config.ROUTES.RESOURCES}`, label: "Recursos" },
    { href: `#${config.ROUTES.FORUM}`, label: "Foro" },
  ],
  [ROLE.RECRUITER]: [
    ...COMPANY_ROLE_NAVIGATION,
    { href: `#${config.ROUTES.RESOURCES}`, label: "Recursos" },
    { href: `#${config.ROUTES.FORUM}`, label: "Foro" },
  ],
  [ROLE.COMPANY_ADMIN]: [
    ...COMPANY_ROLE_NAVIGATION,
    { href: `#${config.ROUTES.RESOURCES}`, label: "Recursos" },
    { href: `#${config.ROUTES.FORUM}`, label: "Foro" },
  ],
  [ROLE.ADMIN]: [
    { href: `#${config.ROUTES.ADMIN_DASHBOARD}`, label: "Dashboard" },
    { href: `#${config.ROUTES.ADMIN_USERS}`, label: "Usuarios" },
    { href: `#${config.ROUTES.ADMIN_RESOURCES}`, label: "Recursos" },
    { href: `#${config.ROUTES.ADMIN_FORUM}`, label: "Foro" },
  ],
  [ROLE.MODERATOR]: [
    { href: `#${config.ROUTES.ADMIN_FORUM}`, label: "Foro" },
    { href: `#${config.ROUTES.ADMIN_RESOURCES}`, label: "Recursos" },
  ],
});

const ROLE_LABELS = Object.freeze({
  [ROLE.CANDIDATE]: "Candidato",
  [ROLE.RECRUITER]: "Reclutador",
  [ROLE.COMPANY_ADMIN]: "Administrador de empresa",
  [ROLE.ADMIN]: "Administrador",
  [ROLE.MODERATOR]: "Moderador",
});

export function isValidRole(role) {
  const normalized = String(role || "")
    .trim()
    .toLowerCase();

  return VALID_ROLES.includes(normalized);
}

export function normalizeRoles(roles) {
  if (!Array.isArray(roles)) return [];

  const normalized = roles
    .map((role) => {
      const normalizedRole = extractRoleString(role)
        .trim()
        .toLowerCase();
      return normalizedRole;
    })
    .filter((role) => isValidRole(role));

  return [...new Set(normalized)];
}

export function resolveRolesFromPayload(payload = {}, fallbackRoles = []) {
  const membershipRoles = extractMembershipRoles(payload);

  const candidateRoles = [
    ...(Array.isArray(payload?.roles) ? payload.roles : []),
    ...(Array.isArray(payload?.user?.roles) ? payload.user.roles : []),
    ...(Array.isArray(payload?.userRoles) ? payload.userRoles : []),
    ...(Array.isArray(payload?.user?.userRoles) ? payload.user.userRoles : []),
    ...(payload?.role ? [payload.role] : []),
    ...(payload?.user?.role ? [payload.user.role] : []),
    ...membershipRoles,
    ...(Array.isArray(fallbackRoles) ? fallbackRoles : [fallbackRoles]),
  ];

  return normalizeRoles(candidateRoles);
}

export function getPrimaryRole(roles) {
  const normalized = normalizeRoles(roles);
  return (
    ROLE_PRIORITY.find((role) => normalized.includes(role)) ||
    normalized[0] ||
    null
  );
}

export function getDashboardRouteForRoles(
  roles,
  fallback = config.ROUTES.LANDING,
) {
  const primaryRole = getPrimaryRole(roles);
  return (primaryRole && DASHBOARD_BY_ROLE[primaryRole]) || fallback;
}

export function hasAnyRole(userRoles, allowedRoles) {
  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);

  if (normalizedAllowedRoles.length === 0) return true;
  return normalizedAllowedRoles.some((role) => {
    const accepted = getEquivalentRoles(role);
    return normalizedUserRoles.some((userRole) => accepted.includes(userRole));
  });
}

export function getNavigationForRoles(roles, isAuthenticated = false) {
  if (!isAuthenticated) {
    return [...PUBLIC_NAVIGATION];
  }

  const primaryRole = getPrimaryRole(roles);
  if (!primaryRole) {
    return [...PUBLIC_NAVIGATION];
  }

  return [...(ROLE_NAVIGATION[primaryRole] || PUBLIC_NAVIGATION)];
}

export function getRoleLabel(role) {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  return ROLE_LABELS[normalizedRole] || "Usuario";
}

function extractRoleString(roleCandidate) {
  if (!roleCandidate) return "";

  if (typeof roleCandidate === "string" || typeof roleCandidate === "number") {
    return String(roleCandidate);
  }

  if (typeof roleCandidate === "object") {
    const byName =
      roleCandidate.name ||
      roleCandidate.roleName ||
      roleCandidate.role_name ||
      roleCandidate.value ||
      roleCandidate.slug ||
      roleCandidate.code ||
      roleCandidate.role;

    if (typeof byName === "string" || typeof byName === "number") {
      return String(byName);
    }

    if (byName && typeof byName === "object") {
      return extractRoleString(byName);
    }
  }

  return "";
}

function extractMembershipRoles(payload = {}) {
  const user = payload?.user || {};
  const sources = [
    payload?.companyMembers,
    payload?.company_members,
    payload?.companyMemberships,
    payload?.company_memberships,
    payload?.memberships,
    payload?.companyMembership,
    payload?.company_membership,
    user?.companyMembers,
    user?.company_members,
    user?.companyMemberships,
    user?.company_memberships,
    user?.memberships,
    user?.companyMembership,
    user?.company_membership,
  ];

  const entries = sources.flatMap((source) =>
    Array.isArray(source) ? source : source ? [source] : [],
  );

  return entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return "";
      return extractRoleString(
        entry.role ||
          entry.roleName ||
          entry.role_name ||
          entry.memberRole ||
          entry.member_role ||
          entry.companyRole ||
          entry.company_role,
      );
    })
    .filter(Boolean);
}

function getEquivalentRoles(role) {
  if (role === ROLE.RECRUITER || role === ROLE.COMPANY_ADMIN) {
    return [ROLE.RECRUITER, ROLE.COMPANY_ADMIN];
  }
  return [role];
}
