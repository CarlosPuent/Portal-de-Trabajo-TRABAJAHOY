// Candidate Application Detail Page — shows status, history, and interview info
import { applicationService } from '@services/application.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';
import { eye, calendar, checkCircle, xCircle, clock, clipboard, mapPin, messageSquare, paperclip, check } from '@utils/icons.js';

export async function initCandidateApplicationDetailPage(applicationId) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando detalle de postulación...');

  try {
    const [appRaw, historyRaw, commentsRaw] = await Promise.all([
      applicationService.getApplicationById(applicationId).catch(() => null),
      applicationService.getApplicationHistory(applicationId).catch(() => []),
      applicationService.getComments(applicationId).catch(() => []),
    ]);

    const app = appRaw?.data || appRaw || null;
    const history = Array.isArray(historyRaw) ? historyRaw : (historyRaw?.data || []);
    const comments = Array.isArray(commentsRaw) ? commentsRaw : (commentsRaw?.data || []);

    document.getElementById('app').innerHTML = getDetailHTML(app, history, comments, applicationId, isAuthenticated, user);
    initCandidateApplicationDetailEvents(applicationId);
  } catch (error) {
    console.error('Error loading application detail:', error);
    document.getElementById('app').innerHTML = getDetailHTML(null, [], [], applicationId, isAuthenticated, user);
    initCandidateApplicationDetailEvents(applicationId);
  }
}

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',       color: '#92400e', bg: '#fef3c7', icon: clock,       step: 0 },
  reviewed:  { label: 'En revisión',     color: '#1e40af', bg: '#dbeafe', icon: eye,         step: 1 },
  interview: { label: 'Entrevista',      color: '#3730a3', bg: '#ede9fe', icon: calendar,    step: 2 },
  accepted:  { label: 'Contratado',      color: '#065f46', bg: '#d1fae5', icon: checkCircle, step: 3 },
  rejected:  { label: 'No seleccionado', color: '#991b1b', bg: '#fee2e2', icon: xCircle,     step: -1 },
};

const STEPS = ['pending', 'reviewed', 'interview', 'accepted'];

function getDetailHTML(app, history, comments, applicationId, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '/candidate/applications', isAuthenticated, user });

  if (!app) {
    return renderPage({
      navbar,
      main: `<div class="cad-container"><div class="cad-empty">
        <h2>Postulación no encontrada</h2>
        <a href="#/candidate/applications" class="btn btn--primary">Volver a mis postulaciones</a>
      </div></div>`,
      pageClass: 'cad-page',
      extraStyles: `.cad-page{min-height:calc(100vh - 70px);background:#f3f4f6;padding:40px 0;}.cad-container{max-width:800px;margin:0 auto;padding:0 24px;}.cad-empty{text-align:center;padding:80px 24px;}`,
    });
  }

  const s = STATUS_CONFIG[app.status] || { label: app.status, color: '#6b7280', bg: '#f3f4f6', icon: clipboard, step: 0 };
  const v = app.vacancy || {};
  const co = v.company || {};
  const coName = co.name || v.companyName || 'Empresa';
  const coId = co.id || v.companyId;
  const isRejected = app.status === 'rejected';
  const isAccepted = app.status === 'accepted';

  // Build status stepper
  const stepperHTML = !isRejected ? `
    <div class="cad-stepper">
      ${STEPS.map((step, idx) => {
        const cfg = STATUS_CONFIG[step];
        const currentStep = s.step;
        const done = idx < currentStep;
        const active = idx === currentStep;
        return `
          <div class="cad-step ${done ? 'cad-step--done' : ''} ${active ? 'cad-step--active' : ''}">
            <div class="cad-step__dot">${done ? check : cfg.icon}</div>
            <p class="cad-step__label">${cfg.label}</p>
          </div>
          ${idx < STEPS.length - 1 ? `<div class="cad-step__line ${done ? 'cad-step__line--done' : ''}"></div>` : ''}
        `;
      }).join('')}
    </div>
  ` : `<div class="cad-rejected-banner">
    <span class="cad-rejected-banner__icon">${xCircle}</span>
    <div>
      <strong>No fuiste seleccionado en esta ocasión</strong>
      <p>¡No te desanimes! Hay muchas oportunidades esperándote.</p>
    </div>
    <a href="#/vacancies" class="btn btn--primary btn--sm">Buscar nuevas vacantes</a>
  </div>`;

  const interview = getInterviewData(app, history);

  // Interview info if scheduled
  const interviewInfo = interview ? `
    <div class="cad-interview-card">
      <div class="cad-interview-card__icon">${calendar}</div>
      <div>
        <h3 class="cad-interview-card__title">Entrevista programada</h3>
        <p class="cad-interview-card__date">${interview.dateText}</p>
        ${interview.location ? `<p class="cad-interview-card__loc">${mapPin} ${interview.location}</p>` : ''}
        ${interview.notes ? `<p class="cad-interview-card__notes">${interview.notes}</p>` : ''}
      </div>
    </div>
  ` : '';

  // History timeline
  const historyHTML = history.length > 0 ? `
    <div class="cad-history">
      <h2 class="cad-section-title">Historial de tu postulación</h2>
      <div class="cad-timeline">
        ${[...history].reverse().map(h => {
          const hs = STATUS_CONFIG[h.toStatus] || { label: h.toStatus, color: '#6b7280', bg: '#f3f4f6', icon: clipboard };
          return `
            <div class="cad-timeline-item">
              <div class="cad-timeline-item__dot" style="background:${hs.bg};color:${hs.color}">${hs.icon}</div>
              <div class="cad-timeline-item__body">
                <div class="cad-timeline-item__header">
                  <span class="cad-timeline-item__label" style="color:${hs.color}">${hs.label}</span>
                  <span class="cad-timeline-item__date">${formatters.relativeTime(h.changedAt || h.createdAt)}</span>
                </div>
                ${h.notes ? `<p class="cad-timeline-item__notes">${h.notes}</p>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  const mainContent = `
    <div class="cad-container">
      <!-- Back link -->
      <a href="#/candidate/applications" class="cad-back">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Mis postulaciones
      </a>

      <!-- Job header card -->
      <div class="cad-job-card">
        <div class="cad-job-card__logo" style="background:${s.bg};color:${s.color}">${coName[0].toUpperCase()}</div>
        <div class="cad-job-card__info">
          <h1 class="cad-job-card__title">${v.title || 'Puesto'}</h1>
          ${coId
            ? `<a href="#/companies/${coId}" class="cad-job-card__company">${coName} →</a>`
            : `<p class="cad-job-card__company-plain">${coName}</p>`
          }
          <div class="cad-job-card__tags">
            ${v.type ? `<span class="cad-tag">${v.type}</span>` : ''}
            ${v.modality ? `<span class="cad-tag">${v.modality}</span>` : ''}
            ${v.city ? `<span class="cad-tag">${mapPin} ${v.city}</span>` : ''}
          </div>
        </div>
        <div class="cad-job-card__status">
          <span class="cad-badge" style="background:${s.bg};color:${s.color}">${s.icon} ${s.label}</span>
          <p class="cad-job-card__date">Aplicado ${formatters.relativeTime(app.createdAt)}</p>
        </div>
      </div>

      <!-- Status progress / rejected banner -->
      <div class="cad-card">
        <h2 class="cad-section-title">Estado de tu postulación</h2>
        ${stepperHTML}
        ${interviewInfo}
        ${isAccepted ? `<div class="cad-accepted-msg"><span class="cad-accepted-msg__icon">${checkCircle}</span> ¡Felicitaciones! Has sido contratado. El equipo de recursos humanos se pondrá en contacto contigo pronto.</div>` : ''}
      </div>

      <!-- Cover letter if submitted -->
      ${app.coverLetter ? `
        <div class="cad-card">
          <h2 class="cad-section-title">Carta de Presentación</h2>
          <p class="cad-cover-text">${app.coverLetter}</p>
        </div>
      ` : ''}

      <!-- CV submitted with application -->
      ${(app.cvFileUrl || app.resumeUrl) ? `
        <div class="cad-card">
          <h2 class="cad-section-title">${paperclip} CV enviado con la postulación</h2>
          <a href="${app.cvFileUrl || app.resumeUrl}" target="_blank" class="cad-cv-download">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Ver / descargar CV enviado
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
        </div>
      ` : ''}

      <!-- History -->
      ${historyHTML ? `<div class="cad-card">${historyHTML}</div>` : ''}

      <!-- Shared Comments Channel -->
      <div class="cad-card">
        <h2 class="cad-section-title">${messageSquare} Comunicación con el Reclutador</h2>
        <p class="cad-comments-subtitle">Canal compartido con el equipo de reclutamiento. Puedes escribir mensajes, hacer preguntas o agregar notas sobre tu postulación.</p>
        <form id="cad-comment-form" class="cad-comment-form" data-application-id="${applicationId}">
          <textarea id="cad-comment-input" class="cad-comment-input" rows="3" placeholder="Escribe un mensaje para el reclutador o una nota sobre tu postulación..." required></textarea>
          <div class="cad-comment-actions">
            <button type="submit" class="btn btn--primary btn--sm">Enviar mensaje</button>
          </div>
        </form>

        <div class="cad-comments-list">
          ${comments.length > 0 ? comments.map(comment => {
            const authorId = comment.author?.id || comment.authorId;
            const isMe = !!(authorId && String(authorId) === String(user?.id));
            const authorName = comment.author
              ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim()
              : 'Usuario';
            const avatarLetter = (authorName || 'U')[0].toUpperCase();
            const roleLabel = isMe ? 'Tú' : 'Reclutador';
            const avatarBg = isMe ? '#3b82f6' : '#059669';
            const roleBg = isMe ? '#eff6ff' : '#f0fdf4';
            const roleColor = isMe ? '#1d4ed8' : '#166534';

            return `
              <article class="cad-comment-item">
                <div class="cad-comment-avatar" style="background:${avatarBg}">${avatarLetter}</div>
                <div class="cad-comment-body ${isMe ? 'cad-comment-body--mine' : ''}">
                  <div class="cad-comment-meta">
                    <div class="cad-comment-author">
                      <strong>${isMe ? 'Tú' : authorName}</strong>
                      <span class="cad-comment-role" style="background:${roleBg};color:${roleColor}">${roleLabel}</span>
                    </div>
                    <span>${formatters.relativeTime(comment.createdAt)}</span>
                  </div>
                  <p class="cad-comment-text">${comment.content || ''}</p>
                </div>
              </article>
            `;
          }).join('') : '<p class="cad-no-comments">No hay mensajes aún. ¡Inicia la conversación con el reclutador!</p>'}
        </div>
      </div>

      <!-- Actions -->
      <div class="cad-actions">
        <a href="#/candidate/applications" class="btn btn--outline">Ver todas mis postulaciones</a>
        <a href="#/vacancies/${v.id}" class="btn btn--outline">Ver vacante</a>
        ${coId ? `<a href="#/companies/${coId}" class="btn btn--outline">Perfil de empresa</a>` : ''}
        <a href="#/vacancies" class="btn btn--primary">Buscar más empleos</a>
      </div>
    </div>
  `;

  const styles = `
    .cad-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 28px 0 60px; }
    .cad-container { max-width: 780px; margin: 0 auto; padding: 0 24px; }
    .cad-back { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; text-decoration: none; font-size: 14px; margin-bottom: 20px; transition: color 0.15s; }
    .cad-back:hover { color: #111827; }

    .cad-job-card { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; }
    .cad-job-card__logo { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; flex-shrink: 0; }
    .cad-job-card__info { flex: 1; min-width: 0; }
    .cad-job-card__title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .cad-job-card__company { font-size: 14px; color: #3b82f6; text-decoration: none; font-weight: 500; }
    .cad-job-card__company:hover { text-decoration: underline; }
    .cad-job-card__company-plain { font-size: 14px; color: #6b7280; margin: 0 0 8px; }
    .cad-job-card__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .cad-tag { padding: 2px 10px; background: #f3f4f6; border-radius: 999px; font-size: 12px; color: #4b5563; }
    .cad-job-card__status { text-align: right; flex-shrink: 0; }
    .cad-badge { display: inline-flex; align-items: center; gap: 4px; padding: 5px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
    .cad-job-card__date { font-size: 12px; color: #9ca3af; margin: 6px 0 0; }

    .cad-card { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 16px; }
    .cad-section-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 20px; }

    /* Stepper */
    .cad-stepper { display: flex; align-items: center; gap: 0; overflow-x: auto; padding-bottom: 4px; }
    .cad-step { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 80px; }
    .cad-step__dot { width: 40px; height: 40px; border-radius: 50%; background: #f3f4f6; color: #9ca3af; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid #e5e7eb; }
    .cad-step--done .cad-step__dot { background: #d1fae5; color: #059669; border-color: #6ee7b7; font-size: 14px; font-weight: 700; }
    .cad-step--active .cad-step__dot { background: #3b82f6; color: #fff; border-color: #3b82f6; font-size: 16px; box-shadow: 0 0 0 4px rgba(59,130,246,0.2); }
    .cad-step__label { font-size: 11px; color: #9ca3af; text-align: center; white-space: nowrap; }
    .cad-step--active .cad-step__label { color: #3b82f6; font-weight: 600; }
    .cad-step--done .cad-step__label { color: #059669; }
    .cad-step__line { flex: 1; height: 2px; background: #e5e7eb; min-width: 24px; }
    .cad-step__line--done { background: #6ee7b7; }

    .cad-rejected-banner { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px; flex-wrap: wrap; }
    .cad-rejected-banner span { font-size: 28px; }
    .cad-rejected-banner strong { display: block; color: #991b1b; font-size: 15px; }
    .cad-rejected-banner p { color: #6b7280; font-size: 13px; margin: 2px 0 0; }
    .cad-rejected-banner a { margin-left: auto; }

    .cad-interview-card { display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 10px; margin-top: 16px; }
    .cad-interview-card__icon { font-size: 28px; flex-shrink: 0; }
    .cad-interview-card__title { font-size: 15px; font-weight: 600; color: #4c1d95; margin: 0 0 4px; }
    .cad-interview-card__date { font-size: 14px; color: #5b21b6; font-weight: 500; margin: 0 0 4px; }
    .cad-interview-card__loc, .cad-interview-card__notes { font-size: 13px; color: #6b7280; margin: 2px 0 0; }

    .cad-accepted-msg { margin-top: 16px; padding: 14px 20px; background: #d1fae5; border-radius: 10px; color: #065f46; font-size: 14px; }

    .cad-cover-text { font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-line; margin: 0; }

    .cad-section-title { font-size: 17px; font-weight: 600; color: #111827; margin: 0 0 16px; }
    .cad-timeline { display: flex; flex-direction: column; gap: 12px; }
    .cad-timeline-item { display: flex; gap: 12px; align-items: flex-start; }
    .cad-timeline-item__dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .cad-timeline-item__body { flex: 1; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
    .cad-timeline-item:last-child .cad-timeline-item__body { border-bottom: none; padding-bottom: 0; }
    .cad-timeline-item__header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
    .cad-timeline-item__label { font-size: 14px; font-weight: 600; }
    .cad-timeline-item__date { font-size: 12px; color: #9ca3af; }
    .cad-timeline-item__notes { font-size: 13px; color: #4b5563; margin: 0; background: #f9fafb; padding: 8px 12px; border-radius: 6px; }

    .cad-comments-subtitle { margin: -10px 0 16px; color: #6b7280; font-size: 13px; line-height: 1.5; }
    .cad-comment-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
    .cad-comment-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; outline: none; box-sizing: border-box; }
    .cad-comment-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .cad-comment-actions { display: flex; justify-content: flex-end; }
    .cad-comments-list { display: flex; flex-direction: column; gap: 12px; }
    .cad-comment-item { display: flex; gap: 10px; }
    .cad-comment-avatar { width: 34px; height: 34px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0; }
    .cad-comment-body { flex: 1; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px 12px; }
    .cad-comment-body--mine { background: #eff6ff; border-color: #bfdbfe; }
    .cad-comment-meta { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
    .cad-comment-author { display: flex; align-items: center; gap: 6px; }
    .cad-comment-author strong { font-size: 13px; color: #111827; }
    .cad-comment-role { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 999px; letter-spacing: 0.2px; }
    .cad-comment-meta > span { font-size: 12px; color: #9ca3af; flex-shrink: 0; }
    .cad-comment-text { font-size: 14px; color: #4b5563; margin: 0; white-space: pre-line; }
    .cad-no-comments { font-size: 14px; color: #9ca3af; text-align: center; margin: 0; padding: 16px 0; }
    .cad-cv-download { display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px; background: #eff6ff; border-radius: 10px; color: #2563eb; text-decoration: none; font-weight: 500; font-size: 14px; transition: background 0.15s; border: 1px solid #bfdbfe; }
    .cad-cv-download:hover { background: #dbeafe; }

    .cad-actions { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 4px; }

    @media (max-width: 640px) {
      .cad-job-card { flex-direction: column; }
      .cad-job-card__status { text-align: left; }
      .cad-stepper { gap: 4px; }
      .cad-step { min-width: 60px; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'cad-page', extraStyles: styles });
}

function getInterviewData(app, history) {
  const interviewDate = app?.interviewDate || app?.interviewAt || '';
  const interviewTime = app?.interviewTime || '';
  const interviewLocation = app?.interviewLocation || '';
  const interviewNotes = app?.interviewNotes || '';

  if (interviewDate) {
    const prettyDate = formatters.date(interviewDate);
    const dateText = `${prettyDate}${interviewTime ? ` a las ${interviewTime}` : ''}`;
    return { dateText, location: interviewLocation, notes: interviewNotes };
  }

  const interviewEvent = [...(history || [])].reverse().find((entry) => entry?.toStatus === 'interview');
  if (!interviewEvent?.notes) return null;

  const parsed = parseInterviewNotes(interviewEvent.notes);
  return {
    dateText: parsed.dateText || 'Fecha por confirmar',
    location: parsed.location,
    notes: parsed.notes,
  };
}

function parseInterviewNotes(rawNotes) {
  if (!rawNotes) return { dateText: '', location: '', notes: '' };

  const notes = String(rawNotes).trim();
  const match = notes.match(/Entrevista:\s*([^.]+)(?:\.\s*(.*))?/i);
  const dateCandidate = (match?.[1] || '').trim();
  const remainingNotes = (match?.[2] || notes).trim();

  const parsedDate = parseSpanishDateTime(dateCandidate);
  const dateText = parsedDate
    ? `${formatters.date(parsedDate)} a las ${parsedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    : dateCandidate;

  return {
    dateText: dateText || 'Fecha por confirmar',
    location: '',
    notes: remainingNotes,
  };
}

function parseSpanishDateTime(value) {
  if (!value) return null;
  const clean = String(value).trim();
  const m = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;

  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] || 0);
  const date = new Date(year, month, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date;
}

function initCandidateApplicationDetailEvents(applicationId) {
  document.getElementById('cad-comment-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementById('cad-comment-input');
    const content = input?.value?.trim();
    if (!content) return;

    try {
      await applicationService.addComment(applicationId, content);
      store.addToast({ type: 'success', message: 'Comentario enviado' });
      window.location.reload();
    } catch (error) {
      console.error('Error adding candidate comment:', error);
      store.addToast({ type: 'error', message: 'No se pudo enviar el comentario' });
    }
  });
}
