// Admin Resources Page - Create, edit, publish/archive resources
import { resourceService } from '@services/resource.service';
import { authService } from '@services/auth.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';

export async function initAdminResourcesPage(params, query) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando administración de recursos...');

  try {
    const [resData, catData] = await Promise.all([
      resourceService.getResources({ limit: 100, isPublished: '' }).catch(() => []),
      resourceService.getCategories().catch(() => []),
    ]);
    const resources = Array.isArray(resData) ? resData : (resData?.data || []);
    const categories = Array.isArray(catData) ? catData : (catData?.data || []);

    document.getElementById('app').innerHTML = getAdminResourcesHTML(resources, categories, isAuthenticated, user);
    initAdminResourcesEvents(resources, categories);
  } catch (error) {
    console.error('Error loading admin resources:', error);
    document.getElementById('app').innerHTML = getAdminResourcesHTML([], [], isAuthenticated, user);
    initAdminResourcesEvents([], []);
  }
}

function getAdminResourcesHTML(resources, categories, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '', isAuthenticated, user });

  const published = resources.filter(r => r.isPublished);
  const drafts = resources.filter(r => !r.isPublished);

  const resourceRow = (r) => `
    <div class="ar-row" data-id="${r.id}">
      <div class="ar-row__info">
        <h3 class="ar-row__title">${r.title || 'Sin título'}</h3>
        <div class="ar-row__meta">
          ${r.category?.name ? `<span class="ar-tag ar-tag--blue">${r.category.name}</span>` : ''}
          <span class="ar-tag ${r.isPublished ? 'ar-tag--green' : 'ar-tag--gray'}">${r.isPublished ? 'Publicado' : 'Borrador'}</span>
          ${r.readTimeMinutes ? `<span class="ar-row__time">${r.readTimeMinutes} min</span>` : ''}
          <span class="ar-row__date">${formatters.relativeTime(r.updatedAt || r.createdAt)}</span>
        </div>
      </div>
      <div class="ar-row__actions">
        <button class="btn btn--outline btn--sm edit-resource-btn" data-id="${r.id}">Editar</button>
        ${r.isPublished
          ? `<button class="btn btn--outline btn--sm archive-resource-btn" data-id="${r.id}">Archivar</button>`
          : `<button class="btn btn--primary btn--sm publish-resource-btn" data-id="${r.id}">Publicar</button>`
        }
        <button class="btn-icon-sm delete-resource-btn" data-id="${r.id}" title="Eliminar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  `;

  const mainContent = `
    <div class="ar-container">
      <div class="ar-header">
        <div>
          <h1 class="ar-title">Gestión de Recursos</h1>
          <p class="ar-subtitle">${resources.length} recursos · ${published.length} publicados · ${drafts.length} borradores</p>
        </div>
        <button class="btn btn--primary" id="create-resource-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Recurso
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="ar-tabs">
        <button class="ar-tab ar-tab--active" data-filter="all">Todos (${resources.length})</button>
        <button class="ar-tab" data-filter="published">Publicados (${published.length})</button>
        <button class="ar-tab" data-filter="draft">Borradores (${drafts.length})</button>
      </div>

      <!-- Resources List -->
      <div class="ar-list" id="ar-list">
        ${resources.length > 0
          ? resources.map(resourceRow).join('')
          : `<div class="ar-empty"><h3>No hay recursos</h3><p>Crea tu primer recurso para empezar.</p></div>`
        }
      </div>
    </div>

    <!-- Create/Edit Resource Modal -->
    <div class="modal-overlay" id="resource-modal" style="display:none;">
      <div class="modal-content modal-content--lg">
        <div class="modal-header">
          <h2 id="modal-title">Nuevo Recurso</h2>
          <button class="modal-close" id="close-resource-modal">&times;</button>
        </div>
        <form id="resource-form">
          <input type="hidden" id="resource-id" />
          <div class="ar-form-grid">
            <div class="ar-field ar-field--full">
              <label class="ar-label">Título *</label>
              <input type="text" id="res-title" class="ar-input" required placeholder="Título del recurso" />
            </div>
            <div class="ar-field">
              <label class="ar-label">Categoría</label>
              <select id="res-category" class="ar-input">
                <option value="">Sin categoría</option>
                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="ar-field">
              <label class="ar-label">Tiempo de lectura (min)</label>
              <input type="number" id="res-read-time" class="ar-input" min="1" placeholder="5" />
            </div>
            <div class="ar-field ar-field--full">
              <label class="ar-label">Resumen / Excerpt</label>
              <textarea id="res-excerpt" class="ar-input" rows="2" placeholder="Breve descripción del recurso..."></textarea>
            </div>
            <div class="ar-field ar-field--full">
              <label class="ar-label">Imagen de portada (URL)</label>
              <input type="url" id="res-cover" class="ar-input" placeholder="https://..." />
            </div>
            <div class="ar-field ar-field--full">
              <label class="ar-label">Contenido *</label>
              <textarea id="res-content" class="ar-input ar-textarea-lg" rows="10" required placeholder="Contenido del recurso (soporta HTML/Markdown)..."></textarea>
            </div>
          </div>
          <div class="ar-form-actions">
            <button type="button" class="btn btn--outline" id="cancel-resource">Cancelar</button>
            <button type="submit" class="btn btn--outline" id="save-draft-btn" name="action" value="draft">Guardar Borrador</button>
            <button type="submit" class="btn btn--primary" id="save-publish-btn" name="action" value="publish">Guardar y Publicar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const styles = `
    .ar-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 24px 0 60px; }
    .ar-container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
    .ar-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .ar-title { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .ar-subtitle { color: #6b7280; margin: 0; font-size: 14px; }

    .ar-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #fff; border-radius: 10px; padding: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .ar-tab { padding: 8px 16px; border: none; background: none; font-size: 14px; font-weight: 500; color: #6b7280; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
    .ar-tab:hover { background: #f3f4f6; }
    .ar-tab--active { background: #3b82f6; color: #fff; }

    .ar-list { display: flex; flex-direction: column; gap: 10px; }
    .ar-row { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 16px 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.15s; }
    .ar-row:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .ar-row__title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 6px; }
    .ar-row__meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .ar-tag { padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; }
    .ar-tag--blue { background: #dbeafe; color: #2563eb; }
    .ar-tag--green { background: #d1fae5; color: #059669; }
    .ar-tag--gray { background: #f3f4f6; color: #6b7280; }
    .ar-row__time { font-size: 12px; color: #9ca3af; }
    .ar-row__date { font-size: 12px; color: #9ca3af; }
    .ar-row__actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
    .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; transition: all 0.15s; }
    .btn-icon-sm:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

    .ar-empty { text-align: center; padding: 60px 24px; background: #fff; border-radius: 12px; }
    .ar-empty h3 { font-size: 18px; color: #374151; margin: 0 0 8px; }
    .ar-empty p { color: #6b7280; margin: 0; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); overflow-y: auto; }
    .modal-content { background: #fff; border-radius: 16px; padding: 28px; max-width: 700px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.25); animation: modalIn 0.2s ease; margin: 20px 0; }
    .modal-content--lg { max-width: 700px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 20px; color: #111827; }
    .modal-close { background: none; border: none; font-size: 28px; color: #9ca3af; cursor: pointer; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    .ar-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .ar-field { display: flex; flex-direction: column; gap: 6px; }
    .ar-field--full { grid-column: 1 / -1; }
    .ar-label { font-size: 14px; font-weight: 500; color: #374151; }
    .ar-input { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; }
    .ar-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .ar-textarea-lg { resize: vertical; min-height: 200px; font-family: 'Courier New', monospace; font-size: 13px; }
    .ar-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

    @media (max-width: 768px) {
      .ar-row { flex-direction: column; align-items: flex-start; gap: 12px; }
      .ar-row__actions { width: 100%; flex-wrap: wrap; }
      .ar-form-grid { grid-template-columns: 1fr; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'ar-page', extraStyles: styles });
}

function initAdminResourcesEvents(resources, categories) {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await authService.logout(); window.location.hash = '#/'; } catch (e) { console.error(e); }
    });
  }

  const modal = document.getElementById('resource-modal');
  const closeModal = () => { if (modal) modal.style.display = 'none'; };

  // Filter tabs
  document.querySelectorAll('.ar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ar-tab').forEach(t => t.classList.remove('ar-tab--active'));
      tab.classList.add('ar-tab--active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.ar-row').forEach(row => {
        const r = resources.find(res => res.id === row.dataset.id);
        if (!r) return;
        if (filter === 'all') { row.style.display = ''; }
        else if (filter === 'published') { row.style.display = r.isPublished ? '' : 'none'; }
        else { row.style.display = !r.isPublished ? '' : 'none'; }
      });
    });
  });

  // Create resource
  document.getElementById('create-resource-btn')?.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Nuevo Recurso';
    document.getElementById('resource-id').value = '';
    document.getElementById('resource-form').reset();
    if (modal) modal.style.display = 'flex';
  });

  // Edit resource
  document.querySelectorAll('.edit-resource-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = resources.find(res => res.id === btn.dataset.id);
      if (!r) return;
      document.getElementById('modal-title').textContent = 'Editar Recurso';
      document.getElementById('resource-id').value = r.id;
      document.getElementById('res-title').value = r.title || '';
      document.getElementById('res-category').value = r.categoryId || '';
      document.getElementById('res-read-time').value = r.readTimeMinutes || '';
      document.getElementById('res-excerpt').value = r.excerpt || '';
      document.getElementById('res-cover').value = r.coverImageUrl || '';
      document.getElementById('res-content').value = r.content || '';
      if (modal) modal.style.display = 'flex';
    });
  });

  document.getElementById('close-resource-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-resource')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Save resource form
  let publishOnSave = false;
  document.getElementById('save-draft-btn')?.addEventListener('click', () => { publishOnSave = false; });
  document.getElementById('save-publish-btn')?.addEventListener('click', () => { publishOnSave = true; });

  document.getElementById('resource-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('resource-id').value;
    const data = {
      title: document.getElementById('res-title').value.trim(),
      categoryId: document.getElementById('res-category').value || undefined,
      readTimeMinutes: document.getElementById('res-read-time').value ? parseInt(document.getElementById('res-read-time').value) : undefined,
      excerpt: document.getElementById('res-excerpt').value.trim() || undefined,
      coverImageUrl: document.getElementById('res-cover').value.trim() || undefined,
      content: document.getElementById('res-content').value.trim(),
      isPublished: publishOnSave,
      ...(publishOnSave ? { publishedAt: new Date().toISOString() } : {}),
    };

    try {
      if (id) {
        await resourceService.updateResource(id, data);
        store.addToast({ type: 'success', message: 'Recurso actualizado' });
      } else {
        await resourceService.createResource(data);
        store.addToast({ type: 'success', message: publishOnSave ? 'Recurso publicado' : 'Borrador guardado' });
      }
      closeModal();
      window.location.reload();
    } catch (err) {
      store.addToast({ type: 'error', message: err.response?.data?.message || 'Error al guardar recurso' });
    }
  });

  // Publish resource
  document.querySelectorAll('.publish-resource-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await resourceService.updateResource(btn.dataset.id, { isPublished: true, publishedAt: new Date().toISOString() });
        store.addToast({ type: 'success', message: 'Recurso publicado' });
        window.location.reload();
      } catch (err) {
        store.addToast({ type: 'error', message: 'Error al publicar' });
      }
    });
  });

  // Archive resource
  document.querySelectorAll('.archive-resource-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await resourceService.updateResource(btn.dataset.id, { isPublished: false });
        store.addToast({ type: 'success', message: 'Recurso archivado' });
        window.location.reload();
      } catch (err) {
        store.addToast({ type: 'error', message: 'Error al archivar' });
      }
    });
  });

  // Delete resource
  document.querySelectorAll('.delete-resource-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este recurso permanentemente?')) return;
      try {
        await resourceService.deleteResource(btn.dataset.id);
        store.addToast({ type: 'success', message: 'Recurso eliminado' });
        btn.closest('.ar-row')?.remove();
      } catch (err) {
        store.addToast({ type: 'error', message: 'Error al eliminar' });
      }
    });
  });
}
