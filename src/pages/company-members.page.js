// Company Members Management Page
import { companyService } from '@services/company.service';
import { adminService } from '@services/admin.service';
import { authService } from '@services/auth.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { building, alertTriangle } from '@utils/icons.js';

const ROLES = ['owner', 'company_admin', 'member', 'recruiter'];

const ROLE_CONFIG = {
  owner: { label: 'Propietario', color: '#d97706', bg: '#fef3c7' },
  company_admin: { label: 'Administrador', color: '#7c3aed', bg: '#ede9fe' },
  recruiter: { label: 'Reclutador', color: '#2563eb', bg: '#dbeafe' },
  member: { label: 'Miembro', color: '#059669', bg: '#d1fae5' },
};

function getRoleBadge(role) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: '#6b7280', bg: '#f3f4f6' };
  return `<span class="mem-badge" style="color:${cfg.color};background:${cfg.bg}">${cfg.label}</span>`;
}

function getInitials(member) {
  const first = member?.user?.firstName || '';
  const last = member?.user?.lastName || '';
  if (first || last) return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
  return '?';
}

function getFullName(member) {
  const first = member?.user?.firstName || '';
  const last = member?.user?.lastName || '';
  return `${first} ${last}`.trim() || `Usuario #${member.userId}`;
}

function getAvatarColor(role) {
  const colors = {
    owner: 'linear-gradient(135deg,#f59e0b,#d97706)',
    company_admin: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    recruiter: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    member: 'linear-gradient(135deg,#10b981,#059669)',
  };
  return colors[role] || 'linear-gradient(135deg,#6b7280,#4b5563)';
}

/** Extract companyId from any known field shape the backend might return. */
function resolveUserCompanyId(user) {
  if (!user) return null;
  const id =
    user.companyId ||
    user.company_id ||
    user.company?.id ||
    user.company?.companyId ||
    user.ownedCompany?.[0]?.id ||
    user.recruiterProfile?.companyId ||
    user.recruiter_profile?.company_id ||
    user.recruiter?.companyId ||
    user.membership?.companyId ||
    user.companyMembership?.companyId ||
    user.companyMembers?.[0]?.companyId ||
    user.companyMembers?.[0]?.company?.id ||
    user.companyMemberships?.[0]?.companyId ||
    user.companyMemberships?.[0]?.company?.id ||
    user.memberships?.[0]?.companyId ||
    user.memberships?.[0]?.company?.id ||
    '';
  return String(id).trim() || null;
}

export async function initCompanyMembersPage(params, query) {
  let user = store.get('user');
  const isAuthenticated = store.get('isAuthenticated');

  showLoading('Cargando miembros...');

  try {
    let userCompanyId = resolveUserCompanyId(user);

    if (!userCompanyId) {
      try {
        const profileData = await authService.fetchCurrentUserProfile();
        user = store.get('user');
        userCompanyId = resolveUserCompanyId(profileData?.user || user);
      } catch (e) {
        console.warn('No se pudo refrescar el perfil del usuario:', e);
      }
    }

    let company = null;
    if (userCompanyId) {
      const raw = await companyService.getCompanyById(userCompanyId).catch(() => null);
      company = raw?.data || raw || null;
    }

    let members = [];
    if (company) {
      const memData = await companyService.getMembers(company.id).catch(() => []);
      members = Array.isArray(memData) ? memData : (memData?.data || []);
    }

    render(company, members, isAuthenticated, user);
    bindEvents(company, members);
  } catch (err) {
    console.error('Error loading members:', err);
    render(null, [], isAuthenticated, user);
    bindEvents(null, []);
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render(company, members, isAuthenticated, user) {
  const app = document.getElementById('app');
  const navbar = renderNavbar({ activeRoute: '', isAuthenticated, user });

  if (!company) {
    const main = `
      <div class="mem-container">
        <div class="mem-empty-state">
          <div class="mem-empty-state__icon">${building}</div>
          <h2>Sin empresa asociada</h2>
          <p>Necesitas tener una empresa registrada para gestionar miembros.</p>
          <a href="#/company/profile/edit" class="mem-btn mem-btn--primary">Registrar empresa</a>
        </div>
      </div>`;
    app.innerHTML = renderPage({ navbar, main, pageClass: 'mem-page', extraStyles: getStyles() });
    return;
  }

  const ownerCount = members.filter(m => m.role === 'owner').length;
  const adminCount = members.filter(m => m.role === 'company_admin').length;
  const memberCount = members.filter(m => !['owner', 'company_admin'].includes(m.role)).length;

  const main = `
    <div class="mem-container">
      <!-- Header -->
      <div class="mem-header">
        <div class="mem-header__left">
          <a href="#/company/profile" class="mem-back">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver al perfil
          </a>
          <div class="mem-header__title-row">
            <h1 class="mem-title">Gestión de Miembros</h1>
            <span class="mem-company-tag">${company.name || 'Mi Empresa'}</span>
          </div>
          <p class="mem-subtitle">Administra quién forma parte de tu organización y sus roles.</p>
        </div>
        <button id="open-add-modal" class="mem-btn mem-btn--primary">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar miembro
        </button>
      </div>

      <!-- Stats -->
      <div class="mem-stats">
        <div class="mem-stat">
          <div class="mem-stat__num">${members.length}</div>
          <div class="mem-stat__label">Total miembros</div>
        </div>
        <div class="mem-stat mem-stat--amber">
          <div class="mem-stat__num">${ownerCount}</div>
          <div class="mem-stat__label">Propietarios</div>
        </div>
        <div class="mem-stat mem-stat--purple">
          <div class="mem-stat__num">${adminCount}</div>
          <div class="mem-stat__label">Administradores</div>
        </div>
        <div class="mem-stat mem-stat--green">
          <div class="mem-stat__num">${memberCount}</div>
          <div class="mem-stat__label">Miembros / Reclutadores</div>
        </div>
      </div>

      <!-- Search -->
      <div class="mem-toolbar">
        <div class="mem-search-wrap">
          <svg class="mem-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input id="mem-search" class="mem-search" type="text" placeholder="Buscar por nombre, email o rol..." />
        </div>
        <select id="mem-filter-role" class="mem-select">
          <option value="">Todos los roles</option>
          ${ROLES.map(r => `<option value="${r}">${ROLE_CONFIG[r]?.label || r}</option>`).join('')}
        </select>
      </div>

      <!-- Members List -->
      <div id="mem-list" class="mem-list">
        ${members.length === 0
          ? `<div class="mem-empty">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>No hay miembros en esta empresa.</p>
              <button class="mem-btn mem-btn--outline" id="empty-add-btn">Agregar el primer miembro</button>
            </div>`
          : renderMemberCards(members)
        }
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div id="mem-modal" class="mem-modal-overlay mem-modal--hidden" role="dialog" aria-modal="true">
      <div class="mem-modal">
        <div class="mem-modal__header">
          <h2 id="modal-title" class="mem-modal__title">Agregar miembro</h2>
          <button id="close-modal" class="mem-modal__close" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form id="mem-form" class="mem-form">
          <input type="hidden" id="form-mem-id" value="" />
          <div id="user-id-field" class="mem-form__field">
            <label class="mem-form__label" for="form-email-search">
              Buscar usuario por correo <span class="mem-form__required">*</span>
            </label>
            <!-- Combobox wrapper -->
            <div class="mem-combobox" id="combobox-wrap">
              <!-- Selected user chip (shown after selection) -->
              <div id="selected-user-chip" class="mem-chip mem-chip--hidden">
                <div class="mem-chip__avatar" id="chip-avatar"></div>
                <div class="mem-chip__info">
                  <span id="chip-name" class="mem-chip__name"></span>
                  <span id="chip-email" class="mem-chip__email"></span>
                </div>
                <button type="button" id="clear-user-btn" class="mem-chip__clear" title="Cambiar usuario">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <!-- Search input (hidden after selection) -->
              <div id="email-search-wrap" class="mem-combobox__input-wrap">
                <svg class="mem-combobox__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" id="form-email-search" class="mem-form__input mem-combobox__input" placeholder="Escribe un correo electrónico..." autocomplete="off" />
              </div>
              <!-- Dropdown list -->
              <div id="user-dropdown" class="mem-dropdown mem-dropdown--hidden">
                <div id="user-dropdown-list" class="mem-dropdown__list"></div>
              </div>
            </div>
            <!-- Hidden actual userId -->
            <input type="hidden" id="form-user-id" value="" />
          </div>
          <div class="mem-form__field">
            <label class="mem-form__label" for="form-role">
              Rol <span class="mem-form__required">*</span>
            </label>
            <select id="form-role" class="mem-form__input" required>
              <option value="">Seleccionar rol...</option>
              ${ROLES.map(r => `<option value="${r}">${ROLE_CONFIG[r]?.label || r}</option>`).join('')}
            </select>
          </div>
          <div id="mem-form-error" class="mem-form__error mem-form__error--hidden"></div>
          <div class="mem-form__actions">
            <button type="button" id="cancel-modal" class="mem-btn mem-btn--ghost">Cancelar</button>
            <button type="submit" id="submit-btn" class="mem-btn mem-btn--primary">
              <span id="submit-label">Agregar miembro</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div id="confirm-modal" class="mem-modal-overlay mem-modal--hidden" role="dialog" aria-modal="true">
      <div class="mem-modal mem-modal--sm">
        <div class="mem-modal__header">
          <h2 class="mem-modal__title">Confirmar eliminación</h2>
          <button id="close-confirm" class="mem-modal__close" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="mem-confirm__body">
          <div class="mem-confirm__icon">${alertTriangle}</div>
          <p id="confirm-text" class="mem-confirm__text">¿Estás seguro de que deseas eliminar a este miembro?</p>
          <p class="mem-confirm__hint">Esta acción no se puede deshacer.</p>
        </div>
        <div class="mem-form__actions">
          <button type="button" id="cancel-confirm" class="mem-btn mem-btn--ghost">Cancelar</button>
          <button type="button" id="confirm-delete-btn" class="mem-btn mem-btn--danger">Eliminar miembro</button>
        </div>
      </div>
    </div>
  `;

  app.innerHTML = renderPage({ navbar, main, pageClass: 'mem-page', extraStyles: getStyles() });
}

function renderMemberCards(members) {
  return members.map(m => `
    <div class="mem-card" data-member-id="${m.id}" data-user-id="${m.userId}" data-role="${m.role}">
      <div class="mem-card__avatar" style="background:${getAvatarColor(m.role)}">${getInitials(m)}</div>
      <div class="mem-card__info">
        <div class="mem-card__name">${getFullName(m)}</div>
        ${m.user?.email ? `<div class="mem-card__email">${m.user.email}</div>` : ''}
        <div class="mem-card__meta">
          ${getRoleBadge(m.role)}
          ${m.user?.username ? `<span class="mem-card__username">@${m.user.username}</span>` : ''}
        </div>
      </div>
      <div class="mem-card__actions">
        <button class="mem-action-btn mem-action-btn--edit" data-member-id="${m.id}" data-user-id="${m.userId}" data-role="${m.role}" title="Cambiar rol">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="mem-action-btn mem-action-btn--delete" data-member-id="${m.id}" data-name="${getFullName(m)}" title="Eliminar miembro">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// ─── Events ───────────────────────────────────────────────────────────────────

function bindEvents(company, members) {
  const app = document.getElementById('app');
  let pendingDeleteId = null;
  let allUsers = [];        // cached user list for autocomplete
  let usersLoaded = false;  // avoid re-fetching every time modal opens

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error(e); }
    });
  }

  if (!company) return;

  // ── Refresh list ────────────────────────────────────────────────────────────
  async function refreshList(filterText = '', filterRole = '') {
    try {
      const memData = await companyService.getMembers(company.id).catch(() => []);
      members = Array.isArray(memData) ? memData : (memData?.data || []);
      applyFilter(filterText, filterRole, members);
    } catch (e) {
      console.error('Error refreshing members:', e);
    }
  }

  function applyFilter(text, role, source) {
    const filtered = source.filter(m => {
      const name = getFullName(m).toLowerCase();
      const email = (m.user?.email || '').toLowerCase();
      const q = text.toLowerCase();
      const matchText = !q || name.includes(q) || email.includes(q) || m.role.includes(q);
      const matchRole = !role || m.role === role;
      return matchText && matchRole;
    });

    const list = document.getElementById('mem-list');
    if (!list) return;
    list.innerHTML = filtered.length === 0
      ? `<div class="mem-empty"><p>No se encontraron miembros con esos criterios.</p></div>`
      : renderMemberCards(filtered);
  }

  // Search + filter bar
  const searchInput = document.getElementById('mem-search');
  const roleFilter = document.getElementById('mem-filter-role');
  function onFilter() {
    applyFilter(searchInput?.value || '', roleFilter?.value || '', members);
  }
  searchInput?.addEventListener('input', onFilter);
  roleFilter?.addEventListener('change', onFilter);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const modal = document.getElementById('mem-modal');
  const confirmModal = document.getElementById('confirm-modal');

  function resetUserSelection() {
    document.getElementById('form-user-id').value = '';
    document.getElementById('form-email-search').value = '';
    document.getElementById('selected-user-chip').classList.add('mem-chip--hidden');
    document.getElementById('email-search-wrap').style.display = '';
    hideDropdown();
  }

  function selectUser(user) {
    document.getElementById('form-user-id').value = user.id;
    document.getElementById('chip-name').textContent =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    document.getElementById('chip-email').textContent = user.email;
    const initials = ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || user.email[0].toUpperCase();
    document.getElementById('chip-avatar').textContent = initials;
    document.getElementById('selected-user-chip').classList.remove('mem-chip--hidden');
    document.getElementById('email-search-wrap').style.display = 'none';
    hideDropdown();
    hideFormError();
  }

  function showDropdown(html) {
    const list = document.getElementById('user-dropdown-list');
    const dropdown = document.getElementById('user-dropdown');
    list.innerHTML = html;
    dropdown.classList.remove('mem-dropdown--hidden');
  }

  function hideDropdown() {
    document.getElementById('user-dropdown')?.classList.add('mem-dropdown--hidden');
  }

  // Load all users once (cached)
  async function ensureUsersLoaded() {
    if (usersLoaded) return;
    try {
      const data = await adminService.getUsers().catch(() => null);
      if (Array.isArray(data)) {
        allUsers = data;
      } else if (Array.isArray(data?.data)) {
        allUsers = data.data;
      }
      usersLoaded = true;
    } catch (e) {
      console.warn('Could not load user list:', e);
    }
  }

  // Email search autocomplete
  let searchTimer = null;
  document.getElementById('form-email-search')?.addEventListener('input', async (e) => {
    const q = e.target.value.trim().toLowerCase();

    clearTimeout(searchTimer);

    if (!q) { hideDropdown(); return; }

    searchTimer = setTimeout(async () => {
      await ensureUsersLoaded();

      const matches = allUsers.filter(u => {
        const email = (u.email || '').toLowerCase();
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        return email.includes(q) || name.includes(q);
      }).slice(0, 8);

      if (matches.length === 0) {
        showDropdown(`<div class="mem-dropdown__empty">No se encontraron usuarios con ese correo.</div>`);
        return;
      }

      const items = matches.map(u => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sin nombre';
        const initials = ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || u.email[0].toUpperCase();
        const alreadyMember = members.some(m => String(m.userId) === String(u.userId || u.id));
        return `
          <button type="button"
            class="mem-dropdown__item${alreadyMember ? ' mem-dropdown__item--disabled' : ''}"
            data-user-id="${u.userId || u.id}"
            data-user-email="${u.email}"
            data-user-fname="${u.firstName || ''}"
            data-user-lname="${u.lastName || ''}"
            ${alreadyMember ? 'disabled title="Ya es miembro"' : ''}>
            <div class="mem-dropdown__avatar">${initials}</div>
            <div class="mem-dropdown__info">
              <span class="mem-dropdown__name">${name}</span>
              <span class="mem-dropdown__email">${u.email}</span>
            </div>
            ${alreadyMember ? '<span class="mem-dropdown__tag">Ya es miembro</span>' : ''}
          </button>`;
      }).join('');

      showDropdown(items);
    }, 250);
  });

  // Select user from dropdown
  document.getElementById('user-dropdown')?.addEventListener('click', e => {
    const item = e.target.closest('.mem-dropdown__item:not([disabled])');
    if (!item) return;
    selectUser({
      id: item.dataset.userId,
      email: item.dataset.userEmail,
      firstName: item.dataset.userFname,
      lastName: item.dataset.userLname,
    });
  });

  // Clear selected user
  document.getElementById('clear-user-btn')?.addEventListener('click', () => {
    resetUserSelection();
    document.getElementById('form-email-search').focus();
  });

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!document.getElementById('combobox-wrap')?.contains(e.target)) {
      hideDropdown();
    }
  });

  function openAddModal() {
    document.getElementById('modal-title').textContent = 'Agregar miembro';
    document.getElementById('submit-label').textContent = 'Agregar miembro';
    document.getElementById('form-mem-id').value = '';
    document.getElementById('form-role').value = '';
    document.getElementById('user-id-field').style.display = '';
    resetUserSelection();
    hideFormError();
    modal.classList.remove('mem-modal--hidden');
    ensureUsersLoaded();
    document.getElementById('form-email-search').focus();
  }

  function openEditModal(memberId, userId, role) {
    document.getElementById('modal-title').textContent = 'Cambiar rol';
    document.getElementById('submit-label').textContent = 'Guardar cambios';
    document.getElementById('form-mem-id').value = memberId;
    document.getElementById('form-user-id').value = userId;
    document.getElementById('form-role').value = role;
    document.getElementById('user-id-field').style.display = 'none';
    hideFormError();
    modal.classList.remove('mem-modal--hidden');
    document.getElementById('form-role').focus();
  }

  function closeModal() {
    modal.classList.add('mem-modal--hidden');
    hideDropdown();
  }

  function openConfirm(memberId, name) {
    pendingDeleteId = memberId;
    document.getElementById('confirm-text').textContent =
      `¿Estás seguro de que deseas eliminar a "${name}" del equipo?`;
    confirmModal.classList.remove('mem-modal--hidden');
  }

  function closeConfirm() {
    pendingDeleteId = null;
    confirmModal.classList.add('mem-modal--hidden');
  }

  function showFormError(msg) {
    const el = document.getElementById('mem-form-error');
    el.textContent = msg;
    el.classList.remove('mem-form__error--hidden');
  }

  function hideFormError() {
    const el = document.getElementById('mem-form-error');
    if (el) el.classList.add('mem-form__error--hidden');
  }

  function setSubmitLoading(loading) {
    const btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = loading;
    const label = document.getElementById('submit-label');
    if (label) label.textContent = loading ? 'Guardando...' : (document.getElementById('form-mem-id').value ? 'Guardar cambios' : 'Agregar miembro');
  }

  // Open/close triggers
  document.getElementById('open-add-modal')?.addEventListener('click', openAddModal);
  document.getElementById('empty-add-btn')?.addEventListener('click', openAddModal);
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-modal')?.addEventListener('click', closeModal);
  document.getElementById('close-confirm')?.addEventListener('click', closeConfirm);
  document.getElementById('cancel-confirm')?.addEventListener('click', closeConfirm);

  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  confirmModal?.addEventListener('click', e => { if (e.target === confirmModal) closeConfirm(); });

  // Delegate edit/delete on list
  app.addEventListener('click', e => {
    const editBtn = e.target.closest('.mem-action-btn--edit');
    const deleteBtn = e.target.closest('.mem-action-btn--delete');

    if (editBtn) {
      const { memberId, userId, role } = editBtn.dataset;
      openEditModal(memberId, userId, role);
    }

    if (deleteBtn) {
      const { memberId, name } = deleteBtn.dataset;
      openConfirm(memberId, name);
    }
  });

  // Form submit (add or edit)
  document.getElementById('mem-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    hideFormError();
    setSubmitLoading(true);

    const memId = document.getElementById('form-mem-id').value;
    const userId = String(document.getElementById('form-user-id').value || '').trim();
    const role = document.getElementById('form-role').value;

    if (!role) {
      showFormError('Por favor selecciona un rol.');
      setSubmitLoading(false);
      return;
    }

    if (!memId) {
      if (!userId) {
        showFormError('Selecciona un usuario de la lista.');
        setSubmitLoading(false);
        return;
      }
    }

    try {
      if (memId) {
        await companyService.updateMember(company.id, memId, { role });
      } else {
        await companyService.addMember(company.id, { userId, role });
      }
      closeModal();
      await refreshList(searchInput?.value || '', roleFilter?.value || '');
      updateStats(members);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al guardar. Inténtalo de nuevo.';
      showFormError(msg);
    } finally {
      setSubmitLoading(false);
    }
  });

  // Confirm delete
  document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    const btn = document.getElementById('confirm-delete-btn');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';
    try {
      await companyService.removeMember(company.id, pendingDeleteId);
      closeConfirm();
      await refreshList(searchInput?.value || '', roleFilter?.value || '');
      updateStats(members);
    } catch (err) {
      console.error('Error removing member:', err);
      alert('No se pudo eliminar al miembro. Inténtalo de nuevo.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Eliminar miembro';
    }
  });
}

function updateStats(members) {
  const ownerCount = members.filter(m => m.role === 'owner').length;
  const adminCount = members.filter(m => m.role === 'company_admin').length;
  const memberCount = members.filter(m => !['owner', 'company_admin'].includes(m.role)).length;

  const stats = document.querySelectorAll('.mem-stat__num');
  if (stats[0]) stats[0].textContent = members.length;
  if (stats[1]) stats[1].textContent = ownerCount;
  if (stats[2]) stats[2].textContent = adminCount;
  if (stats[3]) stats[3].textContent = memberCount;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function getStyles() {
  return `
    .mem-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding-bottom: 60px; }
    .mem-container { max-width: 900px; margin: 0 auto; padding: 32px 24px; }

    /* Header */
    .mem-back { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: #6b7280; text-decoration: none; margin-bottom: 12px; transition: color .15s; }
    .mem-back:hover { color: #111827; }
    .mem-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; }
    .mem-header__title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
    .mem-title { font-size: 26px; font-weight: 700; color: #111827; margin: 0; }
    .mem-company-tag { font-size: 13px; color: #2563eb; background: #dbeafe; padding: 4px 12px; border-radius: 999px; font-weight: 600; }
    .mem-subtitle { font-size: 15px; color: #6b7280; margin: 0; }

    /* Stats */
    .mem-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .mem-stat { background: #fff; border-left: 4px solid #3b82f6; border-radius: 12px; padding: 18px 22px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .mem-stat--amber { border-color: #f59e0b; }
    .mem-stat--purple { border-color: #8b5cf6; }
    .mem-stat--green { border-color: #10b981; }
    .mem-stat__num { font-size: 28px; font-weight: 700; color: #111827; line-height: 1; }
    .mem-stat__label { font-size: 13px; color: #6b7280; margin-top: 4px; }

    /* Toolbar */
    .mem-toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .mem-search-wrap { position: relative; flex: 1; min-width: 200px; }
    .mem-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
    .mem-search { width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #111827; background: #fff; box-sizing: border-box; transition: border-color .15s; }
    .mem-search:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .mem-select { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #374151; background: #fff; cursor: pointer; }
    .mem-select:focus { outline: none; border-color: #3b82f6; }

    /* Members list */
    .mem-list { display: flex; flex-direction: column; gap: 12px; }
    .mem-card { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,.07); transition: box-shadow .15s, transform .15s; }
    .mem-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); transform: translateY(-1px); }
    .mem-card__avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .mem-card__info { flex: 1; min-width: 0; }
    .mem-card__name { font-size: 15px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mem-card__email { font-size: 13px; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mem-card__meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
    .mem-card__username { font-size: 12px; color: #9ca3af; }
    .mem-card__actions { display: flex; gap: 8px; flex-shrink: 0; }
    .mem-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .mem-action-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: #fff; cursor: pointer; color: #6b7280; transition: all .15s; }
    .mem-action-btn--edit:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
    .mem-action-btn--delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

    /* Empty states */
    .mem-empty { text-align: center; padding: 64px 24px; background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .mem-empty svg { margin-bottom: 16px; }
    .mem-empty p { color: #6b7280; margin: 0 0 20px; font-size: 15px; }
    .mem-empty-state { text-align: center; padding: 120px 24px; }
    .mem-empty-state__icon { font-size: 64px; margin-bottom: 16px; }
    .mem-empty-state h2 { font-size: 22px; color: #111827; margin: 0 0 8px; }
    .mem-empty-state p { color: #6b7280; margin: 0 0 24px; }

    /* Buttons */
    .mem-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all .15s; white-space: nowrap; }
    .mem-btn--primary { background: #2563eb; color: #fff; }
    .mem-btn--primary:hover:not(:disabled) { background: #1d4ed8; }
    .mem-btn--primary:disabled { opacity: .6; cursor: not-allowed; }
    .mem-btn--outline { background: transparent; color: #2563eb; border: 1.5px solid #2563eb; }
    .mem-btn--outline:hover { background: #eff6ff; }
    .mem-btn--ghost { background: transparent; color: #6b7280; border: 1.5px solid #e5e7eb; }
    .mem-btn--ghost:hover { background: #f9fafb; }
    .mem-btn--danger { background: #ef4444; color: #fff; }
    .mem-btn--danger:hover:not(:disabled) { background: #dc2626; }
    .mem-btn--danger:disabled { opacity: .6; cursor: not-allowed; }

    /* Modal */
    .mem-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
    .mem-modal--hidden { display: none; }
    .mem-modal { background: #fff; border-radius: 18px; padding: 32px; width: 100%; max-width: 480px; box-shadow: 0 24px 64px rgba(0,0,0,.18); }
    .mem-modal--sm { max-width: 400px; }
    .mem-modal__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .mem-modal__title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .mem-modal__close { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 6px; transition: color .15s; }
    .mem-modal__close:hover { color: #111827; }

    /* Form */
    .mem-form { display: flex; flex-direction: column; gap: 18px; }
    .mem-form__field { display: flex; flex-direction: column; gap: 6px; }
    .mem-form__label { font-size: 14px; font-weight: 600; color: #374151; }
    .mem-form__required { color: #ef4444; }
    .mem-form__input { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #111827; background: #fff; transition: border-color .15s; }
    .mem-form__input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .mem-form__hint { font-size: 12px; color: #9ca3af; margin: 0; }
    .mem-form__actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
    .mem-form__error { font-size: 13px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; }
    .mem-form__error--hidden { display: none; }

    /* Confirm */
    .mem-confirm__body { text-align: center; padding: 8px 0 24px; }
    .mem-confirm__icon { font-size: 40px; margin-bottom: 12px; }
    .mem-confirm__text { font-size: 15px; color: #111827; font-weight: 500; margin: 0 0 6px; }
    .mem-confirm__hint { font-size: 13px; color: #9ca3af; margin: 0; }

    /* Combobox */
    .mem-combobox { position: relative; }
    .mem-combobox__input-wrap { position: relative; }
    .mem-combobox__icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
    .mem-combobox__input { padding-left: 38px !important; width: 100%; box-sizing: border-box; }

    /* User chip (selected state) */
    .mem-chip { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1.5px solid #3b82f6; border-radius: 10px; background: #eff6ff; }
    .mem-chip--hidden { display: none; }
    .mem-chip__avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#3b82f6,#2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .mem-chip__info { flex: 1; min-width: 0; }
    .mem-chip__name { display: block; font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mem-chip__email { display: block; font-size: 12px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mem-chip__clear { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; align-items: center; padding: 4px; border-radius: 6px; flex-shrink: 0; transition: color .15s; }
    .mem-chip__clear:hover { color: #ef4444; }

    /* Dropdown */
    .mem-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.12); z-index: 50; overflow: hidden; }
    .mem-dropdown--hidden { display: none; }
    .mem-dropdown__list { max-height: 240px; overflow-y: auto; padding: 6px; }
    .mem-dropdown__item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: none; background: none; cursor: pointer; border-radius: 8px; text-align: left; transition: background .1s; }
    .mem-dropdown__item:hover:not([disabled]) { background: #f0f7ff; }
    .mem-dropdown__item--disabled { opacity: .5; cursor: not-allowed; }
    .mem-dropdown__avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#6b7280,#4b5563); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .mem-dropdown__info { flex: 1; min-width: 0; }
    .mem-dropdown__name { display: block; font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mem-dropdown__email { display: block; font-size: 12px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mem-dropdown__tag { font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; white-space: nowrap; }
    .mem-dropdown__empty { padding: 18px 16px; font-size: 14px; color: #9ca3af; text-align: center; }

    @media (max-width: 640px) {
      .mem-container { padding: 20px 16px; }
      .mem-header { flex-direction: column; }
      .mem-card { flex-wrap: wrap; gap: 12px; }
      .mem-card__actions { margin-left: auto; }
      .mem-modal { padding: 24px 20px; }
    }
  `;
}
