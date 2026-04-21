// Applicant Detail Page - View full candidate detail and manage application
import { applicationService } from '@services/application.service';
import { authService } from '@services/auth.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';

export async function initApplicantDetailPage(applicationId) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando detalle del postulante...');

  try {
    const [appData, historyData, commentsData] = await Promise.all([
      applicationService.getApplicationById(applicationId).catch(() => null),
      applicationService.getApplicationHistory(applicationId).catch(() => []),
      applicationService.getComments(applicationId).catch(() => []),
    ]);
    const application = appData?.data || appData || null;
    const history = Array.isArray(historyData) ? historyData : (historyData?.data || []);
    const comments = Array.isArray(commentsData) ? commentsData : (commentsData?.data || []);

    document.getElementById('app').innerHTML = getDetailHTML(application, history, comments, applicationId, isAuthenticated, user);
    initDetailEvents(application, applicationId);
  } catch (error) {
    console.error('Error loading applicant detail:', error);
    document.getElementById('app').innerHTML = getDetailHTML(null, [], [], applicationId, isAuthenticated, user);
    initDetailEvents(null, applicationId);
  }
}

const STATUS_MAP = {
  pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  reviewed: { label: 'Revisado', color: '#3b82f6', bg: '#dbeafe', icon: '👁️' },
  interview: { label: 'Entrevista', color: '#8b5cf6', bg: '#ede9fe', icon: '📅' },
  accepted: { label: 'Contratado', color: '#059669', bg: '#d1fae5', icon: '✅' },
  rejected: { label: 'Rechazado', color: '#dc2626', bg: '#fee2e2', icon: '❌' },
};

function getDetailHTML(app, history, comments, applicationId, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '', isAuthenticated, user });

  if (!app) {
    return renderPage({
      navbar,
      main: `<div class="ad-container"><div class="ad-empty"><h2>Aplicación no encontrada</h2><p>No se pudo cargar la información.</p><a href="#/company/profile" class="btn btn--primary">Volver</a></div></div>`,
      pageClass: 'ad-page',
      extraStyles: `.ad-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 40px 0; } .ad-container { max-width: 900px; margin: 0 auto; padding: 0 24px; } .ad-empty { text-align: center; padding: 80px 24px; }`,
    });
  }

  const s = STATUS_MAP[app.status] || STATUS_MAP.pending;
  const cand = app.candidate || app.user?.candidateProfile || {};
  const userInfo = cand.user || app.user || {};
  const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'Candidato';
  const vacancy = app.vacancy || {};
  const candidateUserId = app.user?.id || app.userId || userInfo.id || '';
  const cvs = Array.isArray(cand.cvs) ? cand.cvs : (cand.cvFile ? [cand.cvFile] : []);
  // Normalise fileUrl -> url
  cvs.forEach(cv => { if (cv.fileUrl && !cv.url) cv.url = cv.fileUrl; });

  const mainContent = `
    <div class="ad-container">
      <a href="#/company/vacancies/${vacancy.id || ''}/applicants" class="ad-back">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Volver a postulantes
      </a>

      <div class="ad-grid">
        <!-- Main Content -->
        <div class="ad-main">
          <!-- Candidate Card -->
          <div class="ad-card ad-candidate-card">
            <div class="ad-candidate-header">
              <div class="ad-avatar" style="background: ${s.bg}; color: ${s.color}">${fullName[0]}</div>
              <div class="ad-candidate-info">
                <h1 class="ad-candidate-name">${fullName}</h1>
                <p class="ad-candidate-headline">${cand.headline || ''}</p>
                <div class="ad-candidate-contact">
                  ${userInfo.email ? `<span class="ad-contact-item"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> ${userInfo.email}</span>` : ''}
                  ${userInfo.phone ? `<span class="ad-contact-item"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${userInfo.phone}</span>` : ''}
                  ${cand.location ? `<span class="ad-contact-item"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${cand.location}</span>` : ''}
                </div>
                ${candidateUserId ? `<a href="#/candidate/profile/${candidateUserId}" class="ad-profile-btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Ver perfil completo</a>` : ''}
              </div>
              <div class="ad-status-badge" style="background: ${s.bg}; color: ${s.color}">${s.icon} ${s.label}</div>
            </div>

            ${cand.bio ? `<div class="ad-section"><h3 class="ad-section-title">Acerca de</h3><p class="ad-section-text">${cand.bio}</p></div>` : ''}

            ${cand.linkedinUrl || cand.githubUrl || cand.websiteUrl ? `
              <div class="ad-section">
                <h3 class="ad-section-title">Enlaces</h3>
                <div class="ad-links">
                  ${cand.linkedinUrl ? `<a href="${cand.linkedinUrl}" target="_blank" class="ad-link">LinkedIn</a>` : ''}
                  ${cand.githubUrl ? `<a href="${cand.githubUrl}" target="_blank" class="ad-link">GitHub</a>` : ''}
                  ${cand.websiteUrl ? `<a href="${cand.websiteUrl}" target="_blank" class="ad-link">Sitio Web</a>` : ''}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Cover Letter -->
          ${app.coverLetter ? `
            <div class="ad-card">
              <h2 class="ad-card-title">Carta de Presentación</h2>
              <p class="ad-section-text">${app.coverLetter}</p>
            </div>
          ` : ''}

          <!-- CVs from candidate profile -->
          ${cvs.length > 0 || app.cvFileUrl || app.resumeUrl ? `
            <div class="ad-card">
              <h2 class="ad-card-title">Currículum Vitae</h2>
              <div class="ad-cvs-list">
                ${cvs.map(cv => `
                <a href="${cv.url || cv.fileUrl || ''}" target="_blank" class="ad-cv-link">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span class="ad-cv-name">${cv.fileName || 'Currículum'}</span>
                  <svg class="ad-cv-dl" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>`).join('')}
                ${cvs.length === 0 && (app.cvFileUrl || app.resumeUrl) ? `
                <a href="${app.cvFileUrl || app.resumeUrl}" target="_blank" class="ad-cv-link">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span class="ad-cv-name">Descargar CV</span>
                </a>` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Comments Section -->
          <div class="ad-card">
            <h2 class="ad-card-title">Comentarios Internos</h2>
            <form id="comment-form" class="ad-comment-form">
              <textarea id="comment-input" class="ad-comment-input" rows="3" placeholder="Agregar un comentario interno sobre este candidato..."></textarea>
              <div class="ad-comment-form-actions">
                <button type="submit" class="btn btn--primary btn--sm">Comentar</button>
              </div>
            </form>
            <div class="ad-comments-list" id="comments-list">
              ${comments.length > 0 ? comments.map(c => `
                <div class="ad-comment">
                  <div class="ad-comment-avatar">${(c.author?.firstName || 'U')[0]}</div>
                  <div class="ad-comment-body">
                    <div class="ad-comment-meta">
                      <strong>${c.author ? `${c.author.firstName || ''} ${c.author.lastName || ''}`.trim() : 'Usuario'}</strong>
                      <span>${formatters.relativeTime(c.createdAt)}</span>
                    </div>
                    <p class="ad-comment-text">${c.content}</p>
                  </div>
                </div>
              `).join('') : '<p class="ad-no-comments">No hay comentarios aún</p>'}
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="ad-sidebar">
          <!-- Vacancy Info -->
          <div class="ad-card">
            <h3 class="ad-card-title">Vacante</h3>
            <p class="ad-vacancy-title">${vacancy.title || 'No especificada'}</p>
            <div class="ad-vacancy-meta">
              ${vacancy.type ? `<span class="ad-tag">${vacancy.type}</span>` : ''}
              ${vacancy.modality ? `<span class="ad-tag">${vacancy.modality}</span>` : ''}
              ${vacancy.level ? `<span class="ad-tag">${vacancy.level}</span>` : ''}
            </div>
            <p class="ad-apply-date">Aplicó: ${formatters.date(app.createdAt)}</p>
          </div>

          <!-- Actions -->
          <div class="ad-card">
            <h3 class="ad-card-title">Acciones</h3>
            <div class="ad-action-buttons">
              ${app.status !== 'reviewed' && app.status !== 'accepted' && app.status !== 'rejected' ? `
                <button class="ad-action-btn ad-action-btn--review" id="btn-review">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  Marcar como Revisado
                </button>
              ` : ''}
              ${app.status !== 'interview' && app.status !== 'accepted' && app.status !== 'rejected' ? `
                <button class="ad-action-btn ad-action-btn--interview" id="btn-interview">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Programar Entrevista
                </button>
              ` : ''}
              ${app.status !== 'accepted' ? `
                <button class="ad-action-btn ad-action-btn--accept" id="btn-accept">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Marcar como Contratado
                </button>
              ` : ''}
              ${app.status !== 'rejected' ? `
                <button class="ad-action-btn ad-action-btn--reject" id="btn-reject">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  Rechazar Candidato
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Status History -->
          <div class="ad-card">
            <h3 class="ad-card-title">Historial</h3>
            <div class="ad-timeline">
              ${history.length > 0 ? history.map(h => {
                const hs = STATUS_MAP[h.toStatus] || STATUS_MAP[h.status] || { label: h.toStatus || h.status || '', color: '#6b7280', bg: '#f3f4f6' };
                return `
                  <div class="ad-timeline-item">
                    <div class="ad-timeline-dot" style="background: ${hs.color}"></div>
                    <div class="ad-timeline-content">
                      <strong style="color: ${hs.color}">${hs.label}</strong>
                      <span class="ad-timeline-date">${formatters.relativeTime(h.createdAt || h.changedAt)}</span>
                      ${h.notes ? `<p class="ad-timeline-notes">${h.notes}</p>` : ''}
                    </div>
                  </div>
                `;
              }).join('') : '<p class="ad-no-comments">Sin historial</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interview Modal -->
    <div class="modal-overlay" id="interview-modal" style="display:none;">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Programar Entrevista</h2>
          <button class="modal-close" id="close-interview-modal">&times;</button>
        </div>
        <form id="interview-form">
          <div class="ad-field">
            <label class="ad-label">Fecha y hora</label>
            <input type="datetime-local" id="int-date" class="ad-input" required />
          </div>
          <div class="ad-field" style="margin-top:12px;">
            <label class="ad-label">Notas / Instrucciones</label>
            <textarea id="int-notes" class="ad-input" rows="3" placeholder="Enlace de videollamada, ubicación..."></textarea>
          </div>
          <div class="ad-form-actions" style="margin-top:16px;">
            <button type="button" class="btn btn--outline" id="cancel-interview">Cancelar</button>
            <button type="submit" class="btn btn--primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const styles = `
    .ad-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 24px 0 60px; }
    .ad-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .ad-back { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; text-decoration: none; font-size: 14px; margin-bottom: 20px; transition: color 0.15s; }
    .ad-back:hover { color: #111827; }

    .ad-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    .ad-main { display: flex; flex-direction: column; gap: 20px; }
    .ad-sidebar { display: flex; flex-direction: column; gap: 20px; }

    .ad-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .ad-card-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }

    .ad-candidate-header { display: flex; gap: 16px; align-items: flex-start; }
    .ad-avatar { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; flex-shrink: 0; }
    .ad-candidate-info { flex: 1; }
    .ad-candidate-name { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .ad-candidate-headline { font-size: 15px; color: #6b7280; margin: 0 0 8px; }
    .ad-candidate-contact { display: flex; flex-wrap: wrap; gap: 12px; }
    .ad-contact-item { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #6b7280; }
    .ad-status-badge { padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; height: fit-content; }

    .ad-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #f3f4f6; }
    .ad-section-title { font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .ad-section-text { font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0; white-space: pre-line; }

    .ad-links { display: flex; gap: 8px; flex-wrap: wrap; }
    .ad-link { padding: 6px 16px; background: #f3f4f6; border-radius: 8px; color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.15s; }
    .ad-link:hover { background: #dbeafe; }

    .ad-profile-btn { display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; padding: 6px 14px; background: #f3f4f6; border-radius: 8px; color: #374151; text-decoration: none; font-size: 13px; font-weight: 500; transition: background 0.15s; border: 1px solid #e5e7eb; }
    .ad-profile-btn:hover { background: #e5e7eb; color: #111827; }
    .ad-cvs-list { display: flex; flex-direction: column; gap: 8px; }
    .ad-cv-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #eff6ff; border-radius: 10px; color: #2563eb; text-decoration: none; font-weight: 500; transition: background 0.15s; }
    .ad-cv-link:hover { background: #dbeafe; }
    .ad-cv-name { flex: 1; font-size: 14px; }
    .ad-cv-dl { color: #3b82f6; margin-left: auto; }

    .ad-comment-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .ad-comment-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
    .ad-comment-input:focus { border-color: #3b82f6; }
    .ad-comment-form-actions { display: flex; justify-content: flex-end; }
    .ad-comments-list { display: flex; flex-direction: column; gap: 12px; }
    .ad-comment { display: flex; gap: 10px; }
    .ad-comment-avatar { width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }
    .ad-comment-body { flex: 1; background: #f9fafb; border-radius: 8px; padding: 10px 14px; }
    .ad-comment-meta { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
    .ad-comment-meta strong { color: #111827; }
    .ad-comment-meta span { color: #9ca3af; }
    .ad-comment-text { font-size: 14px; color: #4b5563; margin: 0; }
    .ad-no-comments { font-size: 14px; color: #9ca3af; margin: 0; text-align: center; padding: 16px 0; }

    .ad-vacancy-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 8px; }
    .ad-vacancy-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .ad-tag { padding: 3px 10px; background: #f3f4f6; border-radius: 999px; font-size: 12px; color: #4b5563; font-weight: 500; text-transform: capitalize; }
    .ad-apply-date { font-size: 13px; color: #9ca3af; margin: 0; }

    .ad-action-buttons { display: flex; flex-direction: column; gap: 8px; }
    .ad-action-btn { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; font-weight: 500; color: #374151; transition: all 0.15s; width: 100%; text-align: left; font-family: inherit; }
    .ad-action-btn:hover { background: #f9fafb; }
    .ad-action-btn--review:hover { background: #dbeafe; border-color: #3b82f6; color: #2563eb; }
    .ad-action-btn--interview:hover { background: #ede9fe; border-color: #8b5cf6; color: #7c3aed; }
    .ad-action-btn--accept:hover { background: #d1fae5; border-color: #059669; color: #059669; }
    .ad-action-btn--reject:hover { background: #fee2e2; border-color: #dc2626; color: #dc2626; }

    .ad-timeline { display: flex; flex-direction: column; gap: 0; }
    .ad-timeline-item { display: flex; gap: 12px; padding: 10px 0; position: relative; }
    .ad-timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 5px; top: 22px; bottom: -2px; width: 2px; background: #e5e7eb; }
    .ad-timeline-dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
    .ad-timeline-content { flex: 1; }
    .ad-timeline-content strong { font-size: 13px; }
    .ad-timeline-date { font-size: 12px; color: #9ca3af; display: block; margin-top: 2px; }
    .ad-timeline-notes { font-size: 13px; color: #6b7280; margin: 4px 0 0; }

    .ad-field { display: flex; flex-direction: column; gap: 6px; }
    .ad-label { font-size: 14px; font-weight: 500; color: #374151; }
    .ad-input { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; }
    .ad-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    .ad-form-actions { display: flex; justify-content: flex-end; gap: 12px; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
    .modal-content { background: #fff; border-radius: 16px; padding: 28px; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
    .modal-close { background: none; border: none; font-size: 28px; color: #9ca3af; cursor: pointer; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    @media (max-width: 768px) {
      .ad-grid { grid-template-columns: 1fr; }
      .ad-candidate-header { flex-direction: column; }
      .ad-comment-form { flex-direction: column; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'ad-page', extraStyles: styles });
}

function initDetailEvents(app, applicationId) {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error(e); }
    });
  }

  async function changeStatus(toStatus, notes = '') {
    try {
      await applicationService.changeApplicationStatus(applicationId, { toStatus, notes });
      store.addToast({ type: 'success', message: `Estado cambiado a: ${STATUS_MAP[toStatus]?.label || toStatus}` });
      window.location.reload();
    } catch (err) {
      console.error('Error:', err);
      store.addToast({ type: 'error', message: 'Error al cambiar el estado' });
    }
  }

  document.getElementById('btn-review')?.addEventListener('click', () => changeStatus('reviewed'));
  document.getElementById('btn-accept')?.addEventListener('click', () => {
    if (confirm('¿Confirmas contratar a este candidato?')) changeStatus('accepted', 'Candidato contratado');
  });
  document.getElementById('btn-reject')?.addEventListener('click', () => {
    if (confirm('¿Rechazar a este candidato?')) changeStatus('rejected', 'Candidato rechazado');
  });

  // Interview modal
  const modal = document.getElementById('interview-modal');
  document.getElementById('btn-interview')?.addEventListener('click', () => { if (modal) modal.style.display = 'flex'; });
  const closeModal = () => { if (modal) modal.style.display = 'none'; };
  document.getElementById('close-interview-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-interview')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('interview-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('int-date').value;
    const notes = document.getElementById('int-notes').value;
    await changeStatus('interview', `Entrevista: ${new Date(date).toLocaleString('es-ES')}. ${notes}`);
    closeModal();
  });

  // Comments
  document.getElementById('comment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('comment-input');
    const content = input.value.trim();
    if (!content) return;

    try {
      await applicationService.addComment(applicationId, content);
      store.addToast({ type: 'success', message: 'Comentario agregado' });
      input.value = '';
      window.location.reload();
    } catch (err) {
      console.error('Error adding comment:', err);
      store.addToast({ type: 'error', message: 'Error al agregar comentario' });
    }
  });
}
