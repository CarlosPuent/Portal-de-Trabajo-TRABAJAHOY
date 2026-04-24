// Forum Page Controller — Category filtering, thread listing, create thread
import { forumService } from '@services/forum.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';
import { pin, lock } from '@utils/icons.js';

export async function initForumPage(params, query) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando foro...');

  try {
    const [threadsRaw, catRaw] = await Promise.all([
      forumService.getThreads({ limit: 50 }).catch(() => []),
      forumService.getCategories().catch(() => []),
    ]);

    // Normalize both array and envelope formats
    const threads = Array.isArray(threadsRaw) ? threadsRaw : (threadsRaw?.data || []);
    const categories = Array.isArray(catRaw) ? catRaw : (catRaw?.data || []);

    document.getElementById('app').innerHTML = getForumHTML(threads, categories, isAuthenticated, user);
    initForumEvents(categories);
  } catch (error) {
    console.error('Error loading forum:', error);
    document.getElementById('app').innerHTML = getForumHTML([], [], isAuthenticated, user);
    initForumEvents([]);
  }
}

function getForumHTML(threads, categories, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '/forum', isAuthenticated, user });

  const threadCard = (t) => {
    const authorName = t.author
      ? `${t.author.firstName || ''} ${t.author.lastName || ''}`.trim() || 'Anónimo'
      : 'Anónimo';
    const initial = authorName[0].toUpperCase();
    return `
      <article class="fr-thread" data-cat="${t.categoryId || ''}" data-id="${t.id}">
        <div class="fr-thread__avatar">${initial}</div>
        <div class="fr-thread__body">
          <div class="fr-thread__top">
            ${t.category?.name ? `<span class="fr-cat-badge">${t.category.name}</span>` : ''}
            ${t.isPinned ? `<span class="fr-pin-badge">${pin} Fijado</span>` : ''}
            ${t.isLocked ? `<span class="fr-lock-badge">${lock} Cerrado</span>` : ''}
          </div>
          <h3 class="fr-thread__title"><a href="#/forum/thread/${t.id}">${t.title || 'Sin título'}</a></h3>
          ${t.content ? `<p class="fr-thread__excerpt">${t.content.substring(0, 120)}${t.content.length > 120 ? '…' : ''}</p>` : ''}
          <div class="fr-thread__meta">
            <span class="fr-thread__author">Por ${authorName}</span>
            <span class="fr-thread__date">${formatters.relativeTime(t.createdAt)}</span>
            <span class="fr-thread__replies">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ${t.repliesCount ?? t.postCount ?? 0} respuesta${(t.repliesCount ?? t.postCount ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div class="fr-thread__arrow">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#d1d5db" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
      </article>
    `;
  };

  const threadsHTML = threads.length > 0
    ? threads.map(threadCard).join('')
    : `<div class="fr-empty">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <h3>No hay discusiones aún</h3>
        <p>Sé el primero en iniciar una conversación en la comunidad.</p>
        ${isAuthenticated ? '<button class="btn btn--primary" id="new-thread-btn-empty">+ Crear primera discusión</button>' : ''}
      </div>`;

  const mainContent = `
    <div class="fr-container">
      <!-- Header -->
      <div class="fr-header">
        <div>
          <h1 class="fr-title">Foro de la Comunidad</h1>
          <p class="fr-subtitle">Comparte experiencias, preguntas y conecta con otros profesionales</p>
        </div>
        ${isAuthenticated
          ? `<button class="btn btn--primary" id="new-thread-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva Discusión
            </button>`
          : `<a href="#/login" class="btn btn--outline">Inicia sesión para participar</a>`
        }
      </div>

      <!-- Category filters -->
      ${categories.length > 0 ? `
        <div class="fr-cats" id="fr-cats">
          <button class="fr-cat fr-cat--active" data-cat="">Todos (${threads.length})</button>
          ${categories.map(c => {
            const count = threads.filter(t => t.categoryId === c.id).length;
            return `<button class="fr-cat" data-cat="${c.id}">${c.name} (${count})</button>`;
          }).join('')}
        </div>
      ` : ''}

      <!-- Stats bar -->
      <div class="fr-stats">
        <span>${threads.length} hilo${threads.length !== 1 ? 's' : ''}</span>
        <span>${categories.length} categoría${categories.length !== 1 ? 's' : ''}</span>
        ${threads.reduce((s, t) => s + (t.repliesCount ?? t.postCount ?? 0), 0) > 0
          ? `<span>${threads.reduce((s, t) => s + (t.repliesCount ?? t.postCount ?? 0), 0)} respuestas</span>`
          : ''}
      </div>

      <!-- Thread list -->
      <div class="fr-threads" id="fr-threads">
        ${threadsHTML}
      </div>
    </div>

    <!-- New Thread Modal -->
    ${isAuthenticated ? `
      <div class="modal-overlay" id="new-thread-modal" style="display:none;">
        <div class="modal-content modal-content--lg">
          <div class="modal-header">
            <h2>Nueva Discusión</h2>
            <button class="modal-close" id="close-thread-modal">&times;</button>
          </div>
          <form id="new-thread-form">
            <div class="fr-field">
              <label class="fr-label">Título *</label>
              <input type="text" id="thread-title" class="fr-input" required placeholder="¿Cuál es tu pregunta o tema?" maxlength="200" />
              <span class="fr-char-count" id="title-count">0/200</span>
            </div>
            ${categories.length > 0 ? `
              <div class="fr-field">
                <label class="fr-label">Categoría</label>
                <select id="thread-category" class="fr-input">
                  <option value="">Sin categoría</option>
                  ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
            ` : ''}
            <div class="fr-field">
              <label class="fr-label">Contenido *</label>
              <textarea id="thread-content" class="fr-input fr-textarea" rows="6" required placeholder="Comparte tu experiencia, pregunta o idea con detalle..."></textarea>
            </div>
            <div class="fr-form-actions">
              <button type="button" class="btn btn--outline" id="cancel-thread">Cancelar</button>
              <button type="submit" class="btn btn--primary" id="submit-thread-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Publicar Discusión
              </button>
            </div>
          </form>
        </div>
      </div>
    ` : ''}
  `;

  const styles = `
    .fr-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 28px 0 60px; }
    .fr-container { max-width: 900px; margin: 0 auto; padding: 0 24px; }

    .fr-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
    .fr-title { font-size: 30px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .fr-subtitle { color: #6b7280; margin: 0; font-size: 15px; }

    .fr-cats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .fr-cat { padding: 7px 16px; border: 1px solid #e5e7eb; background: #fff; border-radius: 9999px; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; }
    .fr-cat:hover { border-color: #3b82f6; color: #3b82f6; }
    .fr-cat--active { background: #3b82f6; border-color: #3b82f6; color: #fff; }

    .fr-stats { display: flex; gap: 20px; font-size: 13px; color: #9ca3af; margin-bottom: 20px; padding: 12px 16px; background: #fff; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

    .fr-threads { display: flex; flex-direction: column; gap: 10px; }

    .fr-thread { display: flex; align-items: flex-start; gap: 14px; background: #fff; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); transition: all 0.2s; border: 2px solid transparent; cursor: pointer; }
    .fr-thread:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-color: #e0e7ff; transform: translateY(-1px); }
    .fr-thread__avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .fr-thread__body { flex: 1; min-width: 0; }
    .fr-thread__top { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
    .fr-cat-badge { display: inline-block; padding: 2px 10px; background: #dbeafe; color: #2563eb; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .fr-pin-badge { display: inline-block; padding: 2px 10px; background: #fef3c7; color: #92400e; border-radius: 999px; font-size: 11px; font-weight: 500; }
    .fr-lock-badge { display: inline-block; padding: 2px 10px; background: #fee2e2; color: #991b1b; border-radius: 999px; font-size: 11px; font-weight: 500; }
    .fr-thread__title { font-size: 16px; font-weight: 600; margin: 0 0 4px; }
    .fr-thread__title a { color: #111827; text-decoration: none; transition: color 0.15s; }
    .fr-thread__title a:hover { color: #3b82f6; }
    .fr-thread__excerpt { font-size: 13px; color: #6b7280; margin: 0 0 8px; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fr-thread__meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #9ca3af; align-items: center; }
    .fr-thread__replies { display: flex; align-items: center; gap: 4px; }
    .fr-thread__arrow { flex-shrink: 0; align-self: center; transition: transform 0.15s; }
    .fr-thread:hover .fr-thread__arrow svg { stroke: #3b82f6; }

    .fr-empty { text-align: center; padding: 80px 24px; background: #fff; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .fr-empty h3 { font-size: 20px; font-weight: 600; color: #374151; margin: 0; }
    .fr-empty p { color: #6b7280; margin: 0; }

    .fr-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; position: relative; }
    .fr-label { font-size: 14px; font-weight: 500; color: #374151; }
    .fr-input { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; width: 100%; box-sizing: border-box; }
    .fr-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .fr-textarea { resize: vertical; min-height: 140px; }
    .fr-char-count { position: absolute; right: 0; top: 0; font-size: 11px; color: #9ca3af; }
    .fr-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); overflow-y: auto; }
    .modal-content { background: #fff; border-radius: 16px; padding: 28px; max-width: 600px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.25); animation: modalIn 0.2s ease; margin: 20px 0; }
    .modal-content--lg { max-width: 600px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
    .modal-close { background: none; border: none; font-size: 28px; color: #9ca3af; cursor: pointer; line-height: 1; }
    .modal-close:hover { color: #111827; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    @media (max-width: 640px) {
      .fr-header { flex-direction: column; }
      .fr-thread { flex-direction: column; gap: 10px; }
      .fr-thread__arrow { display: none; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'fr-page', extraStyles: styles });
}

function initForumEvents(categories) {
  // Make entire thread card clickable
  document.querySelectorAll('.fr-thread').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't double-navigate if clicking the title <a> directly
      if (e.target.closest('a')) return;
      const id = card.dataset.id;
      if (id) window.location.hash = `#/forum/thread/${id}`;
    });
  });

  // Category filter
  document.querySelectorAll('.fr-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fr-cat').forEach(b => b.classList.remove('fr-cat--active'));
      btn.classList.add('fr-cat--active');
      const catId = btn.dataset.cat;
      document.querySelectorAll('.fr-thread').forEach(card => {
        card.style.display = (!catId || card.dataset.cat === catId) ? '' : 'none';
      });
    });
  });

  // Open new thread modal
  const modal = document.getElementById('new-thread-modal');
  const openModal = () => { if (modal) modal.style.display = 'flex'; };
  const closeModal = () => { if (modal) modal.style.display = 'none'; };

  document.getElementById('new-thread-btn')?.addEventListener('click', openModal);
  document.getElementById('new-thread-btn-empty')?.addEventListener('click', openModal);
  document.getElementById('close-thread-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-thread')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Char counter on title
  const titleInput = document.getElementById('thread-title');
  const titleCount = document.getElementById('title-count');
  titleInput?.addEventListener('input', () => {
    if (titleCount) titleCount.textContent = `${titleInput.value.length}/200`;
  });

  // Submit form
  document.getElementById('new-thread-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-thread-btn');
    const title = document.getElementById('thread-title')?.value.trim();
    const content = document.getElementById('thread-content')?.value.trim();
    const categoryId = document.getElementById('thread-category')?.value || undefined;

    if (!title || !content) return;

    try {
      btn.disabled = true;
      btn.textContent = 'Publicando...';
      const result = await forumService.createThread({ title, content, categoryId });
      const newThread = result?.data || result;
      store.addToast({ type: 'success', message: '¡Discusión creada exitosamente!' });
      closeModal();
      if (newThread?.id) {
        window.location.hash = `#/forum/thread/${newThread.id}`;
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      store.addToast({ type: 'error', message: err.response?.data?.message || 'Error al crear la discusión' });
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Publicar Discusión`;
    }
  });
}
