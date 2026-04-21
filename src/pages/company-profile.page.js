// Company Profile Page Controller
import { companyService } from '@services/company.service';
import { vacancyService } from '@services/vacancy.service';
import { applicationService } from '@services/application.service';
import { authService } from '@services/auth.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';

export async function initCompanyProfilePage(params, query) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando perfil de empresa...');

  try {
    // Resolve user's company: prefer direct lookup by companyId (set at login),
    // fall back to listing all companies and matching by member.
    const userCompanyId = user?.companyId;
    let company = null;

    if (userCompanyId) {
      const raw = await companyService.getCompanyById(userCompanyId).catch(() => null);
      company = raw?.data || raw || null;
    }

    if (!company) {
      const companiesData = await companyService.getCompanies().catch(() => []);
      const companies = Array.isArray(companiesData) ? companiesData : (companiesData?.data || []);
      company = companies.find(c => c.members?.some(m => m.userId === user?.id)) || null;
    }

    let locations = [];
    let benefits = [];
    let members = [];
    let vacancies = [];

    if (company) {
      const [locData, benData, memData, vacData] = await Promise.all([
        companyService.getLocations(company.id).catch(() => []),
        companyService.getBenefits(company.id).catch(() => []),
        companyService.getMembers(company.id).catch(() => []),
        vacancyService.getAllVacancies({ companyId: company.id }).catch(() => []),
      ]);
      locations = Array.isArray(locData) ? locData : (locData?.data || []);
      benefits = Array.isArray(benData) ? benData : (benData?.data || []);
      members = Array.isArray(memData) ? memData : (memData?.data || []);
      vacancies = Array.isArray(vacData) ? vacData : (vacData?.data || []);
    }

    document.getElementById('app').innerHTML = getCompanyProfileHTML(company, locations, benefits, members, vacancies, isAuthenticated, user);
    initCompanyProfileEvents(company);
  } catch (error) {
    console.error('Error loading company profile:', error);
    document.getElementById('app').innerHTML = getCompanyProfileHTML(null, [], [], [], [], isAuthenticated, user);
    initCompanyProfileEvents(null);
  }
}

function getCompanyProfileHTML(company, locations, benefits, members, vacancies, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '', isAuthenticated, user });

  const publishedCount = vacancies.filter(v => v.status === 'published').length;
  const draftCount = vacancies.filter(v => v.status === 'draft').length;
  const closedCount = vacancies.filter(v => v.status === 'closed' || v.status === 'archived').length;

  // Check if current user is a company admin/owner (or system admin)
  const isSystemAdmin = store.isAdmin();
  const hasCompanyAdminRole = store.hasRole('company_admin') || store.hasRole('recruiter');
  const currentUserId = String(user?.id || '');
  const userMember = members.find(m =>
    String(m.userId || m.user_id || '') === currentUserId
  );
  const isCompanyAdmin = isSystemAdmin || hasCompanyAdminRole || (userMember && ['owner', 'company_admin'].includes(userMember.role));

  const mainContent = company ? `
    <div class="cp-container">
      <!-- Company Header -->
      <div class="cp-hero">
        <div class="cp-hero__cover" style="background: ${company.coverImageUrl ? `url(${company.coverImageUrl}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}"></div>
        <div class="cp-hero__info">
          <div class="cp-hero__logo-wrap">
            ${company.logoUrl
      ? `<img src="${company.logoUrl}" alt="${company.name}" class="cp-hero__logo" />`
      : `<div class="cp-hero__logo-placeholder">${(company.name || 'E')[0].toUpperCase()}</div>`
    }
          </div>
          <div class="cp-hero__text">
            <div class="cp-hero__name-row">
              <h1 class="cp-hero__name">${company.name || 'Mi Empresa'}</h1>
              ${company.isVerified ? '<span class="cp-hero__verified" title="Empresa verificada">✓ Verificada</span>' : ''}
            </div>
            <p class="cp-hero__industry">${company.industry || 'Industria no especificada'}</p>
            <div class="cp-hero__meta">
              ${company.size ? `<span class="cp-meta-item"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> ${company.size} empleados</span>` : ''}
              ${company.foundedYear ? `<span class="cp-meta-item"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Fundada en ${company.foundedYear}</span>` : ''}
              ${company.websiteUrl ? `<a href="${company.websiteUrl}" target="_blank" rel="noopener" class="cp-meta-item cp-meta-item--link"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> Sitio web</a>` : ''}
            </div>
          </div>
          <div class="cp-hero__actions ">
            ${isCompanyAdmin ? `
            <a href="#/company/profile/edit" class="btn btn--primary mt-4">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Editar Perfil
            </a>` : ''}
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="cp-stats">
        <div class="cp-stat-card cp-stat-card--blue">
          <div class="cp-stat-card__number">${publishedCount}</div>
          <div class="cp-stat-card__label">Vacantes Activas</div>
        </div>
        <div class="cp-stat-card cp-stat-card--green">
          <div class="cp-stat-card__number">${draftCount}</div>
          <div class="cp-stat-card__label">Borradores</div>
        </div>
        <div class="cp-stat-card cp-stat-card--purple">
          <div class="cp-stat-card__number">${closedCount}</div>
          <div class="cp-stat-card__label">Cerradas</div>
        </div>
        <div class="cp-stat-card cp-stat-card--amber">
          <div class="cp-stat-card__number">${members.length}</div>
          <div class="cp-stat-card__label">Miembros</div>
        </div>
      </div>

      <div class="cp-grid">
        <!-- About -->
        <div class="cp-section">
          <h2 class="cp-section__title">Acerca de</h2>
          <p class="cp-section__text">${company.description || 'No se ha agregado una descripción aún.'}</p>
        </div>

        <!-- Locations -->
        <div class="cp-section">
          <h2 class="cp-section__title">Ubicaciones</h2>
          ${locations.length > 0 ? `
            <div class="cp-location-list">
              ${locations.map(loc => `
                <div class="cp-location-item">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <div>
                    <div class="cp-location-item__city">${loc.city || ''}, ${loc.country || ''}</div>
                    ${loc.address ? `<div class="cp-location-item__addr">${loc.address}</div>` : ''}
                    ${loc.isPrimary ? '<span class="cp-badge cp-badge--blue">Principal</span>' : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="cp-empty">No hay ubicaciones registradas</p>'}
        </div>

        <!-- Benefits -->
        <div class="cp-section">
          <h2 class="cp-section__title">Beneficios</h2>
          ${benefits.length > 0 ? `
            <div class="cp-benefits-grid">
              ${benefits.map(b => `
                <div class="cp-benefit-item">
                  <div class="cp-benefit-item__icon">🎁</div>
                  <div>
                    <div class="cp-benefit-item__name">${b.name}</div>
                    ${b.description ? `<div class="cp-benefit-item__desc">${b.description}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="cp-empty">No hay beneficios registrados</p>'}
        </div>

        <!-- Team Members -->
        <div class="cp-section">
          <div class="cp-section__header">
            <h2 class="cp-section__title">Equipo</h2>
            ${isCompanyAdmin ? `<a href="#/company/members" class="btn btn--outline btn--sm">Gestionar miembros</a>` : ''}
          </div>
          ${members.length > 0 ? `
            <div class="cp-members-list">
              ${members.map(m => `
                <div class="cp-member-item">
                  <div class="cp-member-item__avatar">${(m.user?.firstName || 'U')[0]}</div>
                  <div>
                    <div class="cp-member-item__name">${m.user ? `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() : 'Miembro'}</div>
                    <span class="cp-badge cp-badge--${m.role === 'owner' ? 'amber' : m.role === 'admin' ? 'purple' : 'blue'}">${m.role}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="cp-empty">No hay miembros registrados</p>'}
        </div>

        <!-- Vacancies -->
        <div class="cp-section cp-section--full">
          <div class="cp-section__header">
            <h2 class="cp-section__title">Vacantes</h2>
            <a href="#/company/vacancies/create" class="btn btn--primary btn--sm">+ Nueva Vacante</a>
          </div>
          ${vacancies.length > 0 ? `
            <div class="cp-vacancies-list">
              ${vacancies.map(v => `
                <div class="cp-vacancy-row">
                  <div class="cp-vacancy-row__info">
                    <h3 class="cp-vacancy-row__title">${v.title || 'Sin título'}</h3>
                    <div class="cp-vacancy-row__meta">
                      <span class="cp-badge cp-badge--${v.status === 'published' ? 'green' : v.status === 'draft' ? 'gray' : 'red'}">${v.status}</span>
                      <span>${v.type || ''}</span>
                      <span>${v.modality || ''}</span>
                      ${v.city ? `<span>${v.city}</span>` : ''}
                    </div>
                  </div>
                  <div class="cp-vacancy-row__actions">
                    <a href="#/company/vacancies/${v.id}/applicants" class="btn btn--outline btn--sm">Ver Postulantes</a>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="cp-empty-card">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <p>No tienes vacantes creadas</p>
              <a href="#/company/vacancies/create" class="btn btn--primary btn--sm">Crear tu primera vacante</a>
            </div>
          `}
        </div>
      </div>
    </div>
  ` : `
    <div class="cp-container">
      <div class="cp-no-company">
        <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <h2>Aún no tienes una empresa registrada</h2>
        <p>Crea tu perfil de empresa para comenzar a publicar vacantes.</p>
        <button id="create-company-btn" class="btn btn--primary">Registrar Empresa</button>
      </div>
    </div>
  `;

  const styles = `
    .cp-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding-bottom: 60px; }
    .cp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    
    .cp-hero { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 24px; }
    .cp-hero__cover { height: 200px; }
    .cp-hero__info { padding: 0 32px 28px; display: flex; align-items: flex-end; gap: 24px; margin-top: -48px; flex-wrap: wrap; }
    .cp-hero__logo-wrap { flex-shrink: 0; }
    .cp-hero__logo { width: 96px; height: 96px; border-radius: 16px; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15); object-fit: cover; background: #fff; }
    .cp-hero__logo-placeholder { width: 96px; height: 96px; border-radius: 16px; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; }
    .cp-hero__text { flex: 1; min-width: 200px; }
    .cp-hero__name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .cp-hero__name { font-size: 26px; font-weight: 700; color: #111827; margin: 0; }
    .cp-hero__verified { font-size: 13px; color: #059669; background: #d1fae5; padding: 4px 10px; border-radius: 999px; font-weight: 600; }
    .cp-hero__industry { color: #6b7280; font-size: 15px; margin: 4px 0 8px; }
    .cp-hero__meta { display: flex; flex-wrap: wrap; gap: 16px; }
    .cp-meta-item { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: #6b7280; }
    .cp-meta-item--link { color: #3b82f6; text-decoration: none; }
    .cp-meta-item--link:hover { text-decoration: underline; }
    .cp-hero__actions { flex-shrink: 0; margin-left: auto; }

    .cp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; }
    .cp-stat-card { background: #fff; padding: 20px 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-left: 4px solid; }
    .cp-stat-card--blue { border-color: #3b82f6; }
    .cp-stat-card--green { border-color: #10b981; }
    .cp-stat-card--purple { border-color: #8b5cf6; }
    .cp-stat-card--amber { border-color: #f59e0b; }
    .cp-stat-card__number { font-size: 28px; font-weight: 700; color: #111827; }
    .cp-stat-card__label { font-size: 13px; color: #6b7280; margin-top: 2px; }

    .cp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 24px; }
    .cp-section { background: #fff; padding: 28px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .cp-section--full { grid-column: 1 / -1; }
    .cp-section__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .cp-section__title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
    .cp-section__header .cp-section__title { margin-bottom: 0; }
    .cp-section__text { font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0; }
    .cp-empty { font-size: 14px; color: #9ca3af; margin: 0; }

    .cp-location-list { display: flex; flex-direction: column; gap: 12px; }
    .cp-location-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 8px; background: #f9fafb; }
    .cp-location-item__city { font-weight: 500; color: #111827; }
    .cp-location-item__addr { font-size: 13px; color: #6b7280; }

    .cp-benefits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .cp-benefit-item { display: flex; gap: 10px; padding: 12px; border-radius: 8px; background: #f9fafb; }
    .cp-benefit-item__icon { font-size: 20px; }
    .cp-benefit-item__name { font-weight: 500; color: #111827; font-size: 14px; }
    .cp-benefit-item__desc { font-size: 13px; color: #6b7280; }

    .cp-members-list { display: flex; flex-direction: column; gap: 10px; }
    .cp-member-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: #f9fafb; }
    .cp-member-item__avatar { width: 36px; height: 36px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; flex-shrink: 0; }
    .cp-member-item__name { font-weight: 500; color: #111827; font-size: 14px; }

    .cp-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .cp-badge--blue { background: #dbeafe; color: #2563eb; }
    .cp-badge--green { background: #d1fae5; color: #059669; }
    .cp-badge--purple { background: #ede9fe; color: #7c3aed; }
    .cp-badge--amber { background: #fef3c7; color: #d97706; }
    .cp-badge--gray { background: #f3f4f6; color: #6b7280; }
    .cp-badge--red { background: #fee2e2; color: #dc2626; }

    .cp-vacancies-list { display: flex; flex-direction: column; gap: 12px; }
    .cp-vacancy-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 10px; background: #f9fafb; transition: all 0.15s ease; }
    .cp-vacancy-row:hover { background: #eff6ff; }
    .cp-vacancy-row__title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 6px; }
    .cp-vacancy-row__meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #6b7280; align-items: center; }
    .cp-vacancy-row__actions { flex-shrink: 0; margin-left: 16px; }

    .cp-empty-card { text-align: center; padding: 48px 24px; background: #f9fafb; border-radius: 12px; }
    .cp-empty-card svg { margin-bottom: 16px; }
    .cp-empty-card p { color: #6b7280; margin: 0 0 20px; }

    .cp-no-company { text-align: center; padding: 120px 24px; }
    .cp-no-company svg { margin-bottom: 24px; }
    .cp-no-company h2 { font-size: 24px; color: #111827; margin: 0 0 8px; }
    .cp-no-company p { color: #6b7280; margin: 0 0 32px; }

    @media (max-width: 768px) {
      .cp-grid { grid-template-columns: 1fr; }
      .cp-hero__info { padding: 0 20px 20px; gap: 16px; flex-direction: column; align-items: flex-start; }
      .cp-hero__actions { margin-left: 0; }
      .cp-vacancy-row { flex-direction: column; align-items: flex-start; gap: 12px; }
      .cp-vacancy-row__actions { margin-left: 0; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'cp-page', extraStyles: styles });
}

function initCompanyProfileEvents(company) {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error('Logout error:', e); }
    });
  }

  const createBtn = document.getElementById('create-company-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      window.location.hash = '#/company/profile/edit';
    });
  }
}
