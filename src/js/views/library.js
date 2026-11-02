/**
 * Between the Pages - My Library (Digital Bookshelf) View
 */

import { stateManager } from '../state.js';
import { getIcon } from '../icons.js';
import { openBookDetailModal, openBookFormModal, openConfirmModal } from '../modals.js';
import { showToast } from '../toast.js';

let currentFilter = {
  search: '',
  genre: 'All',
  status: 'All',
  sortBy: 'dateAdded', // 'dateAdded' | 'title' | 'author' | 'rating' | 'progress'
  favoritesOnly: false
};

export function renderLibrary(container) {
  if (!container) return;

  const allBooks = stateManager.getBooks();
  const viewMode = stateManager.getLibraryViewMode(); // 'grid' | 'list'

  // Extract all distinct genres
  const genres = ['All', ...new Set(allBooks.map(b => b.genre).filter(Boolean))].sort();

  // Filter books
  const filteredBooks = allBooks.filter(book => {
    // Search query
    if (currentFilter.search) {
      const q = currentFilter.search.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor) return false;
    }

    // Genre filter
    if (currentFilter.genre !== 'All' && book.genre !== currentFilter.genre) {
      return false;
    }

    // Status filter
    if (currentFilter.status !== 'All' && book.status !== currentFilter.status) {
      return false;
    }

    // Favorites only
    if (currentFilter.favoritesOnly && !book.isFavorite) {
      return false;
    }

    return true;
  });

  // Sort books
  filteredBooks.sort((a, b) => {
    if (currentFilter.sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (currentFilter.sortBy === 'author') {
      return a.author.localeCompare(b.author);
    }
    if (currentFilter.sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (currentFilter.sortBy === 'progress') {
      const pA = (a.currentPage / (a.totalPages || 1));
      const pB = (b.currentPage / (b.totalPages || 1));
      return pB - pA;
    }
    // Default: date added descending
    return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
  });

  container.innerHTML = `
    <header class="page-header">
      <div>
        <h1 class="page-title">My Digital Bookshelf</h1>
        <p class="page-subtitle">Your personal library of stories, essays, and volumes collected over time.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-lib-add-book">
          ${getIcon('plus')} Add New Book
        </button>
      </div>
    </header>

    <!-- Interactive Filter & Search Toolbar -->
    <div class="library-filter-toolbar">
      <div class="toolbar-primary-row">
        <!-- Search Input -->
        <div class="search-input-wrap">
          <span class="search-icon">${getIcon('search')}</span>
          <input 
            type="text" 
            class="input-search" 
            id="lib-search-input" 
            placeholder="Search by book title or author..."
            value="${escapeHtml(currentFilter.search)}"
          />
        </div>

        <!-- Controls: Genre, Sort, View Toggle -->
        <div class="toolbar-controls-group">
          <!-- Genre Dropdown -->
          <select class="select-control" id="lib-genre-select" title="Filter by genre">
            ${genres.map(g => `<option value="${g}" ${currentFilter.genre === g ? 'selected' : ''}>${g === 'All' ? 'All Genres' : g}</option>`).join('')}
          </select>

          <!-- Sort Dropdown -->
          <select class="select-control" id="lib-sort-select" title="Sort books">
            <option value="dateAdded" ${currentFilter.sortBy === 'dateAdded' ? 'selected' : ''}>Recently Added</option>
            <option value="title" ${currentFilter.sortBy === 'title' ? 'selected' : ''}>Title (A–Z)</option>
            <option value="author" ${currentFilter.sortBy === 'author' ? 'selected' : ''}>Author (A–Z)</option>
            <option value="rating" ${currentFilter.sortBy === 'rating' ? 'selected' : ''}>Highest Rated</option>
            <option value="progress" ${currentFilter.sortBy === 'progress' ? 'selected' : ''}>Reading Progress</option>
          </select>

          <!-- Favorites Filter Toggle -->
          <button 
            class="btn btn-secondary btn-sm ${currentFilter.favoritesOnly ? 'active' : ''}" 
            id="btn-fav-filter" 
            style="${currentFilter.favoritesOnly ? 'background-color: var(--accent-rose-light); color: var(--accent-rose-dark); border-color: var(--accent-rose);' : ''}"
            title="Toggle favorites"
          >
            ${getIcon('heart')} ${currentFilter.favoritesOnly ? 'Favorites' : 'All'}
          </button>

          <!-- View Mode Toggle (Grid / List) -->
          <div class="view-toggle-wrap">
            <button class="btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}" id="btn-toggle-grid" title="Grid View">
              ${getIcon('grid')}
            </button>
            <button class="btn-view-toggle ${viewMode === 'list' ? 'active' : ''}" id="btn-toggle-list" title="List View">
              ${getIcon('list')}
            </button>
          </div>
        </div>
      </div>

      <!-- Reading Status Filter Tabs -->
      <div class="status-tabs-row" role="tablist">
        ${['All', 'Currently Reading', 'Want to Read', 'Completed', 'On Hold', 'Dropped'].map(st => `
          <button 
            class="status-tab ${currentFilter.status === st ? 'active' : ''}" 
            data-status="${st}"
            role="tab"
          >
            ${st === 'All' ? `All (${allBooks.length})` : `${st} (${allBooks.filter(b => b.status === st).length})`}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Books Presentation Area -->
    <div id="library-books-container">
      ${filteredBooks.length > 0 ? (
        viewMode === 'grid' ? renderBooksGrid(filteredBooks) : renderBooksList(filteredBooks)
      ) : `
        <div class="empty-state">
          <div class="empty-state-icon">${getIcon('search')}</div>
          <h3 class="empty-state-title">No books match your criteria</h3>
          <p class="empty-state-desc">Try clearing your search terms or selecting a different status filter.</p>
          <button class="btn btn-secondary" id="btn-reset-filters">Reset All Filters</button>
        </div>
      `}
    </div>
  `;

  bindLibraryEvents(container);
}

function renderBooksGrid(books) {
  return `
    <div class="bookshelf-grid">
      ${books.map(book => {
        const percent = Math.min(100, Math.round((book.currentPage / (book.totalPages || 1)) * 100)) || 0;
        const statusClass = getStatusDotClass(book.status);

        return `
          <article class="book-card" data-book-id="${book.id}">
            <!-- Cover with 3D spine and favorite button -->
            <div class="book-card-cover btn-open-detail" data-book-id="${book.id}">
              <button 
                class="btn-fav-toggle ${book.isFavorite ? 'is-fav' : ''}" 
                data-book-id="${book.id}" 
                title="${book.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                aria-label="Favorite"
              >
                ${getIcon('heart')}
              </button>
              <img src="${book.coverUrl}" alt="Cover of ${book.title}" class="book-card-img" loading="lazy" />
            </div>

            <!-- Body Details -->
            <div class="book-card-body">
              <span class="book-genre-text">${escapeHtml(book.genre || 'General')}</span>
              <h3 class="book-card-title btn-open-detail" data-book-id="${book.id}" title="${escapeHtml(book.title)}">
                ${escapeHtml(book.title)}
              </h3>
              <p class="book-card-author">by ${escapeHtml(book.author)}</p>

              <!-- Star Rating -->
              <div class="star-rating" title="Rating: ${book.rating} of 5">
                ${renderStarRating(book.rating)}
              </div>

              <!-- Progress bar -->
              <div class="progress-container" style="margin: 0.4rem 0 0.6rem;">
                <div class="progress-header" style="font-size: 0.75rem;">
                  <span class="tabular-nums">p. ${book.currentPage} / ${book.totalPages}</span>
                  <span class="tabular-nums font-mono">${percent}%</span>
                </div>
                <div class="progress-bar-bg" style="height: 5px;">
                  <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                </div>
              </div>

              <!-- Card Footer with Status & Actions -->
              <div class="book-card-footer" style="display: flex; align-items: center; justify-content: space-between;">
                <span class="book-status-badge">
                  <span class="status-dot ${statusClass}"></span>
                  ${book.status}
                </span>

                <div style="display: flex; gap: 4px;">
                  <button class="btn-icon-only btn-edit-book" data-book-id="${book.id}" title="Edit book details">
                    ${getIcon('edit')}
                  </button>
                  <button class="btn-icon-only btn-delete-book" data-book-id="${book.id}" title="Remove book" style="color: #A56C60;">
                    ${getIcon('trash')}
                  </button>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderBooksList(books) {
  return `
    <div class="bookshelf-list">
      ${books.map(book => {
        const percent = Math.min(100, Math.round((book.currentPage / (book.totalPages || 1)) * 100)) || 0;
        const statusClass = getStatusDotClass(book.status);

        return `
          <div class="book-list-row" data-book-id="${book.id}">
            <div class="book-list-cover btn-open-detail" data-book-id="${book.id}">
              <img src="${book.coverUrl}" alt="Cover of ${book.title}" loading="lazy" />
            </div>

            <div class="book-list-main btn-open-detail" data-book-id="${book.id}" style="cursor: pointer;">
              <h3 style="font-size: 1.15rem; color: var(--accent-forest); font-family: var(--font-serif); font-weight: 600;">
                ${escapeHtml(book.title)}
              </h3>
              <p style="font-size: 0.82rem; color: var(--text-secondary);">by ${escapeHtml(book.author)}</p>
            </div>

            <div class="book-list-meta">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">${escapeHtml(book.genre || 'General')}</span>
              <span class="book-status-badge" style="font-size: 0.8rem;">
                <span class="status-dot ${statusClass}"></span>
                ${book.status}
              </span>
            </div>

            <div class="book-list-progress">
              <div class="progress-header" style="font-size: 0.75rem;">
                <span class="tabular-nums">p. ${book.currentPage} / ${book.totalPages}</span>
                <span class="tabular-nums font-mono">${percent}%</span>
              </div>
              <div class="progress-bar-bg" style="height: 5px;">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
              </div>
            </div>

            <div class="star-rating" style="margin: 0 1rem;">
              ${renderStarRating(book.rating)}
            </div>

            <div class="book-list-actions">
              <button class="btn-icon-only btn-fav-toggle ${book.isFavorite ? 'is-fav' : ''}" data-book-id="${book.id}" title="Favorite">
                ${getIcon('heart')}
              </button>
              <button class="btn-icon-only btn-edit-book" data-book-id="${book.id}" title="Edit">
                ${getIcon('edit')}
              </button>
              <button class="btn-icon-only btn-delete-book" data-book-id="${book.id}" title="Delete" style="color: #A56C60;">
                ${getIcon('trash')}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function getStatusDotClass(status) {
  switch (status) {
    case 'Currently Reading': return 'reading';
    case 'Completed': return 'completed';
    case 'Want to Read': return 'want';
    case 'On Hold': return 'hold';
    default: return 'dropped';
  }
}

function renderStarRating(rating = 0) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
      stars += `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return stars;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bindLibraryEvents(container) {
  // Add book
  const btnAdd = container.querySelector('#btn-lib-add-book');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openBookFormModal());
  }

  // Search input
  const searchInput = container.querySelector('#lib-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value;
      renderLibrary(container);
      // Restore focus to input
      const newSearchInput = container.querySelector('#lib-search-input');
      if (newSearchInput) {
        newSearchInput.focus();
        newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
      }
    });
  }

  // Genre select
  const genreSelect = container.querySelector('#lib-genre-select');
  if (genreSelect) {
    genreSelect.addEventListener('change', (e) => {
      currentFilter.genre = e.target.value;
      renderLibrary(container);
    });
  }

  // Sort select
  const sortSelect = container.querySelector('#lib-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilter.sortBy = e.target.value;
      renderLibrary(container);
    });
  }

  // Favorites toggle filter
  const btnFavFilter = container.querySelector('#btn-fav-filter');
  if (btnFavFilter) {
    btnFavFilter.addEventListener('click', () => {
      currentFilter.favoritesOnly = !currentFilter.favoritesOnly;
      renderLibrary(container);
    });
  }

  // View mode toggles
  const btnGrid = container.querySelector('#btn-toggle-grid');
  const btnList = container.querySelector('#btn-toggle-list');
  if (btnGrid) {
    btnGrid.addEventListener('click', () => {
      stateManager.setLibraryViewMode('grid');
      renderLibrary(container);
    });
  }
  if (btnList) {
    btnList.addEventListener('click', () => {
      stateManager.setLibraryViewMode('list');
      renderLibrary(container);
    });
  }

  // Status tabs
  container.querySelectorAll('.status-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter.status = tab.getAttribute('data-status');
      renderLibrary(container);
    });
  });

  // Reset filters button in empty state
  const btnReset = container.querySelector('#btn-reset-filters');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentFilter = {
        search: '',
        genre: 'All',
        status: 'All',
        sortBy: 'dateAdded',
        favoritesOnly: false
      };
      renderLibrary(container);
    });
  }

  // Open detail
  container.querySelectorAll('.btn-open-detail').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookId = el.getAttribute('data-book-id');
      if (bookId) openBookDetailModal(bookId);
    });
  });

  // Favorite toggle per book
  container.querySelectorAll('.btn-fav-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookId = btn.getAttribute('data-book-id');
      if (bookId) {
        const isFav = stateManager.toggleFavorite(bookId);
        showToast(isFav ? 'Added to favorites ❤️' : 'Removed from favorites', 'info');
      }
    });
  });

  // Edit book
  container.querySelectorAll('.btn-edit-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookId = btn.getAttribute('data-book-id');
      if (bookId) openBookFormModal(bookId);
    });
  });

  // Delete book with confirmation
  container.querySelectorAll('.btn-delete-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookId = btn.getAttribute('data-book-id');
      const book = stateManager.getBookById(bookId);
      if (book) {
        openConfirmModal({
          title: 'Remove Book',
          message: `Are you sure you wish to remove <strong>"${book.title}"</strong> from your library? Your reading progress and notes for this book will be deleted.`,
          confirmText: 'Remove Book',
          confirmBtnClass: 'btn-primary',
          onConfirm: () => {
            stateManager.deleteBook(bookId);
            showToast(`"${book.title}" removed from library`);
          }
        });
      }
    });
  });
}
