// Applications Page Controller — Candidate views their own applications with recruiter-updated statuses
import { applicationService } from '@services/application.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';
import { eye, calendar, checkCircle, xCircle, clock, clipboard, mapPin } from '@utils/icons.js';

export async function initApplicationsPage(params, query) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando postulaciones...');

  try {
    const data = await applicationService.getApplications({ limit: 100 });
    const applications = Array.isArray(data) ? data : (data?.data || []);
    document.getElementById('app').innerHTML = getApplicationsHTML(applications, isAuthenticated, user);
    initApplicationsEvents(applications);
  } catch (error) {
    console.error('Error loading applications:', error);
    document.getElementById('app').innerHTML = getApplicationsHTML([], isAuthenticated, user);
    initApplicationsEvents([]);
  }
}

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',       color: '#92400e', bg: '#fef3c7', icon: clock,       desc: 'Tu aplicación está siendo revisada' },
  reviewed:  { label: 'Revisada',        color: '#1e40af', bg: '#dbeafe', icon: eye,         desc: 'El reclutador ha revisado tu perfil' },
  interview: { label: 'Entrevista',      color: '#3730a3', bg: '#ede9fe', icon: calendar,    desc: '¡Te han invitado a una entrevista!' },
  accepted:  { label: 'Contratado',      color: '#065f46', bg: '#d1fae5', icon: checkCircle, desc: '¡Felicitaciones! Has sido contratado' },
  rejected:  { label: 'No seleccionado', color: '#991b1b', bg: '#fee2e2', icon: xCircle,     desc: 'En esta ocasión no fuiste seleccionado' },
};

function getApplicationsHTML(applications, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '/candidate/applications', isAuthenticated, user });

  // Count per status
  const counts = { all: applications.length };
  Object.keys(STATUS_CONFIG).forEach(k => { counts[k] = applications.filter(a => a.status === k).length; });

  const appsHTML = applications.length > 0
    ? applications.map(app => {
        const s = STATUS_CONFIG[app.status] || { label: app.status, color: '#6b7280', bg: '#f3f4f6', icon: clipboard, desc: '' };
        const v = app.vacancy || {};
        const co = v.company || {};
        const coName = co.name || v.companyName || 'Empresa';
        const logoChar = coName[0].toUpperCase();

        return `
          <article class="myapp-card" data-status="${app.status}">
            <div class="myapp-card__logo" style="background:${s.bg};color:${s.color}">${logoChar}</div>
            <div class="myapp-card__body">
              <div class="myapp-card__row">
                <div>
                  <h3 class="myapp-card__title">${v.title || 'Puesto'}</h3>
                  <p class="myapp-card__company">${coName}</p>
                </div>
                <span class="myapp-badge" style="background:${s.bg};color:${s.color}">${s.icon} ${s.label}</span>
              </div>
              <p class="myapp-card__desc">${s.desc}</p>
              <div class="myapp-card__footer">
                <span class="myapp-card__date">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Aplicado ${formatters.relativeTime(app.createdAt)}
                </span>
                ${v.type ? `<span class="myapp-tag">${v.type}</span>` : ''}
                ${v.modality ? `<span class="myapp-tag">${v.modality}</span>` : ''}
                ${v.city ? `<span class="myapp-tag">${mapPin} ${v.city}</span>` : ''}
                <a href="#/candidate/applications/${app.id}" class="myapp-detail-btn">Ver detalle →</a>
              </div>
            </div>
          </article>
        `;
      }).join('')
    : `<div class="myapp-empty">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
        <h3>No tienes postulaciones aún</h3>
        <p>Cuando apliques a una vacante, aparecerá aquí con su estado actualizado.</p>
        <a href="#/vacancies" class="btn btn--primary">Explorar vacantes</a>
      </div>`;

  const mainContent = `
    <div class="myapp-container">
      <div class="myapp-header">
        <div>
          <h1 class="myapp-title">Mis Postulaciones</h1>
          <p class="myapp-subtitle">${applications.length} postulación${applications.length !== 1 ? 'es' : ''} enviada${applications.length !== 1 ? 's' : ''}</p>
        </div>
        <a href="#/vacancies" class="btn btn--outline">Buscar más empleos</a>
      </div>

      <!-- Status filter tabs -->
      <div class="myapp-tabs" id="myapp-tabs">
        <button class="myapp-tab myapp-tab--active" data-filter="all">
          Todas <span class="myapp-tab__count">${counts.all}</span>
        </button>
        ${Object.entries(STATUS_CONFIG).map(([key, cfg]) => counts[key] > 0 ? `
          <button class="myapp-tab" data-filter="${key}">
            ${cfg.icon} ${cfg.label} <span class="myapp-tab__count">${counts[key]}</span>
          </button>
        ` : '').join('')}
      </div>

      <!-- Info banner for pending -->
      <div class="myapp-info-banner" id="myapp-info">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Los estados se actualizan automáticamente cuando el reclutador gestiona tu candidatura.
      </div>

      <div class="myapp-list" id="myapp-list">
        ${appsHTML}
      </div>
    </div>
  `;

  const styles = `
    .myapp-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 28px 0 60px; }
    .myapp-container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
    .myapp-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
    .myapp-title { font-size: 30px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .myapp-subtitle { color: #6b7280; margin: 0; font-size: 15px; }

    .myapp-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
    .myapp-tab { padding: 8px 16px; border: 1px solid #e5e7eb; background: #fff; border-radius: 9999px; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
    .myapp-tab:hover { border-color: #3b82f6; color: #3b82f6; }
    .myapp-tab--active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
    .myapp-tab__count { font-size: 11px; background: rgba(0,0,0,0.1); padding: 1px 7px; border-radius: 999px; }
    .myapp-tab--active .myapp-tab__count { background: rgba(255,255,255,0.25); }

    .myapp-info-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; font-size: 13px; color: #1e40af; margin-bottom: 20px; }

    .myapp-list { display: flex; flex-direction: column; gap: 14px; }

    .myapp-card { display: flex; gap: 16px; background: #fff; border-radius: 14px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s; border: 2px solid transparent; }
    .myapp-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); border-color: #e5e7eb; transform: translateY(-1px); }
    .myapp-card[data-status="interview"] { border-color: #c4b5fd; }
    .myapp-card[data-status="accepted"] { border-color: #6ee7b7; }

    .myapp-card__logo { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; flex-shrink: 0; }
    .myapp-card__body { flex: 1; min-width: 0; }
    .myapp-card__row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 4px; }
    .myapp-card__title { font-size: 17px; font-weight: 600; color: #111827; margin: 0; }
    .myapp-card__company { font-size: 14px; color: #6b7280; margin: 2px 0 0; }
    .myapp-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
    .myapp-card__desc { font-size: 13px; color: #6b7280; margin: 8px 0; }
    .myapp-card__footer { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .myapp-card__date { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #9ca3af; }
    .myapp-tag { padding: 2px 8px; background: #f3f4f6; border-radius: 999px; font-size: 12px; color: #4b5563; }
    .myapp-detail-btn { margin-left: auto; font-size: 13px; font-weight: 500; color: #3b82f6; text-decoration: none; padding: 4px 10px; border-radius: 6px; transition: background 0.15s; }
    .myapp-detail-btn:hover { background: #eff6ff; }

    .myapp-empty { text-align: center; padding: 80px 24px; background: #fff; border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .myapp-empty h3 { font-size: 20px; font-weight: 600; color: #374151; margin: 0; }
    .myapp-empty p { color: #6b7280; margin: 0; max-width: 340px; font-size: 14px; }

    @media (max-width: 640px) {
      .myapp-card { flex-direction: column; }
      .myapp-card__row { flex-direction: column; gap: 8px; }
      .myapp-detail-btn { margin-left: 0; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'myapp-page', extraStyles: styles });
}

function initApplicationsEvents(applications) {
  // Status filter tabs
  document.querySelectorAll('.myapp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.myapp-tab').forEach(t => t.classList.remove('myapp-tab--active'));
      tab.classList.add('myapp-tab--active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.myapp-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
      });
    });
  });
}
