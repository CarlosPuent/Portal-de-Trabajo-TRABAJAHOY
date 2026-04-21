// Forum Thread Page - View thread with posts, reply, report
import { forumService } from '@services/forum.service';
import { authService } from '@services/auth.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';
import { pin, lock, flag, trash } from '@utils/icons.js';

export async function initForumThreadPage(threadId) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando hilo...');

  try {
    const [threadData, postsData] = await Promise.all([
      forumService.getThreadById(threadId).catch(() => null),
      forumService.getPosts(threadId).catch(() => []),
    ]);
    const thread = threadData?.data || threadData || null;
    const posts = Array.isArray(postsData) ? postsData : (postsData?.data || []);

    document.getElementById('app').innerHTML = getThreadHTML(thread, posts, threadId, isAuthenticated, user);
    initThreadEvents(thread, threadId, isAuthenticated);
  } catch (error) {
    console.error('Error loading thread:', error);
    document.getElementById('app').innerHTML = getThreadHTML(null, [], threadId, isAuthenticated, user);
    initThreadEvents(null, threadId, isAuthenticated);
  }
}

function getThreadHTML(thread, posts, threadId, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: 'forum', isAuthenticated, user });

  if (!thread) {
    return renderPage({
      navbar,
      main: `<div class="ft-container"><div class="ft-empty"><h2>Hilo no encontrado</h2><a href="#/forum" class="btn btn--primary">Volver al Foro</a></div></div>`,
      pageClass: 'ft-page',
      extraStyles: `.ft-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 40px 0; } .ft-container { max-width: 800px; margin: 0 auto; padding: 0 24px; } .ft-empty { text-align: center; padding: 80px 24px; } .ft-empty h2 { margin-bottom: 20px; }`,
    });
  }

  const author = thread.author || {};
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Anónimo';
  const isAdmin = store.isAdmin() || store.isModerator();
  const userId = user?.id;

  const mainContent = `
    <div class="ft-container">
      <a href="#/forum" class="ft-back">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Volver al Foro
      </a>

      <!-- Thread -->
      <div class="ft-thread">
        <div class="ft-thread__header">
          <div class="ft-thread__avatar">${authorName[0]}</div>
          <div class="ft-thread__author-info">
            <strong class="ft-thread__author-name">${authorName}</strong>
            <span class="ft-thread__date">${formatters.relativeTime(thread.createdAt)}</span>
          </div>
          ${thread.isPinned ? `<span class="ft-pin-badge">${pin} Fijado</span>` : ''}
          ${thread.isLocked ? `<span class="ft-lock-badge">${lock} Cerrado</span>` : ''}
          <div class="ft-thread__actions">
            ${isAuthenticated ? `<button class="ft-action-btn" id="report-thread-btn" title="Reportar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </button>` : ''}
            ${isAdmin || author.id === userId ? `<button class="ft-action-btn ft-action-btn--danger" id="delete-thread-btn" title="Eliminar hilo">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>` : ''}
          </div>
        </div>
        ${thread.category ? `<span class="ft-category-tag">${thread.category.name}</span>` : ''}
        <h1 class="ft-thread__title">${thread.title}</h1>
        <div class="ft-thread__content">${thread.content || ''}</div>
      </div>

      <!-- Posts / Replies -->
      <div class="ft-posts-header">
        <h2 class="ft-posts-title">Respuestas (${posts.length})</h2>
      </div>

      <div class="ft-posts-list">
        ${posts.length > 0 ? posts.map(post => {
          const pAuthor = post.author || {};
          const pName = `${pAuthor.firstName || ''} ${pAuthor.lastName || ''}`.trim() || 'Anónimo';
          return `
            <div class="ft-post" data-post-id="${post.id}">
              <div class="ft-post__avatar">${pName[0]}</div>
              <div class="ft-post__body">
                <div class="ft-post__header">
                  <strong class="ft-post__name">${pName}</strong>
                  <span class="ft-post__date">${formatters.relativeTime(post.createdAt)}</span>
                  <div class="ft-post__actions">
                    ${isAuthenticated ? `<button class="ft-small-btn report-post-btn" data-post-id="${post.id}" title="Reportar">${flag}</button>` : ''}
                    ${isAdmin || pAuthor.id === userId ? `<button class="ft-small-btn delete-post-btn" data-post-id="${post.id}" title="Eliminar">${trash}</button>` : ''}
                  </div>
                </div>
                <div class="ft-post__content">${post.content || ''}</div>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="ft-no-posts">
            <p>Aún no hay respuestas. ¡Sé el primero en responder!</p>
          </div>
        `}
      </div>

      <!-- Reply Form -->
      ${isAuthenticated && !thread.isLocked ? `
        <div class="ft-reply-section">
          <h3 class="ft-reply-title">Tu Respuesta</h3>
          <form id="reply-form">
            <textarea id="reply-content" class="ft-reply-input" rows="4" placeholder="Escribe tu respuesta..." required></textarea>
            <div class="ft-reply-actions">
              <button type="submit" class="btn btn--primary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Responder
              </button>
            </div>
          </form>
        </div>
      ` : thread?.isLocked ? `
        <div class="ft-locked-msg">
          <p>${lock} Este hilo ha sido cerrado y no acepta nuevas respuestas.</p>
        </div>
      ` : `
        <div class="ft-locked-msg">
          <p><a href="#/login">Inicia sesión</a> para responder a este hilo.</p>
        </div>
      `}
    </div>

    <!-- Report Modal -->
    <div class="modal-overlay" id="report-modal" style="display:none;">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Reportar Contenido</h2>
          <button class="modal-close" id="close-report-modal">&times;</button>
        </div>
        <form id="report-form">
          <input type="hidden" id="report-type" />
          <input type="hidden" id="report-target-id" />
          <div class="ft-field">
            <label class="ft-label">Motivo del reporte</label>
            <select id="report-reason" class="ft-input" required>
              <option value="">Seleccionar motivo...</option>
              <option value="spam">Spam o publicidad</option>
              <option value="offensive">Contenido ofensivo</option>
              <option value="harassment">Acoso</option>
              <option value="misinformation">Información falsa</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div class="ft-field" style="margin-top:12px;">
            <label class="ft-label">Detalles (opcional)</label>
            <textarea id="report-details" class="ft-input" rows="3" placeholder="Describe el problema..."></textarea>
          </div>
          <div class="ft-form-actions" style="margin-top:16px;">
            <button type="button" class="btn btn--outline" id="cancel-report">Cancelar</button>
            <button type="submit" class="btn btn--primary">Enviar Reporte</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const styles = `
    .ft-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 24px 0 60px; }
    .ft-container { max-width: 800px; margin: 0 auto; padding: 0 24px; }
    .ft-back { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; text-decoration: none; font-size: 14px; margin-bottom: 20px; transition: color 0.15s; }
    .ft-back:hover { color: #111827; }

    .ft-thread { background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 24px; }
    .ft-thread__header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .ft-thread__avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .ft-thread__author-name { color: #111827; font-size: 15px; display: block; }
    .ft-thread__date { font-size: 13px; color: #9ca3af; }
    .ft-pin-badge, .ft-lock-badge { font-size: 12px; padding: 3px 10px; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 500; }
    .ft-lock-badge { background: #fee2e2; color: #991b1b; }
    .ft-thread__actions { margin-left: auto; display: flex; gap: 6px; }
    .ft-action-btn { background: none; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px; cursor: pointer; color: #6b7280; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
    .ft-action-btn:hover { background: #f3f4f6; color: #111827; }
    .ft-action-btn--danger:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
    .ft-category-tag { display: inline-block; padding: 3px 10px; background: #dbeafe; color: #2563eb; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
    .ft-thread__title { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 16px; }
    .ft-thread__content { font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-line; }

    .ft-posts-header { margin-bottom: 16px; }
    .ft-posts-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0; }

    .ft-posts-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .ft-post { display: flex; gap: 14px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .ft-post__avatar { width: 36px; height: 36px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; flex-shrink: 0; }
    .ft-post__body { flex: 1; }
    .ft-post__header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .ft-post__name { font-size: 14px; color: #111827; }
    .ft-post__date { font-size: 12px; color: #9ca3af; }
    .ft-post__actions { margin-left: auto; display: flex; gap: 4px; }
    .ft-small-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px 6px; border-radius: 4px; transition: background 0.15s; }
    .ft-small-btn:hover { background: #f3f4f6; }
    .ft-post__content { font-size: 15px; color: #374151; line-height: 1.6; white-space: pre-line; }
    .ft-no-posts { text-align: center; padding: 40px; background: #fff; border-radius: 12px; color: #9ca3af; }

    .ft-reply-section { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .ft-reply-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px; }
    .ft-reply-input { width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 15px; font-family: inherit; resize: vertical; outline: none; min-height: 100px; transition: border-color 0.15s; }
    .ft-reply-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .ft-reply-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
    .ft-locked-msg { text-align: center; padding: 24px; background: #fff; border-radius: 12px; color: #6b7280; font-size: 15px; }
    .ft-locked-msg a { color: #3b82f6; }

    .ft-field { display: flex; flex-direction: column; gap: 6px; }
    .ft-label { font-size: 14px; font-weight: 500; color: #374151; }
    .ft-input { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; }
    .ft-input:focus { border-color: #3b82f6; }
    .ft-form-actions { display: flex; justify-content: flex-end; gap: 12px; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
    .modal-content { background: #fff; border-radius: 16px; padding: 28px; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: modalIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
    .modal-close { background: none; border: none; font-size: 28px; color: #9ca3af; cursor: pointer; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'ft-page', extraStyles: styles });
}

function initThreadEvents(thread, threadId, isAuthenticated) {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error(e); }
    });
  }

  // Reply form
  document.getElementById('reply-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('reply-content').value.trim();
    if (!content) return;

    const btn = e.target.querySelector('[type="submit"]');
    const originalHTML = btn?.innerHTML;
    if (btn) { btn.disabled = true; btn.textContent = 'Publicando...'; }

    try {
      await forumService.addPost(threadId, content);
      store.addToast({ type: 'success', message: 'Respuesta publicada' });
      // Re-trigger the route so the page re-renders with the new post
      const hash = window.location.hash;
      window.location.hash = '';
      setTimeout(() => { window.location.hash = hash; }, 0);
    } catch (err) {
      store.addToast({ type: 'error', message: err?.response?.data?.message || 'Error al publicar respuesta' });
      if (btn) { btn.disabled = false; btn.innerHTML = originalHTML; }
    }
  });

  // Delete thread
  document.getElementById('delete-thread-btn')?.addEventListener('click', async () => {
    if (!confirm('¿Eliminar este hilo y todas sus respuestas?')) return;
    try {
      await forumService.deleteThread(threadId);
      store.addToast({ type: 'success', message: 'Hilo eliminado' });
      window.location.hash = '#/forum';
    } catch (err) {
      store.addToast({ type: 'error', message: 'Error al eliminar hilo' });
    }
  });

  // Delete post
  document.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta respuesta?')) return;
      try {
        await forumService.deletePost(btn.dataset.postId);
        store.addToast({ type: 'success', message: 'Respuesta eliminada' });
        btn.closest('.ft-post')?.remove();
      } catch (err) {
        store.addToast({ type: 'error', message: 'Error al eliminar respuesta' });
      }
    });
  });

  // Report modal
  const reportModal = document.getElementById('report-modal');
  const openReport = (type, targetId) => {
    document.getElementById('report-type').value = type;
    document.getElementById('report-target-id').value = targetId;
    if (reportModal) reportModal.style.display = 'flex';
  };
  const closeReport = () => { if (reportModal) reportModal.style.display = 'none'; };

  document.getElementById('report-thread-btn')?.addEventListener('click', () => openReport('thread', threadId));
  document.querySelectorAll('.report-post-btn').forEach(btn => {
    btn.addEventListener('click', () => openReport('post', btn.dataset.postId));
  });
  document.getElementById('close-report-modal')?.addEventListener('click', closeReport);
  document.getElementById('cancel-report')?.addEventListener('click', closeReport);
  reportModal?.addEventListener('click', (e) => { if (e.target === reportModal) closeReport(); });

  document.getElementById('report-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('report-type').value;
    const targetId = document.getElementById('report-target-id').value;
    const reason = document.getElementById('report-reason').value;
    const details = document.getElementById('report-details').value.trim();

    if (!reason) { store.addToast({ type: 'warning', message: 'Selecciona un motivo' }); return; }

    try {
      if (type === 'thread') {
        await forumService.reportThread(targetId, reason, details);
      } else {
        await forumService.reportPost(targetId, reason, details);
      }
      store.addToast({ type: 'success', message: 'Reporte enviado. Gracias por ayudar a mantener la comunidad.' });
      closeReport();
    } catch (err) {
      store.addToast({ type: 'error', message: err.response?.data?.message || 'Error al enviar reporte' });
    }
  });
}
