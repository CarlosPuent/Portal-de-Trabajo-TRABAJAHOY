import { config } from "@core/config";
import { authService } from "@services/auth.service";
import { vacancyService } from "@services/vacancy.service";
import {
  getAuthUiContext,
  renderNavbar,
  renderPage,
  renderRoleShell,
  resolveRequestErrorMessage,
  showLoading,
} from "@utils/ui";

const VACANCY_TYPES = [
  { value: "full-time", label: "Tiempo completo" },
  { value: "part-time", label: "Medio tiempo" },
  { value: "contract", label: "Contrato" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Prácticas" },
];

const VACANCY_MODALITIES = [
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
  { value: "onsite", label: "Presencial" },
];

const VACANCY_LEVELS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
];

const VACANCY_STATUSES = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
  { value: "closed", label: "Cerrada" },
  { value: "archived", label: "Archivada" },
];

function normalizeArray(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.items)) return input.items;
  return [];
}

function getOptionValues(options = []) {
  return options.map((item) => item.value);
}

async function resolveCategoryOptions() {
  try {
    const categoriesResponse = await vacancyService.getCategories();
    const categories = normalizeArray(categoriesResponse);
    return categories
      .map((category) => {
        const id = String(category?.id || category?.categoryId || "").trim();
        const name = String(category?.name || category?.title || "").trim();
        if (!id || !name) return null;
        return { id, label: name };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("No se pudieron cargar las categorías:", error);
    return [];
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(String(value || ""));
}

function formatIsoDateForInput(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toISOString().split("T")[0];
  } catch {
    return String(isoString).split("T")[0]; // Fallback
  }
}

function parseOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getEditVacancyHTML(authContext, options = {}) {
  const { isAuthenticated, user, roles, primaryRole } = authContext;
  const {
    vacancy = {},
    categoryOptions = [],
  } = options;

  const navbar = renderNavbar({
    activeRoute: config.ROUTES.EDIT_VACANCY,
    isAuthenticated,
    user,
    roles,
    primaryRole,
  });

  const categoryFieldHtml = `
    <div class="vacancy-field">
      <label for="vacancy-category-id">Categoría</label>
      <select id="vacancy-category-id" name="categoryId">
        <option value="">Sin categoría</option>
        ${categoryOptions.map(cat => 
          `<option value="${cat.id}" ${vacancy.categoryId === cat.id ? "selected" : ""}>${cat.label}</option>`
        ).join("")}
      </select>
    </div>
  `;

  const content = `
    <form class="vacancy-edit-form" id="edit-vacancy-form" novalidate>
      <p class="th-feedback th-feedback--error" id="edit-vacancy-error" style="display:none;"></p>
      <p class="th-feedback th-feedback--success" id="edit-vacancy-success" style="display:none;"></p>

      <div class="vacancy-edit-grid">
        <div class="vacancy-field vacancy-field--full">
          <label>Empresa de la Vacante</label>
          <div class="vacancy-field__info">${vacancy.companyName || (vacancy.company?.name) || 'Empresa (Sólo lectura)'}</div>
          <small>La empresa no se puede cambiar después de creadra la vacante.</small>
        </div>

        <div class="vacancy-field">
          <label for="vacancy-status">Estado *</label>
          <select id="vacancy-status" name="status" required>
            ${VACANCY_STATUSES.map((status) => 
              `<option value="${status.value}" ${vacancy.status === status.value ? "selected" : ""}>${status.label}</option>`
            ).join("")}
          </select>
        </div>

        <div class="vacancy-field vacancy-field--full">
          <label for="vacancy-title">Título *</label>
          <input id="vacancy-title" name="title" type="text" required maxlength="160" value="${vacancy.title || ''}" />
        </div>

        <div class="vacancy-field vacancy-field--full">
          <label for="vacancy-description">Descripción *</label>
          <textarea id="vacancy-description" name="description" rows="5" required>${vacancy.description || ''}</textarea>
        </div>

        <div class="vacancy-field vacancy-field--full">
          <label for="vacancy-requirements">Requisitos *</label>
          <textarea id="vacancy-requirements" name="requirements" rows="4" required>${vacancy.requirements || ''}</textarea>
        </div>

        <div class="vacancy-field">
          <label for="vacancy-country">País *</label>
          <input id="vacancy-country" name="country" type="text" required maxlength="120" value="${vacancy.country || ''}" />
        </div>

        <div class="vacancy-field">
          <label for="vacancy-city">Ciudad *</label>
          <input id="vacancy-city" name="city" type="text" required maxlength="120" value="${vacancy.city || ''}" />
        </div>

        ${categoryFieldHtml}

        <div class="vacancy-field">
          <label for="vacancy-modality">Modalidad</label>
          <select id="vacancy-modality" name="modality">
            <option value="">(sin definir)</option>
            ${VACANCY_MODALITIES.map((item) => `<option value="${item.value}" ${vacancy.modality === item.value ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
        </div>

        <div class="vacancy-field">
          <label for="vacancy-level">Nivel</label>
          <select id="vacancy-level" name="level">
            <option value="">(sin definir)</option>
            ${VACANCY_LEVELS.map((item) => `<option value="${item.value}" ${vacancy.level === item.value ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
        </div>

        <div class="vacancy-field">
          <label for="vacancy-type">Tipo</label>
          <select id="vacancy-type" name="type">
            <option value="">(sin definir)</option>
            ${VACANCY_TYPES.map((item) => `<option value="${item.value}" ${vacancy.type === item.value ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
        </div>

        <div class="vacancy-field">
          <label for="vacancy-salary-min">Salario mínimo</label>
          <input id="vacancy-salary-min" name="salaryMin" type="number" min="0" step="1" value="${vacancy.salaryMin || ''}" />
        </div>

        <div class="vacancy-field">
          <label for="vacancy-salary-max">Salario máximo</label>
          <input id="vacancy-salary-max" name="salaryMax" type="number" min="0" step="1" value="${vacancy.salaryMax || ''}" />
        </div>

        <div class="vacancy-field">
          <label for="vacancy-application-deadline">Fecha límite</label>
          <input id="vacancy-application-deadline" name="applicationDeadline" type="date" value="${formatIsoDateForInput(vacancy.applicationDeadline)}" />
        </div>

        <div class="vacancy-field">
          <label for="vacancy-openings">Vacantes</label>
          <input id="vacancy-openings" name="openings" type="number" min="1" step="1" value="${vacancy.openings || ''}" />
        </div>
      </div>

      <div class="vacancy-edit-actions">
        <button type="submit" class="btn btn--primary" id="edit-vacancy-submit">Guardar cambios</button>
        <a href="#${config.ROUTES.COMPANY_DASHBOARD}" class="btn btn--outline">Cancelar</a>
      </div>
    </form>
  `;

  const shell = renderRoleShell({
    title: "Editar vacante",
    subtitle: "Actualiza la información de tu vacante.",
    roles,
    primaryRole,
    content,
    actions: `<a href="#${config.ROUTES.COMPANY_DASHBOARD}" class="btn btn--outline btn--sm">Volver al panel</a>`,
    shellClass: "vacancy-edit-shell",
  });

  const extraStyles = `
    .vacancy-edit-page { min-height: calc(100vh - 70px); background: #f8fafc; padding: 28px 0; }
    .vacancy-edit-shell .role-shell__content { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .vacancy-edit-form { display: flex; flex-direction: column; gap: 14px; }
    .vacancy-edit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .vacancy-field { display: flex; flex-direction: column; gap: 6px; }
    .vacancy-field--full { grid-column: 1 / -1; }
    .vacancy-field label { font-size: 13px; font-weight: 600; color: #0f172a; }
    .vacancy-field input, .vacancy-field select, .vacancy-field textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px; font: inherit; background: #fff; color: #0f172a; }
    .vacancy-field textarea { resize: vertical; min-height: 120px; }
    .vacancy-field input:focus, .vacancy-field select:focus, .vacancy-field textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14); }
    .vacancy-field small { font-size: 12px; color: #475569; }
    .vacancy-field__info { border: 1px solid #cbd5e1; border-radius: 10px; min-height: 42px; display: flex; align-items: center; padding: 10px 12px; background: #f8fafc; color: #0f172a; font-size: 14px; font-weight: 500; }
    .vacancy-edit-actions { display: flex; justify-content: flex-start; gap: 10px; margin-top: 8px; }
    .vacancy-edit-form.is-submitting { opacity: 0.82; pointer-events: none; }
    @media (max-width: 900px) { .vacancy-edit-grid { grid-template-columns: 1fr; } }
  `;

  return renderPage({ navbar, main: `<div class="container">${shell}</div>`, pageClass: "vacancy-edit-page", extraStyles });
}

function validateEditVacancyForm(formData, vacancy) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requirements = String(formData.get("requirements") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!title || !description || !requirements || !country || !city) {
    throw new Error("Completa todos los campos obligatorios.");
  }

  if (!getOptionValues(VACANCY_STATUSES).includes(status)) {
    throw new Error("El estado seleccionado no es válido.");
  }

  const salaryMin = parseOptionalNumber(formData.get("salaryMin"));
  const salaryMax = parseOptionalNumber(formData.get("salaryMax"));

  if (salaryMin !== null && (Number.isNaN(salaryMin) || salaryMin < 0)) throw new Error("salaryMin debe ser un número mayor o igual a 0.");
  if (salaryMax !== null && (Number.isNaN(salaryMax) || salaryMax < 0)) throw new Error("salaryMax debe ser un número mayor o igual a 0.");
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) throw new Error("salaryMax debe ser mayor o igual que salaryMin.");

  const openingsRaw = formData.get("openings");
  const openings = parseOptionalNumber(openingsRaw);
  if (openingsRaw !== "" && openings !== null && (Number.isNaN(openings) || !Number.isInteger(openings) || openings < 1)) {
    throw new Error("openings debe ser un entero mayor o igual a 1.");
  }

  const applicationDeadline = String(formData.get("applicationDeadline") || "").trim();
  
  const type = String(formData.get("type") || "").trim();
  const modality = String(formData.get("modality") || "").trim();
  const level = String(formData.get("level") || "").trim();

  if (type && !getOptionValues(VACANCY_TYPES).includes(type)) throw new Error("type tiene un valor no permitido.");
  if (modality && !getOptionValues(VACANCY_MODALITIES).includes(modality)) throw new Error("modality tiene un valor no permitido.");
  if (level && !getOptionValues(VACANCY_LEVELS).includes(level)) throw new Error("level tiene un valor no permitido.");

  const payload = { title, description, requirements, country, city, status };

  const categoryId = String(formData.get("categoryId") || "").trim();
  if (categoryId || vacancy.categoryId) payload.categoryId = categoryId || null;
  
  if (type || vacancy.type) payload.type = type || null;
  if (modality || vacancy.modality) payload.modality = modality || null;
  if (level || vacancy.level) payload.level = level || null;
  if (salaryMin !== null || vacancy.salaryMin !== null) payload.salaryMin = salaryMin;
  if (salaryMax !== null || vacancy.salaryMax !== null) payload.salaryMax = salaryMax;
  if (applicationDeadline || vacancy.applicationDeadline) payload.applicationDeadline = applicationDeadline ? applicationDeadline : null;
  if (openings !== null || vacancy.openings !== null) payload.openings = openings;

  return payload;
}

function setFeedback(errorEl, successEl, { error = "", success = "" } = {}) {
  if (errorEl) { errorEl.textContent = error; errorEl.style.display = error ? "block" : "none"; }
  if (successEl) { successEl.textContent = success; successEl.style.display = success ? "block" : "none"; }
}

function setSubmitting(form, submitBtn, isSubmitting) {
  if (form) form.classList.toggle("is-submitting", isSubmitting);
  if (submitBtn) {
    submitBtn.disabled = isSubmitting;
    submitBtn.setAttribute("aria-busy", String(isSubmitting));
    submitBtn.textContent = isSubmitting ? "Guardando..." : "Guardar cambios";
  }
}

export async function initEditVacancyPage(vacancyId) {
  const app = document.getElementById("app");
  const authContext = getAuthUiContext();

  showLoading("Cargando vacante...");

  try {
    const [vacancyData, categoryOptions] = await Promise.all([
      vacancyService.getVacancyById(vacancyId), // or getVacancyManage if you want to auth restrict more thoroughly but getVacancyById is fine
      resolveCategoryOptions(),
    ]);

    const vacancy = vacancyData?.data || vacancyData;

    if (!vacancy || !vacancy.id) {
      app.innerHTML = `<div class="container" style="padding: 40px 0; text-align: center;"><h2>Vacante no encontrada</h2></div>`;
      return;
    }

    app.innerHTML = getEditVacancyHTML(authContext, { vacancy, categoryOptions });

    const form = document.getElementById("edit-vacancy-form");
    const submitBtn = document.getElementById("edit-vacancy-submit");
    const errorEl = document.getElementById("edit-vacancy-error");
    const successEl = document.getElementById("edit-vacancy-success");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setFeedback(errorEl, successEl);

      const formData = new FormData(form);

      let payload;
      try {
        payload = validateEditVacancyForm(formData, vacancy);
      } catch (error) {
        setFeedback(errorEl, successEl, { error: error.message });
        return;
      }

      setSubmitting(form, submitBtn, true);

      try {
        await vacancyService.updateVacancy(vacancy.id, payload);
        setFeedback(errorEl, successEl, { success: "Cambios guardados correctamente." });
        setTimeout(() => { window.location.hash = `#${config.ROUTES.COMPANY_DASHBOARD}`; }, 1200);
      } catch (error) {
        setFeedback(errorEl, successEl, { error: resolveRequestErrorMessage(error, "No se pudo actualizar la vacante.") });
        setSubmitting(form, submitBtn, false);
      }
    });
  } catch (error) {
    console.error("Error loading for edit:", error);
    app.innerHTML = `<div class="container" style="padding: 40px 0; text-align: center;"><h2>Error al cargar la vacante</h2></div>`;
  }
}
