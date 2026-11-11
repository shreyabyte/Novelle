/**
 * Between the Pages - Reading Journal (Diary & Quotes) View
 */

import { stateManager } from '../state.js';
import { getIcon } from '../icons.js';
import { openJournalFormModal, openConfirmModal } from '../modals.js';
import { showToast } from '../toast.js';

let selectedBookFilter = 'All';

export function renderJournal(container) {
  if (!container) return;

  const entries = stateManager.getJournalEntries();
  const allBooks = stateManager.getBooks();

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    if (selectedBookFilter !== 'All' && entry.bookId !== selectedBookFilter) {
      return false;
    }
    return true;
  });

  container.innerHTML = `
    <header class="page-header">
      <div>
        <h1 class="page-title">Reading Journal</h1>
        <p class="page-subtitle">A quiet space to chronicle your thoughts, memorable passages, and reflections across chapters.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-journal-new-entry">
          ${getIcon('feather')} New Entry
        </button>
      </div>
    </header>

    <!-- Toolbar: Filter by Book -->
    <div class="library-filter-toolbar" style="margin-bottom: 2rem;">
      <div class="toolbar-primary-row">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);">Filter by Book:</span>
          <select class="select-control" id="journal-book-select">
            <option value="All" ${selectedBookFilter === 'All' ? 'selected' : ''}>All Books (${entries.length})</option>
            ${allBooks.map(b => `
              <option value="${b.id}" ${selectedBookFilter === b.id ? 'selected' : ''}>
                ${escapeHtml(b.title)} (${entries.filter(e => e.bookId === b.id).length})
              </option>
            `).join('')}
          </select>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-muted);">
          ${filteredEntries.length} reflection${filteredEntries.length === 1 ? '' : 's'} recorded
        </div>
      </div>
    </div>

    <!-- Timeline Entries List -->
    <div id="journal-timeline-container">
      ${filteredEntries.length > 0 ? `
        <div class="journal-timeline">
          ${filteredEntries.map(entry => {
            const formattedDate = formatDate(entry.date);
            const book = stateManager.getBookById(entry.bookId);

            return `
              <article class="journal-card" data-entry-id="${entry.id}">
                <div class="journal-card-header">
                  <div>
                    <h2 class="journal-entry-title">${escapeHtml(entry.title)}</h2>
                    <div class="journal-meta-row">
                      <span>${formattedDate}</span>
                      ${entry.bookTitle ? `
                        <span aria-hidden="true">·</span>
                        <span class="journal-book-pill">
                          ${getIcon('book')} ${escapeHtml(entry.bookTitle)}
                        </span>
                      ` : ''}
                      ${entry.mood ? `
                        <span aria-hidden="true">·</span>
                        <span style="color: var(--accent-rose-dark); font-style: italic;">Mood: ${escapeHtml(entry.mood)}</span>
                      ` : ''}
                    </div>
                  </div>

                  ${book && book.coverUrl ? `
                    <div style="width: 44px; height: 60px; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1); flex-shrink: 0;">
                      <img src="${book.coverUrl}" alt="${escapeHtml(book.title)}" style="width:100%; height:100%; object-fit:cover;" />
                    </div>
                  ` : ''}
                </div>

                ${entry.quote ? `
                  <blockquote class="journal-quote-box">
                    “${escapeHtml(entry.quote)}”
                  </blockquote>
                ` : ''}

                <div class="journal-entry-body">
                  ${escapeHtml(entry.reflection).replace(/\n/g, '<br/>')}
                </div>

                <div class="journal-actions-row">
                  <button class="btn btn-secondary btn-sm btn-edit-journal" data-entry-id="${entry.id}">
                    ${getIcon('edit')} Edit
                  </button>
                  <button class="btn btn-secondary btn-sm btn-delete-journal" data-entry-id="${entry.id}" style="color: #A56C60;">
                    ${getIcon('trash')} Delete
                  </button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">${getIcon('feather')}</div>
          <h3 class="empty-state-title">No journal entries yet</h3>
          <p class="empty-state-desc">Capture a passage that moved you, or record your initial impressions of a freshly opened book.</p>
          <button class="btn btn-primary" id="btn-empty-journal">Write Your First Reflection</button>
        </div>
      `}
    </div>
  `;

  bindJournalEvents(container);
}

function formatDate(dateStr) {
  if (!dateStr) return 'Undated';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
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

function bindJournalEvents(container) {
  // New entry button
  const btnNew = container.querySelector('#btn-journal-new-entry');
  const btnEmptyNew = container.querySelector('#btn-empty-journal');
  if (btnNew) btnNew.addEventListener('click', () => openJournalFormModal());
  if (btnEmptyNew) btnEmptyNew.addEventListener('click', () => openJournalFormModal());

  // Book filter select
  const bookSelect = container.querySelector('#journal-book-select');
  if (bookSelect) {
    bookSelect.addEventListener('change', (e) => {
      selectedBookFilter = e.target.value;
      renderJournal(container);
    });
  }

  // Edit journal entry
  container.querySelectorAll('.btn-edit-journal').forEach(btn => {
    btn.addEventListener('click', () => {
      const entryId = btn.getAttribute('data-entry-id');
      if (entryId) openJournalFormModal(entryId);
    });
  });

  // Delete journal entry with confirmation
  container.querySelectorAll('.btn-delete-journal').forEach(btn => {
    btn.addEventListener('click', () => {
      const entryId = btn.getAttribute('data-entry-id');
      const entry = stateManager.getJournalEntries().find(e => e.id === entryId);
      if (entry) {
        openConfirmModal({
          title: 'Delete Journal Entry',
          message: `Are you sure you want to permanently delete <em>"${entry.title}"</em>?`,
          confirmText: 'Delete Entry',
          onConfirm: () => {
            stateManager.deleteJournalEntry(entryId);
            showToast('Journal entry deleted');
          }
        });
      }
    });
  });
}
