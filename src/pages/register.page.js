// Register Page Controller — toggle Candidato / Empresa
import { authService } from "@services/auth.service";
import { config } from "@core/config";
import { getDashboardRouteForRoles } from "@core/roles";
import {
  bindPasswordToggle,
  createSubmitStateController,
  setFormError,
} from "@utils/auth-form";
import {
  getAuthUiContext,
  renderAuthErrorBlock,
  renderAuthShell,
  resolveRequestErrorMessage,
  showLoading,
  renderNavbar,
  renderPage,
} from "@utils/ui.js";

const COMPANY_SIZE_OPTIONS = [
  { value: "", label: "Tamaño de la empresa (opcional)" },
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "501-1000", label: "501-1000" },
  { value: "1000+", label: "1000+" },
];

let currentMode = "candidate";

export async function initRegisterPage(params, query) {
  const { isAuthenticated, roles } = getAuthUiContext();
  if (isAuthenticated) {
    window.location.hash = `#${getDashboardRouteForRoles(roles, config.ROUTES.VACANCIES)}`;
    return;
  }

  currentMode = "candidate";
  showLoading("Cargando...");
  renderRegisterPage();
  initRegisterEvents();
}

function renderToggle() {
  return `
    <div class="auth-toggle" role="tablist" aria-label="Tipo de cuenta">
      <button type="button" class="auth-toggle__btn ${currentMode === "candidate" ? "auth-toggle__btn--active" : ""}" data-mode="candidate" role="tab" aria-selected="${currentMode === "candidate"}">Candidato</button>
      <button type="button" class="auth-toggle__btn ${currentMode === "company" ? "auth-toggle__btn--active" : ""}" data-mode="company" role="tab" aria-selected="${currentMode === "company"}">Empresa</button>
    </div>
  `;
}

function renderCandidateFields() {
  return `
    <div class="auth-form__row">
      <div class="auth-field">
        <label class="sr-only" for="register-firstname">Nombre</label>
        <input type="text" id="register-firstname" class="auth-input" placeholder="Nombre" autocomplete="given-name" required />
      </div>
      <div class="auth-field">
        <label class="sr-only" for="register-lastname">Apellido</label>
        <input type="text" id="register-lastname" class="auth-input" placeholder="Apellido" autocomplete="family-name" required />
      </div>
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-email">Correo electrónico</label>
      <input type="email" id="register-email" class="auth-input" placeholder="Correo electrónico" autocomplete="email" required />
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-phone">Teléfono (opcional)</label>
      <input type="tel" id="register-phone" class="auth-input" placeholder="Teléfono (opcional)" autocomplete="tel" />
    </div>

    <div class="auth-field auth-field--password">
      <label class="sr-only" for="register-password">Contraseña</label>
      <input type="password" id="register-password" class="auth-input" placeholder="Contraseña (mín. 8 caracteres)" autocomplete="new-password" required minlength="8" />
      <button type="button" class="auth-password-toggle" id="toggle-password" aria-label="Mostrar contraseña" aria-pressed="false">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-confirm-password">Confirmar contraseña</label>
      <input type="password" id="register-confirm-password" class="auth-input" placeholder="Confirmar contraseña" autocomplete="new-password" required />
    </div>
  `;
}

function renderCompanyFields() {
  const sizeOptions = COMPANY_SIZE_OPTIONS.map(
    (opt) =>
      `<option value="${opt.value}"${opt.value === "" ? " selected" : ""}>${opt.label}</option>`,
  ).join("");

  return `
    <div class="auth-form__section-title">Datos personales</div>

    <div class="auth-form__row">
      <div class="auth-field">
        <label class="sr-only" for="register-firstname">Nombre</label>
        <input type="text" id="register-firstname" class="auth-input" placeholder="Nombre" autocomplete="given-name" required />
      </div>
      <div class="auth-field">
        <label class="sr-only" for="register-lastname">Apellido</label>
        <input type="text" id="register-lastname" class="auth-input" placeholder="Apellido" autocomplete="family-name" required />
      </div>
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-email">Correo corporativo</label>
      <input type="email" id="register-email" class="auth-input" placeholder="Correo corporativo" autocomplete="email" required />
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-phone">Teléfono (opcional)</label>
      <input type="tel" id="register-phone" class="auth-input" placeholder="Teléfono (opcional)" autocomplete="tel" />
    </div>

    <div class="auth-field auth-field--password">
      <label class="sr-only" for="register-password">Contraseña</label>
      <input type="password" id="register-password" class="auth-input" placeholder="Contraseña (mín. 8 caracteres)" autocomplete="new-password" required minlength="8" />
      <button type="button" class="auth-password-toggle" id="toggle-password" aria-label="Mostrar contraseña" aria-pressed="false">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-confirm-password">Confirmar contraseña</label>
      <input type="password" id="register-confirm-password" class="auth-input" placeholder="Confirmar contraseña" autocomplete="new-password" required />
    </div>

    <div class="auth-form__section-title">Datos de la empresa</div>

    <div class="auth-field">
      <label class="sr-only" for="register-company-name">Nombre de la empresa</label>
      <input type="text" id="register-company-name" class="auth-input" placeholder="Nombre de la empresa" required maxlength="200" />
    </div>

    <div class="auth-form__row">
      <div class="auth-field">
        <label class="sr-only" for="register-company-industry">Industria</label>
        <input type="text" id="register-company-industry" class="auth-input" placeholder="Industria (ej: Tecnología)" maxlength="100" />
      </div>
      <div class="auth-field">
        <label class="sr-only" for="register-company-size">Tamaño</label>
        <select id="register-company-size" class="auth-input">${sizeOptions}</select>
      </div>
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-company-website">Website (opcional)</label>
      <input type="url" id="register-company-website" class="auth-input" placeholder="https://tu-empresa.com (opcional)" maxlength="500" />
    </div>

    <div class="auth-field">
      <label class="sr-only" for="register-company-description">Descripción breve</label>
      <textarea id="register-company-description" class="auth-input auth-input--textarea" rows="3" placeholder="Descripción breve de la empresa (opcional)" maxlength="5000"></textarea>
    </div>
  `;
}

function renderRegisterPage() {
  const navbar = renderNavbar({ activeRoute: "" });

  const form = `
    <form class="auth-form" id="register-form" novalidate>
      ${renderAuthErrorBlock("register-error")}

      ${renderToggle()}

      <div class="auth-form__fields" id="register-fields">
        ${currentMode === "company" ? renderCompanyFields() : renderCandidateFields()}

        <label class="auth-checkbox" for="accept-terms">
          <input type="checkbox" id="accept-terms" class="auth-checkbox__input" required />
          <span class="auth-checkbox__label">Acepto los <a href="#" class="auth-card__subtitle-link">Términos y Condiciones</a></span>
        </label>
      </div>

      <button type="submit" class="btn btn--primary btn--full-width auth-submit" id="register-btn">
        Crear Cuenta
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </form>
  `;

  const subtitle =
    currentMode === "company"
      ? 'Registra tu empresa y empieza a publicar vacantes. ¿Ya tienes cuenta? <a href="#/login" class="auth-card__subtitle-link">Iniciar Sesión</a>'
      : 'Regístrate para postular a vacantes y dar visibilidad a tu perfil. ¿Ya tienes cuenta? <a href="#/login" class="auth-card__subtitle-link">Iniciar Sesión</a>';

  const mainContent = renderAuthShell({
    variant: "register",
    cardClass: "auth-card--register",
    eyebrow: currentMode === "company" ? "Nueva Empresa" : "Nuevo Perfil",
    title: "Crear Cuenta",
    subtitle,
    form,
    footer:
      currentMode === "company"
        ? "Al crear la cuenta serás el owner de la empresa. Podrás completar datos e invitar reclutadores luego."
        : "Solo pedimos la información mínima para crear tu cuenta de candidato.",
  });

  document.getElementById("app").innerHTML = renderPage({
    navbar,
    main: mainContent,
  });
}

function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;
  renderRegisterPage();
  initRegisterEvents();
}

function initRegisterEvents() {
  const form = document.getElementById("register-form");
  const passwordInput = document.getElementById("register-password");
  const confirmPasswordInput = document.getElementById(
    "register-confirm-password",
  );
  const submitBtn = document.getElementById("register-btn");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const errorDiv = document.getElementById("register-error");

  document.querySelectorAll(".auth-toggle__btn").forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
  });

  const controls = [
    document.getElementById("register-firstname"),
    document.getElementById("register-lastname"),
    document.getElementById("register-email"),
    document.getElementById("register-phone"),
    passwordInput,
    confirmPasswordInput,
    document.getElementById("accept-terms"),
  ];

  if (currentMode === "company") {
    controls.push(
      document.getElementById("register-company-name"),
      document.getElementById("register-company-industry"),
      document.getElementById("register-company-size"),
      document.getElementById("register-company-website"),
      document.getElementById("register-company-description"),
    );
  }

  const setSubmitting = createSubmitStateController({
    submitButton: submitBtn,
    controls: controls.filter(Boolean),
    loadingHtml: '<span class="auth-spinner"></span> Creando cuenta...',
  });

  bindPasswordToggle(togglePasswordBtn, passwordInput);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("register-firstname").value.trim();
    const lastName = document.getElementById("register-lastname").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const password = passwordInput.value;
    const confirm = confirmPasswordInput.value;

    if (password !== confirm) {
      setFormError(errorDiv, "Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setFormError(errorDiv, "La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setSubmitting(true);
    setFormError(errorDiv);

    try {
      if (currentMode === "company") {
        const companyName = document
          .getElementById("register-company-name")
          .value.trim();
        if (!companyName) {
          setFormError(errorDiv, "El nombre de la empresa es obligatorio.");
          setSubmitting(false);
          return;
        }

        const website = document
          .getElementById("register-company-website")
          .value.trim();

        await authService.registerCompany({
          email,
          password,
          firstName,
          lastName,
          ...(phone ? { phone } : {}),
          companyName,
          industry:
            document.getElementById("register-company-industry").value.trim() ||
            undefined,
          companySize:
            document.getElementById("register-company-size").value || undefined,
          ...(website ? { website } : {}),
          companyDescription:
            document
              .getElementById("register-company-description")
              .value.trim() || undefined,
        });
      } else {
        await authService.registerCandidate({
          email,
          password,
          firstName,
          lastName,
          ...(phone ? { phone } : {}),
        });
      }

      const { roles } = getAuthUiContext();
      window.location.hash = `#${getDashboardRouteForRoles(roles, config.ROUTES.VACANCIES)}`;
    } catch (error) {
      console.error("Register error:", error);
      const message = resolveRequestErrorMessage(
        error,
        "Error al crear la cuenta.",
      );
      setFormError(errorDiv, message);
      setSubmitting(false);
    }
  });
}
