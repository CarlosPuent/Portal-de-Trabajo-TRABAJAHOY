// Company Applicants Page - View postulants per vacancy
import { applicationService } from '@services/application.service';
import { vacancyService } from '@services/vacancy.service';
import { authService } from '@services/auth.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';
import { eye, calendar, checkCircle, xCircle, clock } from '@utils/icons.js';

export async function initCompanyApplicantsPage(vacancyId) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando postulantes...');

  try {
    const [vacancyData, appsData] = await Promise.all([
      vacancyService.getVacancyById(vacancyId).catch(() => null),
      applicationService.getApplications({ vacancyId }).catch(() => []),
    ]);
    const vacancy = vacancyData?.data || vacancyData || null;
    const applications = Array.isArray(appsData) ? appsData : (appsData?.data || []);

    document.getElementById('app').innerHTML = getApplicantsHTML(vacancy, applications, vacancyId, isAuthenticated, user);
    initApplicantsEvents(applications);
  } catch (error) {
    console.error('Error loading applicants:', error);
    document.getElementById('app').innerHTML = getApplicantsHTML(null, [], vacancyId, isAuthenticated, user);
    initApplicantsEvents([]);
  }
}

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: '#f59e0b', bg: '#fef3c7', icon: clock },
  reviewed:  { label: 'Revisado',   color: '#3b82f6', bg: '#dbeafe', icon: eye },
  interview: { label: 'Entrevista', color: '#8b5cf6', bg: '#ede9fe', icon: calendar },
  accepted:  { label: 'Aceptado',   color: '#059669', bg: '#d1fae5', icon: checkCircle },
  rejected:  { label: 'Rechazado',  color: '#dc2626', bg: '#fee2e2', icon: xCircle },
};

function getApplicantsHTML(vacancy, applications, vacancyId, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '', isAuthenticated, user });

  const statusCounts = { pending: 0, reviewed: 0, interview: 0, accepted: 0, rejected: 0 };
  applications.forEach(a => { if (statusCounts[a.status] !== undefined) statusCounts[a.status]++; });

  const applicantsHTML = applications.length > 0
    ? applications.map(app => {
      const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
      const cand = app.candidate || app.user?.candidateProfile || {};
      const userInfo = cand.user || app.user || {};
      const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'Candidato';
      return `
        <div class="app-card" data-id="${app.id}" data-status="${app.status}">
          <div class="app-card__left">
            <div class="app-card__avatar" style="background: ${s.bg}; color: ${s.color}">${fullName[0]}</div>
            <div class="app-card__info">
              <h3 class="app-card__name">${fullName}</h3>
              <p class="app-card__headline">${cand.headline || userInfo.email || ''}</p>
              <div class="app-card__meta">
                <span class="app-card__badge" style="background: ${s.bg}; color: ${s.color}">${s.icon} ${s.label}</span>
                <span class="app-card__date">${formatters.relativeTime(app.createdAt)}</span>
              </div>
            </div>
          </div>
          <div class="app-card__right">
            <a href="#/company/applications/${app.id}" class="btn btn--outline btn--sm">Ver Detalle</a>
            <div class="app-card__quick-actions">
              ${app.status !== 'interview' && app.status !== 'accepted' && app.status !== 'rejected' ? `
                <button class="btn-icon btn-icon--schedule" data-app-id="${app.id}" title="Programar entrevista">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </button>
              ` : ''}
              ${app.status !== 'accepted' && app.status !== 'rejected' ? `
                <button class="btn-icon btn-icon--accept" data-app-id="${app.id}" data-action="accepted" title="Contratar">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button class="btn-icon btn-icon--reject" data-app-id="${app.id}" data-action="rejected" title="Rechazar">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('')
    : `<div class="apps-empty">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <h3>No hay postulantes aún</h3>
        <p>Cuando alguien aplique a esta vacante, aparecerá aquí.</p>
      </div>`;

  const mainContent = `
    <div class="apps-container">
      <a href="#/company/profile" class="apps-back">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Volver al perfil
      </a>

      <div class="apps-header">
        <div>
          <h1 class="apps-title">Postulantes</h1>
          <p class="apps-subtitle">${vacancy ? vacancy.title : `Vacante #${vacancyId}`}</p>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="apps-tabs">
        <button class="apps-tab apps-tab--active" data-filter="all">Todos <span class="apps-tab__count">${applications.length}</span></button>
        ${Object.entries(STATUS_CONFIG).map(([key, val]) => `
          <button class="apps-tab" data-filter="${key}">${val.label} <span class="apps-tab__count">${statusCounts[key]}</span></button>
        `).join('')}
      </div>

      <div class="apps-list" id="apps-list">
        ${applicantsHTML}
      </div>
    </div>

    <!-- Schedule Interview Modal -->
    <div class="modal-overlay" id="schedule-modal" style="display:none;">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Programar Entrevista</h2>
          <button class="modal-close" id="close-schedule-modal">&times;</button>
        </div>
        <form id="schedule-form">
          <input type="hidden" id="schedule-app-id" />
          <div class="ecp-field">
            <label class="ecp-label" for="interview-date">Fecha y hora</label>
            <input type="datetime-local" id="interview-date" class="ecp-input" required />
          </div>
          <div class="ecp-field" style="margin-top:12px;">
            <label class="ecp-label" for="interview-notes">Notas</label>
            <textarea id="interview-notes" class="ecp-input ecp-textarea" rows="3" placeholder="Ubicación, enlace de videollamada, instrucciones..."></textarea>
          </div>
          <div class="ecp-actions" style="margin-top:16px;">
            <button type="button" class="btn btn--outline" id="cancel-schedule">Cancelar</button>
            <button type="submit" class="btn btn--primary">Confirmar Entrevista</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const styles = `
    .apps-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 24px 0 60px; }
    .apps-container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
    .apps-back { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; text-decoration: none; font-size: 14px; margin-bottom: 20px; transition: color 0.15s; }
    .apps-back:hover { color: #111827; }
    .apps-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .apps-title { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .apps-subtitle { color: #6b7280; margin: 0; font-size: 16px; }

    .apps-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #fff; border-radius: 12px; padding: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow-x: auto; }
    .apps-tab { padding: 8px 16px; border: none; background: none; font-size: 14px; font-weight: 500; color: #6b7280; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: all 0.15s; }
    .apps-tab:hover { background: #f3f4f6; }
    .apps-tab--active { background: #3b82f6; color: #fff; }
    .apps-tab--active:hover { background: #2563eb; }
    .apps-tab__count { font-size: 12px; padding: 1px 8px; border-radius: 999px; background: rgba(0,0,0,0.08); }
    .apps-tab--active .apps-tab__count { background: rgba(255,255,255,0.2); }

    .apps-list { display: flex; flex-direction: column; gap: 12px; }
    .app-card { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 20px 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.15s; }
    .app-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); transform: translateY(-1px); }
    .app-card__left { display: flex; align-items: center; gap: 16px; flex: 1; }
    .app-card__avatar { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
    .app-card__name { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 2px; }
    .app-card__headline { font-size: 14px; color: #6b7280; margin: 0 0 6px; }
    .app-card__meta { display: flex; align-items: center; gap: 10px; }
    .app-card__badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .app-card__date { font-size: 12px; color: #9ca3af; }
    .app-card__right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .app-card__quick-actions { display: flex; gap: 4px; }

    .btn-icon { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .btn-icon--schedule:hover { background: #ede9fe; border-color: #8b5cf6; color: #8b5cf6; }
    .btn-icon--accept:hover { background: #d1fae5; border-color: #059669; color: #059669; }
    .btn-icon--reject:hover { background: #fee2e2; border-color: #dc2626; color: #dc2626; }

    .apps-empty { text-align: center; padding: 80px 24px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .apps-empty svg { margin-bottom: 16px; }
    .apps-empty h3 { font-size: 18px; color: #374151; margin: 0 0 8px; }
    .apps-empty p { color: #6b7280; margin: 0; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
    .modal-content { background: #fff; border-radius: 16px; padding: 28px; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
    .modal-close { background: none; border: none; font-size: 28px; color: #9ca3af; cursor: pointer; padding: 0; line-height: 1; }
    .modal-close:hover { color: #111827; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    .ecp-field { display: flex; flex-direction: column; gap: 6px; }
    .ecp-label { font-size: 14px; font-weight: 500; color: #374151; }
    .ecp-input { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .ecp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    .ecp-textarea { resize: vertical; }
    .ecp-actions { display: flex; justify-content: flex-end; gap: 12px; }

    @media (max-width: 768px) {
      .app-card { flex-direction: column; align-items: flex-start; gap: 16px; }
      .app-card__right { width: 100%; flex-wrap: wrap; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'apps-page', extraStyles: styles });
}

function initApplicantsEvents(applications) {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error(e); }
    });
  }

  // Status filter tabs
  document.querySelectorAll('.apps-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.apps-tab').forEach(t => t.classList.remove('apps-tab--active'));
      tab.classList.add('apps-tab--active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.app-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
      });
    });
  });

  // Accept/Reject quick actions
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const appId = btn.dataset.appId;
      const action = btn.dataset.action;
      const label = action === 'accepted' ? 'contratar' : 'rechazar';
      if (!confirm(`¿Estás seguro de ${label} a este candidato?`)) return;

      try {
        await applicationService.changeApplicationStatus(appId, {
          toStatus: action,
          notes: action === 'accepted' ? 'Candidato contratado' : 'Candidato rechazado',
        });
        store.addToast({ type: 'success', message: action === 'accepted' ? 'Candidato marcado como contratado' : 'Candidato rechazado' });
        // Refresh
        window.location.reload();
      } catch (err) {
        console.error('Error changing status:', err);
        store.addToast({ type: 'error', message: 'Error al cambiar el estado' });
      }
    });
  });

  // Schedule interview modal
  const modal = document.getElementById('schedule-modal');
  document.querySelectorAll('.btn-icon--schedule').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('schedule-app-id').value = btn.dataset.appId;
      modal.style.display = 'flex';
    });
  });

  const closeModal = () => { if (modal) modal.style.display = 'none'; };
  document.getElementById('close-schedule-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-schedule')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('schedule-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const appId = document.getElementById('schedule-app-id').value;
    const date = document.getElementById('interview-date').value;
    const notes = document.getElementById('interview-notes').value;

    try {
      await applicationService.changeApplicationStatus(appId, {
        toStatus: 'interview',
        notes: `Entrevista programada: ${new Date(date).toLocaleString('es-ES')}. ${notes}`,
      });
      store.addToast({ type: 'success', message: 'Entrevista programada exitosamente' });
      closeModal();
      window.location.reload();
    } catch (err) {
      console.error('Error scheduling:', err);
      store.addToast({ type: 'error', message: 'Error al programar entrevista' });
    }
  });
}
