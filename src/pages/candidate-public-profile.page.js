// Candidate Public Profile Page — for Recruiters and Admins
import { api } from '@services/api';
import { store } from '@core/store';
import { authService } from '@services/auth.service';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';

export async function initCandidatePublicProfilePage(userId) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');
  showLoading('Cargando perfil del candidato...');

  let profile = null;
  try {
    const res = await api.get(`/candidates/public/by-user/${userId}`);
    profile = res.data?.data || res.data || null;
  } catch (err) {
    console.error('Error loading candidate profile:', err);
  }

  document.getElementById('app').innerHTML = getCandidateProfileHTML(profile, isAuthenticated, user, userId);
  initEvents();
}

function getCandidateProfileHTML(profile, isAuthenticated, user, userId) {
  const navbar = renderNavbar({ activeRoute: '', isAuthenticated, user });

  if (!profile) {
    return renderPage({
      navbar,
      main: `<div class="cp-container"><div class="cp-empty">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <h2>Perfil no encontrado</h2>
        <p>Este candidato no tiene un perfil completo aún.</p>
        <a href="javascript:history.back()" class="btn btn--outline">Volver</a>
      </div></div>`,
      pageClass: 'cp-page',
      extraStyles: `.cp-page{min-height:calc(100vh - 70px);background:#f3f4f6;padding:40px 0}.cp-container{max-width:900px;margin:0 auto;padding:0 24px}.cp-empty{text-align:center;padding:80px 24px;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)}.cp-empty h2{margin:16px 0 8px;color:#111827}.cp-empty p{color:#6b7280;margin-bottom:24px}`,
    });
  }

  const userInfo = profile.user || {};
  const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'Candidato';
  const initial = fullName[0] || '?';
  const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  const education = Array.isArray(profile.education) ? profile.education : [];
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  const cvs = Array.isArray(profile.cvs) ? profile.cvs : [];
  const interests = Array.isArray(profile.interests) ? profile.interests : [];

  const availabilityLabels = {
    immediately: 'Disponible inmediatamente',
    two_weeks: 'En 2 semanas',
    month: 'En 1 mes',
    not_available: 'No disponible',
  };

  const mainContent = `
    <div class="cp-container">
      <a href="javascript:history.back()" class="cp-back">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Volver
      </a>

      <div class="cp-grid">
        <!-- Main -->
        <div class="cp-main">
          <!-- Header Card -->
          <div class="cp-card cp-hero">
            <div class="cp-hero-avatar">${initial}</div>
            <div class="cp-hero-info">
              <h1 class="cp-hero-name">${fullName}</h1>
              ${profile.headline ? `<p class="cp-hero-headline">${profile.headline}</p>` : ''}
              <div class="cp-hero-meta">
                ${userInfo.email ? `<span class="cp-meta-item"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${userInfo.email}</span>` : ''}
                ${profile.location ? `<span class="cp-meta-item"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${profile.location}</span>` : ''}
                ${profile.availability ? `<span class="cp-meta-item cp-avail">${availabilityLabels[profile.availability] || profile.availability}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Bio -->
          ${profile.bio ? `
          <div class="cp-card">
            <h2 class="cp-section-title">Acerca de</h2>
            <p class="cp-text">${profile.bio}</p>
          </div>` : ''}

          <!-- CVs -->
          ${cvs.length > 0 ? `
          <div class="cp-card">
            <h2 class="cp-section-title">Currículum Vitae</h2>
            <div class="cp-cvs">
              ${cvs.map(cv => {
                const url = cv.fileUrl || cv.url || cv.file || '';
                return `
                <a href="${url}" target="_blank" class="cp-cv-item" ${!url ? 'style="pointer-events:none;opacity:0.5"' : ''}>
                  <div class="cp-cv-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#3b82f6" stroke-width="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div class="cp-cv-info">
                    <span class="cp-cv-name">${cv.fileName || 'Currículum'}</span>
                    <span class="cp-cv-date">${cv.uploadedAt ? formatters.date(cv.uploadedAt) : ''}</span>
                  </div>
                  <div class="cp-cv-dl">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                </a>`;
              }).join('')}
            </div>
          </div>` : ''}

          <!-- Experience -->
          ${experiences.length > 0 ? `
          <div class="cp-card">
            <h2 class="cp-section-title">Experiencia</h2>
            <div class="cp-timeline">
              ${experiences.map(exp => `
              <div class="cp-timeline-item">
                <div class="cp-tl-dot"></div>
                <div class="cp-tl-content">
                  <div class="cp-tl-header">
                    <strong>${exp.position || exp.jobTitle || ''}</strong>
                    <span class="cp-tl-period">${formatters.date(exp.startDate)} — ${exp.endDate ? formatters.date(exp.endDate) : 'Actualidad'}</span>
                  </div>
                  <p class="cp-tl-company">${exp.company || exp.companyName || ''}</p>
                  ${exp.description ? `<p class="cp-text">${exp.description}</p>` : ''}
                </div>
              </div>`).join('')}
            </div>
          </div>` : ''}

          <!-- Education -->
          ${education.length > 0 ? `
          <div class="cp-card">
            <h2 class="cp-section-title">Educación</h2>
            <div class="cp-timeline">
              ${education.map(ed => `
              <div class="cp-timeline-item">
                <div class="cp-tl-dot"></div>
                <div class="cp-tl-content">
                  <div class="cp-tl-header">
                    <strong>${ed.degree || ed.title || ''}</strong>
                    <span class="cp-tl-period">${formatters.date(ed.startDate)} — ${ed.endDate ? formatters.date(ed.endDate) : 'Actualidad'}</span>
                  </div>
                  <p class="cp-tl-company">${ed.institution || ed.school || ''}</p>
                  ${ed.fieldOfStudy ? `<p class="cp-text">${ed.fieldOfStudy}</p>` : ''}
                </div>
              </div>`).join('')}
            </div>
          </div>` : ''}
        </div>

        <!-- Sidebar -->
        <div class="cp-sidebar">
          <!-- Skills -->
          ${skills.length > 0 ? `
          <div class="cp-card">
            <h3 class="cp-card-title">Habilidades</h3>
            <div class="cp-tags">
              ${skills.map(s => `
              <span class="cp-tag">
                ${s.skillName || s.name || s.skill || ''}
                ${s.level ? `<span class="cp-tag-level">${s.level}</span>` : ''}
              </span>`).join('')}
            </div>
          </div>` : ''}

          <!-- Languages -->
          ${languages.length > 0 ? `
          <div class="cp-card">
            <h3 class="cp-card-title">Idiomas</h3>
            <div class="cp-languages">
              ${languages.map(l => `
              <div class="cp-lang-item">
                <span class="cp-lang-name">${l.language || l.languageName || ''}</span>
                <span class="cp-tag cp-tag--sm">${l.proficiency || l.level || ''}</span>
              </div>`).join('')}
            </div>
          </div>` : ''}

          <!-- Interests -->
          ${interests.length > 0 ? `
          <div class="cp-card">
            <h3 class="cp-card-title">Intereses</h3>
            <div class="cp-tags">
              ${interests.map(i => `<span class="cp-tag cp-tag--muted">${i.tagName || i.name || i}</span>`).join('')}
            </div>
          </div>` : ''}

          <!-- Links -->
          ${profile.linkedinUrl || profile.githubUrl || profile.website ? `
          <div class="cp-card">
            <h3 class="cp-card-title">Perfil en línea</h3>
            <div class="cp-links">
              ${profile.linkedinUrl ? `<a href="${profile.linkedinUrl}" target="_blank" class="cp-link cp-link--linkedin">LinkedIn</a>` : ''}
              ${profile.githubUrl ? `<a href="${profile.githubUrl}" target="_blank" class="cp-link cp-link--github">GitHub</a>` : ''}
              ${profile.website ? `<a href="${profile.website}" target="_blank" class="cp-link">Sitio Web</a>` : ''}
            </div>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;

  const styles = `
    .cp-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 28px 0 60px; }
    .cp-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .cp-back { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; text-decoration: none; font-size: 14px; margin-bottom: 20px; transition: color 0.15s; }
    .cp-back:hover { color: #111827; }
    .cp-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
    .cp-main { display: flex; flex-direction: column; gap: 20px; }
    .cp-sidebar { display: flex; flex-direction: column; gap: 16px; }

    .cp-card { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .cp-section-title { font-size: 17px; font-weight: 700; color: #111827; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
    .cp-card-title { font-size: 14px; font-weight: 700; color: #374151; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .cp-text { font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0; white-space: pre-line; }

    .cp-hero { display: flex; gap: 20px; align-items: flex-start; }
    .cp-hero-avatar { width: 72px; height: 72px; border-radius: 18px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; flex-shrink: 0; }
    .cp-hero-info { flex: 1; }
    .cp-hero-name { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 4px; }
    .cp-hero-headline { font-size: 15px; color: #6b7280; margin: 0 0 10px; }
    .cp-hero-meta { display: flex; flex-wrap: wrap; gap: 12px; }
    .cp-meta-item { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #6b7280; }
    .cp-avail { background: #d1fae5; color: #059669; padding: 2px 10px; border-radius: 999px; font-weight: 500; }

    /* CVs */
    .cp-cvs { display: flex; flex-direction: column; gap: 10px; }
    .cp-cv-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 10px; background: #eff6ff; text-decoration: none; transition: background 0.15s; }
    .cp-cv-item:hover { background: #dbeafe; }
    .cp-cv-icon { flex-shrink: 0; }
    .cp-cv-info { flex: 1; }
    .cp-cv-name { display: block; font-size: 14px; font-weight: 600; color: #1d4ed8; }
    .cp-cv-date { font-size: 12px; color: #6b7280; }
    .cp-cv-dl { color: #3b82f6; }

    /* Timeline */
    .cp-timeline { display: flex; flex-direction: column; gap: 0; }
    .cp-timeline-item { display: flex; gap: 14px; padding: 12px 0; position: relative; }
    .cp-timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 5px; top: 22px; bottom: -4px; width: 2px; background: #e5e7eb; }
    .cp-tl-dot { width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; margin-top: 4px; flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 0 0 2px #3b82f6; }
    .cp-tl-content { flex: 1; }
    .cp-tl-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 2px; }
    .cp-tl-header strong { font-size: 15px; color: #111827; }
    .cp-tl-period { font-size: 12px; color: #9ca3af; }
    .cp-tl-company { font-size: 13px; color: #3b82f6; margin: 0 0 6px; font-weight: 500; }

    /* Tags */
    .cp-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .cp-tag { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; background: #f3f4f6; border-radius: 999px; font-size: 13px; color: #374151; font-weight: 500; }
    .cp-tag--sm { font-size: 11px; padding: 2px 8px; }
    .cp-tag--muted { background: #fdf4ff; color: #7c3aed; }
    .cp-tag-level { font-size: 11px; color: #9ca3af; }

    /* Languages */
    .cp-languages { display: flex; flex-direction: column; gap: 8px; }
    .cp-lang-item { display: flex; justify-content: space-between; align-items: center; }
    .cp-lang-name { font-size: 14px; color: #374151; font-weight: 500; }

    /* Links */
    .cp-links { display: flex; flex-direction: column; gap: 8px; }
    .cp-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: #f3f4f6; color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.15s; }
    .cp-link:hover { background: #e5e7eb; }
    .cp-link--linkedin { background: #eff6ff; color: #1d4ed8; }
    .cp-link--linkedin:hover { background: #dbeafe; }
    .cp-link--github { background: #f9fafb; color: #111827; }
    .cp-link--github:hover { background: #f3f4f6; }

    @media (max-width: 768px) {
      .cp-grid { grid-template-columns: 1fr; }
      .cp-hero { flex-direction: column; }
      .cp-tl-header { flex-direction: column; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'cp-page', extraStyles: styles });
}

function initEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error(e); }
    });
  }
}
