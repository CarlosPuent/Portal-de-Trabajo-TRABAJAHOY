// Resources Page Controller — Public listing with category filters and search
import { resourceService } from '@services/resource.service';
import { store } from '@core/store';
import { showLoading, renderNavbar, renderPage } from '@utils/ui.js';
import { formatters } from '@utils/formatters.js';
import { starFilled } from '@utils/icons.js';

export async function initResourcesPage(params, query) {
  const isAuthenticated = store.get('isAuthenticated');
  const user = store.get('user');

  showLoading('Cargando recursos...');

  try {
    const [resRaw, catRaw] = await Promise.all([
      resourceService.getResources({ limit: 100 }).catch(() => []),
      resourceService.getCategories().catch(() => []),
    ]);

    // Normalize both array and envelope formats
    const resources = Array.isArray(resRaw) ? resRaw : (resRaw?.data || []);
    const categories = Array.isArray(catRaw) ? catRaw : (catRaw?.data || []);

    // Only show published resources to regular users
    const published = resources.filter(r => r.status === 'published');

    document.getElementById('app').innerHTML = getResourcesHTML(published, categories, isAuthenticated, user);
    initResourcesEvents(published);
  } catch (error) {
    console.error('Error loading resources:', error);
    document.getElementById('app').innerHTML = getResourcesHTML([], [], isAuthenticated, user);
    initResourcesEvents([]);
  }
}

function getResourcesHTML(resources, categories, isAuthenticated, user) {
  const navbar = renderNavbar({ activeRoute: '/resources', isAuthenticated, user });

  const isAdmin = store.isAdmin?.() || store.isModerator?.();

  const resourceCard = (r) => {
    const catName = r.category?.name || '';
    const avgRating = r.averageRating ? parseFloat(r.averageRating).toFixed(1) : null;
    const excerpt = r.summary || (r.content ? r.content.replace(/<[^>]+>/g, '').substring(0, 140) + '…' : 'Sin descripción');

    return `
      <a href="#/resources/${r.id}" class="rc-card" data-cat="${r.categoryId || ''}" data-title="${(r.title || '').toLowerCase()}">
        ${r.coverUrl ? `<div class="rc-card__cover" style="background-image:url('${r.coverUrl}')"></div>` : `<div class="rc-card__cover rc-card__cover--placeholder"></div>`}
        <div class="rc-card__body">
          ${catName ? `<span class="rc-card__cat">${catName}</span>` : ''}
          <h3 class="rc-card__title">${r.title || 'Sin título'}</h3>
          <p class="rc-card__excerpt">${excerpt}</p>
          <div class="rc-card__footer">
            ${r.readTimeMinutes ? `<span class="rc-card__meta-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${r.readTimeMinutes} min
            </span>` : ''}
            ${avgRating ? `<span class="rc-card__meta-item rc-card__meta-item--rating">${starFilled(13)} ${avgRating}</span>` : ''}
            ${r.publishedAt ? `<span class="rc-card__meta-item">${formatters.date(r.publishedAt)}</span>` : ''}
            <span class="rc-card__read-more">Leer →</span>
          </div>
        </div>
      </a>
    `;
  };

  const mainContent = `
    <div class="rp-container">
      <!-- Hero header -->
      <div class="rp-hero">
        <div>
          <h1 class="rp-title">Recursos Profesionales</h1>
          <p class="rp-subtitle">Artículos, guías y consejos para impulsar tu carrera</p>
        </div>
        ${isAdmin ? `<a href="#/admin/resources" class="btn btn--outline">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Gestionar Recursos
        </a>` : ''}
      </div>

      <!-- Search + filters -->
      <div class="rp-controls">
        <div class="rp-search-wrap">
          <svg class="rp-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="resources-search" class="rp-search" placeholder="Buscar recursos..." />
        </div>
        <div class="rp-sort">
          <select id="resources-sort" class="rp-select">
            <option value="recent">Más recientes</option>
            <option value="rating">Mejor valorados</option>
            <option value="read-time">Lectura más corta</option>
          </select>
        </div>
      </div>

      <!-- Category filters -->
      ${categories.length > 0 ? `
        <div class="rp-cats" id="rp-cats">
          <button class="rp-cat rp-cat--active" data-cat="">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Todos (${resources.length})
          </button>
          ${categories.map(c => {
            const count = resources.filter(r => r.categoryId === c.id).length;
            return `<button class="rp-cat" data-cat="${c.id}">${c.name} (${count})</button>`;
          }).join('')}
        </div>
      ` : ''}

      <!-- Results count -->
      <p class="rp-count" id="rp-count">${resources.length} recurso${resources.length !== 1 ? 's' : ''} disponible${resources.length !== 1 ? 's' : ''}</p>

      <!-- Resources grid -->
      <div class="rp-grid" id="rp-grid">
        ${resources.length > 0
          ? resources.map(resourceCard).join('')
          : `<div class="rp-empty">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#d1d5db" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <h3>No hay recursos publicados</h3>
              <p>Los recursos estarán disponibles próximamente.</p>
            </div>`
        }
      </div>

      <!-- No results message (hidden by default) -->
      <div class="rp-no-results" id="rp-no-results" style="display:none;">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3>Sin resultados</h3>
        <p>Prueba con otros términos o cambia la categoría.</p>
        <button class="btn btn--outline btn--sm" id="clear-filters-btn">Limpiar filtros</button>
      </div>
    </div>
  `;

  const styles = `
    .rp-page { min-height: calc(100vh - 70px); background: #f3f4f6; padding: 28px 0 60px; }
    .rp-container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }

    .rp-hero { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
    .rp-title { font-size: 30px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .rp-subtitle { color: #6b7280; margin: 0; font-size: 15px; }

    .rp-controls { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .rp-search-wrap { position: relative; flex: 1; min-width: 220px; }
    .rp-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
    .rp-search { width: 100%; padding: 10px 14px 10px 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; background: #fff; outline: none; font-family: inherit; box-sizing: border-box; }
    .rp-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .rp-select { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; background: #fff; color: #374151; cursor: pointer; font-family: inherit; outline: none; }
    .rp-select:focus { border-color: #3b82f6; }

    .rp-cats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .rp-cat { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border: 1px solid #e5e7eb; background: #fff; border-radius: 9999px; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; }
    .rp-cat:hover { border-color: #3b82f6; color: #3b82f6; }
    .rp-cat--active { background: #3b82f6; border-color: #3b82f6; color: #fff; }

    .rp-count { font-size: 13px; color: #9ca3af; margin: 0 0 16px; }

    .rp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 22px; }

    .rc-card { display: flex; flex-direction: column; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); text-decoration: none; transition: all 0.2s ease; border: 2px solid transparent; }
    .rc-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-3px); border-color: #e0e7ff; }
    .rc-card__cover { height: 150px; background-position: center; background-size: cover; }
    .rc-card__cover--placeholder { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .rc-card__body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .rc-card__cat { display: inline-block; font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .rc-card__title { font-size: 17px; font-weight: 700; color: #111827; margin: 0 0 8px; line-height: 1.3; }
    .rc-card__excerpt { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0 0 16px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .rc-card__footer { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: auto; }
    .rc-card__meta-item { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #9ca3af; }
    .rc-card__meta-item--rating { color: #f59e0b; font-weight: 600; }
    .rc-card__read-more { margin-left: auto; font-size: 13px; font-weight: 600; color: #3b82f6; }

    .rp-empty { grid-column: 1 / -1; text-align: center; padding: 80px 24px; background: #fff; border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .rp-empty h3, .rp-no-results h3 { font-size: 20px; font-weight: 600; color: #374151; margin: 0; }
    .rp-empty p, .rp-no-results p { color: #6b7280; margin: 0; }

    .rp-no-results { text-align: center; padding: 60px 24px; background: #fff; border-radius: 14px; flex-direction: column; align-items: center; gap: 12px; }

    @media (max-width: 640px) {
      .rp-hero { flex-direction: column; }
      .rp-grid { grid-template-columns: 1fr; }
    }
  `;

  return renderPage({ navbar, main: mainContent, pageClass: 'rp-page', extraStyles: styles });
}

function initResourcesEvents(resources) {
  let activeCat = '';
  let searchTerm = '';
  let sortBy = 'recent';

  function applyFilters() {
    const grid = document.getElementById('rp-grid');
    const noResults = document.getElementById('rp-no-results');
    const countEl = document.getElementById('rp-count');
    const cards = grid ? grid.querySelectorAll('.rc-card') : [];
    let visible = 0;

    cards.forEach(card => {
      const matchCat = !activeCat || card.dataset.cat === activeCat;
      const matchSearch = !searchTerm || card.dataset.title.includes(searchTerm);
      const show = matchCat && matchSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countEl) countEl.textContent = `${visible} recurso${visible !== 1 ? 's' : ''} disponible${visible !== 1 ? 's' : ''}`;
    if (noResults) noResults.style.display = visible === 0 && resources.length > 0 ? 'flex' : 'none';
  }

  // Category filter
  document.querySelectorAll('.rp-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rp-cat').forEach(b => b.classList.remove('rp-cat--active'));
      btn.classList.add('rp-cat--active');
      activeCat = btn.dataset.cat;
      applyFilters();
    });
  });

  // Search
  const searchInput = document.getElementById('resources-search');
  let searchTimeout;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchTerm = searchInput.value.trim().toLowerCase();
      applyFilters();
    }, 200);
  });

  // Sort
  document.getElementById('resources-sort')?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    const grid = document.getElementById('rp-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.rc-card'));
    const sorted = [...resources].sort((a, b) => {
      if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortBy === 'read-time') return (a.readTimeMinutes || 999) - (b.readTimeMinutes || 999);
      // recent (default)
      return new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0);
    });

    // Reorder cards in the DOM
    sorted.forEach(r => {
      const card = grid.querySelector(`.rc-card[href="#/resources/${r.id}"]`);
      if (card) grid.appendChild(card);
    });

    applyFilters();
  });

  // Clear filters
  document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
    searchTerm = '';
    activeCat = '';
    sortBy = 'recent';
    const searchEl = document.getElementById('resources-search');
    if (searchEl) searchEl.value = '';
    const sortEl = document.getElementById('resources-sort');
    if (sortEl) sortEl.value = 'recent';
    document.querySelectorAll('.rp-cat').forEach((b, i) => b.classList.toggle('rp-cat--active', i === 0));
    applyFilters();
  });
}
