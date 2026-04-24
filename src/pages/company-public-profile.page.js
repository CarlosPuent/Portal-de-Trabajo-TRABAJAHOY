// Company Public Profile Page - Any user can view a company's public profile + reviews
import { companyService } from '@services/company.service';
import { vacancyService } from '@services/vacancy.service';
import { reviewService } from '@services/review.service';
import { applicationService } from '@services/application.service';
import { authService } from '@services/auth.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters, formatSalaryRange } from '@utils/formatters.js';
import { check, mapPin, sparkle, thumbsUp, thumbsDown, starFilled, starEmpty, renderStars as renderSvgStars } from '@utils/icons.js';

export async function initCompanyPublicProfilePage(companyId) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando perfil de empresa...');

  try {
    const [companyData, locData, benData, vacData, reviewsData, summaryData] = await Promise.all([
      companyService.getCompanyById(companyId).catch(() => null),
      companyService.getLocations(companyId).catch(() => []),
      companyService.getBenefits(companyId).catch(() => []),
      vacancyService.getVacancies({ companyId }).catch(() => []),
      reviewService.getCompanyReviews(companyId).catch(() => []),
      reviewService.getCompanyReviewSummary(companyId).catch(() => null),
    ]);
    const company = companyData?.data || companyData || null;
    const locations = Array.isArray(locData) ? locData : (locData?.data || []);
    const benefits = Array.isArray(benData) ? benData : (benData?.data || []);
    const vacancies = Array.isArray(vacData) ? vacData : (vacData?.data || []);
    const reviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.data || []);
    const summary = summaryData?.data || summaryData || null;

    document.getElementById('app').innerHTML = getPublicProfileHTML(
      company, locations, benefits, vacancies, reviews, summary, companyId, isAuthenticated, user
    );
    initPublicProfileEvents(company, isAuthenticated);
  } catch (error) {
    console.error('Error loading company:', error);
    document.getElementById('app').innerHTML = getPublicProfileHTML(
      null, [], [], [], [], null, companyId, isAuthenticated, user
    );
    initPublicProfileEvents(null, isAuthenticated);
  }
}

function renderStars(rating, max = 5) {
  return renderSvgStars(Math.round(rating || 0), max, 14);
}

function getPublicProfileHTML(company, locations, benefits, vacancies, reviews, summary, companyId, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '', isAuthenticated, user });

  if (!company) {
    return renderPage({
      navbar,
      main: `<div class="pub-container"><div class="pub-empty"><h2>Empresa no encontrada</h2><a href="#/vacancies" class="btn btn--primary">Ver Vacantes</a></div></div>`,
      pageClass: 'pub-page',
      extraStyles: `.pub-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 40px 0; } .pub-container { max-width: 960px; margin: 0 auto; padding: 0 24px; } .pub-empty { text-align: center; padding: 80px 24px; } .pub-empty h2 { margin-bottom: 20px; }`,
    });
  }

  const publishedVacancies = vacancies.filter(v => v.status === 'published');
  const avgRating = summary?.averageRating || (reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null);
  const totalReviews = summary?.totalReviews || reviews.length;

  const mainContent = `
    <div class="pub-container">
      <!-- Hero -->
      <div class="pub-hero">
        <div class="pub-hero__cover" style="background: ${company.coverImageUrl ? `url(${company.coverImageUrl}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}"></div>
        <div class="pub-hero__body">
          <div class="pub-hero__logo-wrap">
            ${company.logoUrl
              ? `<img src="${company.logoUrl}" alt="${company.name}" class="pub-hero__logo" />`
              : `<div class="pub-hero__logo-placeholder">${(company.name || 'E')[0].toUpperCase()}</div>`
            }
          </div>
          <div class="pub-hero__text">
            <div class="pub-hero__row">
              <h1 class="pub-hero__name">${company.name}</h1>
              ${company.isVerified ? `<span class="pub-verified">${check} Verificada</span>` : ''}
            </div>
            <p class="pub-hero__industry">${company.industry || ''}</p>
            <div class="pub-hero__meta">
              ${company.size ? `<span class="pub-meta-tag">${company.size} empleados</span>` : ''}
              ${company.foundedYear ? `<span class="pub-meta-tag">Fundada en ${company.foundedYear}</span>` : ''}
              ${locations.length > 0 ? `<span class="pub-meta-tag">${mapPin} ${locations[0].city || ''}, ${locations[0].country || ''}</span>` : ''}
              ${avgRating ? `<span class="pub-meta-tag pub-meta-tag--rating">${starFilled(14)} ${avgRating} (${totalReviews} reseñas)</span>` : ''}
            </div>
          </div>
          <div class="pub-hero__actions">
            ${company.websiteUrl ? `<a href="${company.websiteUrl}" target="_blank" rel="noopener" class="btn btn--outline btn--sm">Sitio Web</a>` : ''}
            ${isAuthenticated ? `<button class="btn btn--primary btn--sm" id="follow-company-btn">Seguir Empresa</button>` : ''}
          </div>
        </div>
      </div>

      <div class="pub-grid">
        <!-- About -->
        <div class="pub-card pub-card--full">
          <h2 class="pub-card__title">Acerca de ${company.name}</h2>
          <p class="pub-card__text">${company.description || 'Esta empresa aún no ha agregado una descripción.'}</p>
        </div>

        <!-- Benefits -->
        ${benefits.length > 0 ? `
          <div class="pub-card">
            <h2 class="pub-card__title">Beneficios</h2>
            <div class="pub-benefits">
              ${benefits.map(b => `
                <div class="pub-benefit">
                  <span class="pub-benefit__icon">${sparkle}</span>
                  <div>
                    <div class="pub-benefit__name">${b.name}</div>
                    ${b.description ? `<div class="pub-benefit__desc">${b.description}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Locations -->
        ${locations.length > 0 ? `
          <div class="pub-card">
            <h2 class="pub-card__title">Ubicaciones</h2>
            ${locations.map(loc => `
              <div class="pub-location">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${loc.city || ''}, ${loc.country || ''} ${loc.address ? `— ${loc.address}` : ''}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Reviews -->
        <div class="pub-card pub-card--full" id="reviews-section">
          <div class="pub-card__header">
            <div>
              <h2 class="pub-card__title" style="margin:0">Reseñas de empleados</h2>
              ${avgRating ? `<div class="pub-rating-summary">
                <span class="pub-rating-big">${avgRating}</span>
                <div>
                  <div class="pub-rating-stars">${renderStars(avgRating)}</div>
                  <div class="pub-rating-count">${totalReviews} reseña${totalReviews !== 1 ? 's' : ''}</div>
                </div>
              </div>` : ''}
            </div>
            ${isAuthenticated ? `<button class="btn btn--primary btn--sm" id="write-review-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Escribir Reseña
            </button>` : ''}
          </div>

          <!-- Write Review Form (hidden by default) -->
          <div id="review-form-card" class="pub-review-form-wrap" style="display:none;">
            <form id="review-form">
              <div class="pub-review-form">
                <div class="pub-field">
                  <label class="pub-form-label">Calificación general *</label>
                  <div class="pub-stars" id="star-rating">
                    ${[1,2,3,4,5].map(i => `<button type="button" class="pub-star" data-value="${i}">${starFilled(20)}</button>`).join('')}
                  </div>
                  <input type="hidden" id="review-rating" value="0" />
                </div>
                <div class="pub-field">
                  <label class="pub-form-label">Título</label>
                  <input type="text" id="review-title" class="pub-input" placeholder="Ej: Excelente ambiente laboral" />
                </div>
                <div class="pub-field pub-field--full">
                  <label class="pub-form-label">Tu experiencia *</label>
                  <textarea id="review-text" class="pub-input" rows="4" placeholder="Comparte tu experiencia trabajando en esta empresa..." required></textarea>
                </div>
                <div class="pub-field">
                  <label class="pub-form-label">Aspectos positivos</label>
                  <textarea id="review-pros" class="pub-input" rows="2" placeholder="Lo mejor de trabajar aquí..."></textarea>
                </div>
                <div class="pub-field">
                  <label class="pub-form-label">Aspectos a mejorar</label>
                  <textarea id="review-cons" class="pub-input" rows="2" placeholder="Qué mejorarías..."></textarea>
                </div>
                <div class="pub-field">
                  <label class="pub-form-label">Estado laboral</label>
                  <select id="review-status" class="pub-input">
                    <option value="">Seleccionar...</option>
                    <option value="current">Empleado actual</option>
                    <option value="former">Ex-empleado</option>
                  </select>
                </div>
                <div class="pub-field">
                  <label class="pub-check-label">
                    <input type="checkbox" id="review-anon" />
                    Publicar de forma anónima
                  </label>
                </div>
              </div>
              <div class="pub-form-actions">
                <button type="button" class="btn btn--outline" id="cancel-review">Cancelar</button>
                <button type="submit" class="btn btn--primary">Publicar Reseña</button>
              </div>
            </form>
          </div>

          <!-- Reviews list -->
          <div id="reviews-list" class="pub-reviews-list">
            ${reviews.length > 0 ? reviews.map(r => `
              <div class="pub-review" data-id="${r.id}">
                <div class="pub-review__header">
                  <div class="pub-review__stars">${renderStars(r.rating)}</div>
                  <span class="pub-review__rating">${r.rating}/5</span>
                  <span class="pub-review__date">${formatters.relativeTime(r.createdAt)}</span>
                  ${isAuthenticated ? `<button class="pub-review__report" data-review-id="${r.id}" title="Reportar reseña">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                  </button>` : ''}
                </div>
                ${r.title ? `<h4 class="pub-review__title">${r.title}</h4>` : ''}
                <p class="pub-review__text">${r.content || r.body || ''}</p>
                ${r.pros ? `<div class="pub-review__pros"><span>${thumbsUp} Pros:</span> ${r.pros}</div>` : ''}
                ${r.cons ? `<div class="pub-review__cons"><span>${thumbsDown} Cons:</span> ${r.cons}</div>` : ''}
                ${r.employmentStatus ? `<span class="pub-review__status">${r.employmentStatus === 'current' ? 'Empleado actual' : 'Ex-empleado'}</span>` : ''}
                ${r.isAnonymous ? '<span class="pub-review__anon">Publicado anónimamente</span>' : ''}
              </div>
            `).join('') : `
              <div class="pub-empty-state">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <p>Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
              </div>
            `}
          </div>
        </div>

        <!-- Open Vacancies -->
        <div class="pub-card pub-card--full">
          <h2 class="pub-card__title">Vacantes Abiertas (${publishedVacancies.length})</h2>
          ${publishedVacancies.length > 0 ? `
            <div class="pub-vacancies">
              ${publishedVacancies.map(v => `
                <a href="#/vacancies/${v.id}" class="pub-vacancy-card">
                  <div class="pub-vacancy-card__info">
                    <h3 class="pub-vacancy-card__title">${v.title}</h3>
                    <div class="pub-vacancy-card__tags">
                      ${v.type ? `<span class="pub-tag">${v.type}</span>` : ''}
                      ${v.modality ? `<span class="pub-tag">${v.modality}</span>` : ''}
                      ${v.level ? `<span class="pub-tag">${v.level}</span>` : ''}
                      ${v.city ? `<span class="pub-tag">${mapPin} ${v.city}</span>` : ''}
                    </div>
                  </div>
                  <span class="pub-vacancy-card__salary">${formatSalaryRange(v.salaryMin, v.salaryMax, v.currency)}</span>
                </a>
              `).join('')}
            </div>
          ` : '<p class="pub-empty-state">No hay vacantes abiertas en este momento.</p>'}
        </div>
      </div>
    </div>

    <!-- Report Review Modal -->
    <div class="modal-overlay" id="report-review-modal" style="display:none;">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Reportar Reseña</h2>
          <button class="modal-close" id="close-report-review">&#times;</button>
        </div>
        <form id="report-review-form">
          <input type="hidden" id="report-review-id" />
          <div class="pub-field">
            <label class="pub-form-label">Motivo</label>
            <select id="report-review-reason" class="pub-input" required>
              <option value="">Seleccionar...</option>
              <option value="spam">Spam</option>
              <option value="offensive">Contenido ofensivo</option>
              <option value="false_info">Información falsa</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div class="pub-field" style="margin-top:12px;">
            <label class="pub-form-label">Detalles (opcional)</label>
            <textarea id="report-review-details" class="pub-input" rows="2"></textarea>
          </div>
          <div class="pub-form-actions" style="margin-top:16px;">
            <button type="button" class="btn btn--outline" id="cancel-report-review">Cancelar</button>
            <button type="submit" class="btn btn--primary">Enviar Reporte</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const styles = `
    .pub-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding-bottom: 60px; }
    .pub-container { max-width: 960px; margin: 0 auto; padding: 0 24px; }

    .pub-hero { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 24px; }
    .pub-hero__cover { height: 180px; }
    .pub-hero__body { padding: 0 28px 24px; display: flex; gap: 20px; margin-top: -40px; flex-wrap: wrap; align-items: flex-end; }
    .pub-hero__logo { width: 80px; height: 80px; border-radius: 14px; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.12); object-fit: cover; }
    .pub-hero__logo-placeholder { width: 80px; height: 80px; border-radius: 14px; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.12); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; }
    .pub-hero__text { flex: 1; min-width: 200px; }
    .pub-hero__row { display: flex; align-items: center; gap: 10px; }
    .pub-hero__name { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
    .pub-verified { font-size: 12px; color: #059669; background: #d1fae5; padding: 3px 10px; border-radius: 999px; font-weight: 600; }
    .pub-hero__industry { color: #6b7280; margin: 4px 0 8px; font-size: 15px; }
    .pub-hero__meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .pub-meta-tag { padding: 4px 12px; background: #f3f4f6; border-radius: 999px; font-size: 13px; color: #4b5563; }
    .pub-meta-tag--rating { background: #fef3c7; color: #92400e; font-weight: 600; }
    .pub-hero__actions { flex-shrink: 0; display: flex; gap: 8px; margin-left: auto; }

    .pub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; }
    .pub-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .pub-card--full { grid-column: 1 / -1; }
    .pub-card__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .pub-card__title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 12px; }
    .pub-card__text { font-size: 15px; color: #4b5563; line-height: 1.7; margin: 0; }

    .pub-rating-summary { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
    .pub-rating-big { font-size: 40px; font-weight: 700; color: #111827; line-height: 1; }
    .pub-rating-stars { color: #f59e0b; font-size: 20px; letter-spacing: 2px; }
    .pub-rating-count { font-size: 13px; color: #6b7280; }

    .pub-benefits { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .pub-benefit { display: flex; gap: 8px; padding: 10px; background: #f9fafb; border-radius: 8px; }
    .pub-benefit__icon { font-size: 18px; }
    .pub-benefit__name { font-weight: 500; color: #111827; font-size: 14px; }
    .pub-benefit__desc { font-size: 13px; color: #6b7280; }

    .pub-location { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 14px; color: #4b5563; }

    .pub-review-form-wrap { background: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
    .pub-review-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .pub-field { display: flex; flex-direction: column; gap: 6px; }
    .pub-field--full { grid-column: 1 / -1; }
    .pub-form-label { font-size: 14px; font-weight: 500; color: #374151; }
    .pub-check-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #374151; cursor: pointer; }
    .pub-stars { display: flex; gap: 4px; }
    .pub-star { background: none; border: none; font-size: 28px; color: #d1d5db; cursor: pointer; transition: color 0.15s; padding: 0; line-height: 1; }
    .pub-star.active, .pub-star:hover { color: #f59e0b; }
    .pub-input { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; resize: vertical; }
    .pub-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .pub-form-actions { display: flex; justify-content: flex-end; gap: 12px; }

    .pub-reviews-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    .pub-review { padding: 20px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; }
    .pub-review__header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .pub-review__stars { color: #f59e0b; font-size: 16px; letter-spacing: 1px; }
    .pub-review__rating { font-size: 13px; font-weight: 600; color: #374151; }
    .pub-review__date { font-size: 12px; color: #9ca3af; margin-left: auto; }
    .pub-review__report { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px 4px; border-radius: 4px; transition: color 0.15s; }
    .pub-review__report:hover { color: #ef4444; }
    .pub-review__title { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 6px; }
    .pub-review__text { font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 8px; }
    .pub-review__pros, .pub-review__cons { font-size: 13px; color: #4b5563; margin-bottom: 4px; }
    .pub-review__pros span { color: #059669; font-weight: 600; }
    .pub-review__cons span { color: #dc2626; font-weight: 600; }
    .pub-review__status, .pub-review__anon { display: inline-block; font-size: 11px; color: #6b7280; background: #e5e7eb; padding: 2px 8px; border-radius: 999px; margin-top: 6px; margin-right: 4px; }

    .pub-empty-state { text-align: center; padding: 40px 24px; color: #9ca3af; font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; }

    .pub-vacancies { display: flex; flex-direction: column; gap: 10px; }
    .pub-vacancy-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #f9fafb; border-radius: 10px; text-decoration: none; transition: all 0.15s; }
    .pub-vacancy-card:hover { background: #eff6ff; transform: translateY(-1px); }
    .pub-vacancy-card__title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 6px; }
    .pub-vacancy-card__tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .pub-tag { padding: 2px 8px; background: #e5e7eb; border-radius: 999px; font-size: 12px; color: #4b5563; text-transform: capitalize; }
    .pub-vacancy-card__salary { font-size: 14px; font-weight: 600; color: #059669; white-space: nowrap; flex-shrink: 0; margin-left: 16px; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
    .modal-content { background: #fff; border-radius: 16px; padding: 28px; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.25); animation: modalIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
    .modal-close { background: none; border: none; font-size: 28px; color: #9ca3af; cursor: pointer; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    @media (max-width: 768px) {
      .pub-grid { grid-template-columns: 1fr; }
      .pub-hero__body { flex-direction: column; align-items: flex-start; }
      .pub-hero__actions { margin-left: 0; }
      .pub-vacancy-card { flex-direction: column; align-items: flex-start; gap: 10px; }
      .pub-vacancy-card__salary { margin-left: 0; }
      .pub-review-form { grid-template-columns: 1fr; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'pub-page', extraStyles: styles });
}

function initPublicProfileEvents(company, isAuthenticated) {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error(e); }
    });
  }

  // Follow company
  document.getElementById('follow-company-btn')?.addEventListener('click', async () => {
    if (!company) return;
    try {
      await applicationService.followCompany(company.id);
      store.addToast({ type: 'success', message: `Ahora sigues a ${company.name}` });
      const btn = document.getElementById('follow-company-btn');
      if (btn) { btn.innerHTML = `${check} Siguiendo`; btn.disabled = true; }
    } catch (err) {
      store.addToast({ type: 'error', message: err.response?.data?.message || 'Error al seguir empresa' });
    }
  });

  // Review form toggle
  const reviewFormCard = document.getElementById('review-form-card');
  document.getElementById('write-review-btn')?.addEventListener('click', () => {
    if (reviewFormCard) reviewFormCard.style.display = reviewFormCard.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('cancel-review')?.addEventListener('click', () => {
    if (reviewFormCard) reviewFormCard.style.display = 'none';
  });

  // Star rating interaction
  const stars = document.querySelectorAll('.pub-star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value);
      document.getElementById('review-rating').value = val;
      stars.forEach((s, i) => s.classList.toggle('active', i < val));
    });
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value);
      stars.forEach((s, i) => { s.style.color = i < val ? '#f59e0b' : '#d1d5db'; });
    });
  });
  document.querySelector('.pub-stars')?.addEventListener('mouseleave', () => {
    const current = parseInt(document.getElementById('review-rating')?.value || 0);
    stars.forEach((s, i) => { s.style.color = i < current ? '#f59e0b' : '#d1d5db'; });
  });

  // Submit review
  document.getElementById('review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!company) return;
    const rating = parseInt(document.getElementById('review-rating').value);
    const content = document.getElementById('review-text').value.trim();
    if (!rating || rating < 1) { store.addToast({ type: 'warning', message: 'Selecciona una calificación' }); return; }
    if (!content) { store.addToast({ type: 'warning', message: 'Escribe tu experiencia' }); return; }

    const data = {
      companyId: company.id,
      rating,
      title: document.getElementById('review-title').value.trim() || undefined,
      content,
      pros: document.getElementById('review-pros').value.trim() || undefined,
      cons: document.getElementById('review-cons').value.trim() || undefined,
      employmentStatus: document.getElementById('review-status').value || undefined,
      isAnonymous: document.getElementById('review-anon').checked,
    };

    try {
      await reviewService.createReview(data);
      store.addToast({ type: 'success', message: '¡Reseña publicada! Gracias por compartir tu experiencia.' });
      if (reviewFormCard) reviewFormCard.style.display = 'none';
      window.location.reload();
    } catch (err) {
      store.addToast({ type: 'error', message: err.response?.data?.message || 'Error al publicar reseña' });
    }
  });

  // Report review modal
  const reportModal = document.getElementById('report-review-modal');
  const closeReportModal = () => { if (reportModal) reportModal.style.display = 'none'; };

  document.querySelectorAll('.pub-review__report').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('report-review-id').value = btn.dataset.reviewId;
      if (reportModal) reportModal.style.display = 'flex';
    });
  });

  document.getElementById('close-report-review')?.addEventListener('click', closeReportModal);
  document.getElementById('cancel-report-review')?.addEventListener('click', closeReportModal);
  reportModal?.addEventListener('click', (e) => { if (e.target === reportModal) closeReportModal(); });

  document.getElementById('report-review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reviewId = document.getElementById('report-review-id').value;
    const reason = document.getElementById('report-review-reason').value;
    const details = document.getElementById('report-review-details').value.trim();
    if (!reason) { store.addToast({ type: 'warning', message: 'Selecciona un motivo' }); return; }

    try {
      await reviewService.reportReview(reviewId, reason, details);
      store.addToast({ type: 'success', message: 'Reporte enviado correctamente' });
      closeReportModal();
    } catch (err) {
      store.addToast({ type: 'error', message: err.response?.data?.message || 'Error al enviar reporte' });
    }
  });
}
