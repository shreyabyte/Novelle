/**
 * Between the Pages - Modal Controller System
 */

import { stateManager } from './state.js';
import { getIcon } from './icons.js';
import { showToast, celebrateCompletion } from './toast.js';

// Pre-packaged cover artwork options
const COVER_PRESETS = [
  { name: 'The Alchemist (Gold & Starry Cloth)', url: '/src/assets/images/book_the_alchemist_1793596040207.jpg' },
  { name: 'Atomic Habits (Cream Modern Geometry)', url: '/src/assets/images/book_atomic_habits_1793596040498.jpg' },
  { name: 'The Silent Patient (Dark Academia Linen)', url: '/src/assets/images/book_silent_patient_1793596040925.jpg' },
  { name: 'The Book Thief (Aged Sepia Paper)', url: '/src/assets/images/book_book_thief_1793596042433.jpg' },
  { name: 'Ikigai (Japanese Washi & Ink Blossom)', url: '/src/assets/images/book_ikigai_1793596041279.jpg' }
];

let activeModal = null;

export function closeModal() {
  if (activeModal) {
    activeModal.classList.remove('active');
    activeModal = null;
  }
}

// Global modal backdrop close listener
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function setupBackdrop(modalEl) {
  modalEl.classList.add('active');
  activeModal = modalEl;
  
  modalEl.onclick = (e) => {
    if (e.target === modalEl) {
      closeModal();
    }
  };

  const closeBtn = modalEl.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => closeModal();
  }
}

/**
 * 1. Book Details Modal
 */
export function openBookDetailModal(bookId) {
  const book = stateManager.getBookById(bookId);
  if (!book) return;

  const modalEl = document.getElementById('modal-book-detail');
  if (!modalEl) return;

  let currentPg = Number(book.currentPage) || 0;
  const totalPg = Number(book.totalPages) || 1;
  let currentRating = Number(book.rating) || 0;
  let currentStatus = book.status;

  const percent = Math.min(100, Math.round((currentPg / totalPg) * 100));

  modalEl.querySelector('.modal-dialog').innerHTML = `
    <div class="modal-header">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted);">Book Details</span>
      </div>
      <button class="modal-close-btn" title="Close">${getIcon('x')}</button>
    </div>

    <div class="modal-body">
      <div class="book-detail-hero">
        <div class="book-detail-cover-box">
          <img src="${book.coverUrl}" alt="${escapeHtml(book.title)}" id="detail-cover-img" />
        </div>

        <div class="book-detail-info">
          <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">
            ${escapeHtml(book.genre || 'Literature')}
          </span>
          <h2 class="book-detail-title">${escapeHtml(book.title)}</h2>
          <div class="book-detail-author">by ${escapeHtml(book.author)}</div>

          <!-- Interactive Star Rating -->
          <div style="margin-top: 0.85rem;">
            <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Your Rating</div>
            <div class="interactive-stars" id="detail-star-selector">
              ${[1, 2, 3, 4, 5].map(starNum => `
                <span data-star="${starNum}" class="${starNum <= currentRating ? 'active' : ''}">
                  ${getIcon('star')}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Status Selector -->
          <div style="margin-top: 0.5rem;">
            <label class="form-label" for="detail-status-select">Reading Status</label>
            <select class="form-select" id="detail-status-select" style="max-width: 240px;">
              <option value="Want to Read" ${currentStatus === 'Want to Read' ? 'selected' : ''}>Want to Read</option>
              <option value="Currently Reading" ${currentStatus === 'Currently Reading' ? 'selected' : ''}>Currently Reading</option>
              <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="On Hold" ${currentStatus === 'On Hold' ? 'selected' : ''}>On Hold</option>
              <option value="Dropped" ${currentStatus === 'Dropped' ? 'selected' : ''}>Dropped</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Interactive Reading Progress Control -->
      <div class="page-updater-box">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="color: var(--accent-forest); font-size: 0.95rem;">Reading Progress</strong>
          <span class="tabular-nums font-mono" id="detail-progress-label" style="font-weight: 600; color: var(--accent-forest);">
            Page ${currentPg} of ${totalPg} (${percent}%)
          </span>
        </div>

        <div class="progress-bar-bg" style="margin: 0.75rem 0 0.5rem; height: 8px;">
          <div class="progress-bar-fill" id="detail-progress-bar-fill" style="width: ${percent}%;"></div>
        </div>

        <div class="page-slider-row">
          <input 
            type="range" 
            class="input-slider" 
            id="detail-page-slider" 
            min="0" 
            max="${totalPg}" 
            value="${currentPg}" 
          />
          <div style="display:flex; align-items:center; gap:0.35rem;">
            <input 
              type="number" 
              class="page-number-input" 
              id="detail-page-input" 
              min="0" 
              max="${totalPg}" 
              value="${currentPg}" 
            />
            <span style="font-size:0.8rem; color:var(--text-muted);">/ ${totalPg}</span>
          </div>
        </div>
      </div>

      <!-- Dates & Personal Notes -->
      <div class="form-grid" style="margin-top: 1.5rem;">
        <div class="form-group">
          <label class="form-label" for="detail-start-date">Date Started</label>
          <input type="date" class="form-input" id="detail-start-date" value="${book.startDate || ''}" />
        </div>

        <div class="form-group">
          <label class="form-label" for="detail-completed-date">Date Completed</label>
          <input type="date" class="form-input" id="detail-completed-date" value="${book.completedDate || ''}" />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label" for="detail-notes">Personal Notes & Impressions</label>
          <textarea class="form-textarea" id="detail-notes" placeholder="Jot down memorable themes, favorite passages, or what this book made you feel...">${escapeHtml(book.notes || '')}</textarea>
        </div>
      </div>
    </div>

    <div class="modal-footer" style="justify-content: space-between;">
      <button class="btn btn-secondary btn-sm" id="btn-detail-add-journal" style="color: var(--accent-forest);">
        ${getIcon('feather')} Add Journal Note
      </button>

      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" id="btn-detail-cancel">Cancel</button>
        <button class="btn btn-primary" id="btn-detail-save">Save Changes</button>
      </div>
    </div>
  `;

  setupBackdrop(modalEl);

  // Wire interactive progress updates
  const slider = modalEl.querySelector('#detail-page-slider');
  const numberInput = modalEl.querySelector('#detail-page-input');
  const progressFill = modalEl.querySelector('#detail-progress-bar-fill');
  const progressLabel = modalEl.querySelector('#detail-progress-label');
  const statusSelect = modalEl.querySelector('#detail-status-select');

  function updateProgressDisplay(val) {
    currentPg = Math.min(totalPg, Math.max(0, Number(val) || 0));
    slider.value = currentPg;
    numberInput.value = currentPg;
    const pct = Math.min(100, Math.round((currentPg / totalPg) * 100));
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `Page ${currentPg} of ${totalPg} (${pct}%)`;

    // If slider reaches end, automatically select Completed
    if (currentPg === totalPg && statusSelect.value !== 'Completed') {
      statusSelect.value = 'Completed';
    } else if (currentPg > 0 && currentPg < totalPg && statusSelect.value === 'Want to Read') {
      statusSelect.value = 'Currently Reading';
    }
  }

  slider.addEventListener('input', (e) => updateProgressDisplay(e.target.value));
  numberInput.addEventListener('input', (e) => updateProgressDisplay(e.target.value));

  // Wire Star selector
  modalEl.querySelectorAll('#detail-star-selector span').forEach(el => {
    el.addEventListener('click', () => {
      const star = Number(el.getAttribute('data-star'));
      currentRating = star;
      modalEl.querySelectorAll('#detail-star-selector span').forEach(s => {
        const sNum = Number(s.getAttribute('data-star'));
        if (sNum <= star) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });

  // Cancel
  modalEl.querySelector('#btn-detail-cancel').onclick = () => closeModal();

  // Add Journal Entry shortcut
  modalEl.querySelector('#btn-detail-add-journal').onclick = () => {
    closeModal();
    openJournalFormModal(null, book.id);
  };

  // Save changes
  modalEl.querySelector('#btn-detail-save').onclick = () => {
    const newStatus = statusSelect.value;
    const newStartDate = modalEl.querySelector('#detail-start-date').value;
    let newCompletedDate = modalEl.querySelector('#detail-completed-date').value;
    const newNotes = modalEl.querySelector('#detail-notes').value;

    if (newStatus === 'Completed' && !newCompletedDate) {
      newCompletedDate = new Date().toISOString().split('T')[0];
    }

    const updated = stateManager.updateBook(book.id, {
      currentPage: currentPg,
      status: newStatus,
      rating: currentRating,
      startDate: newStartDate,
      completedDate: newCompletedDate,
      notes: newNotes
    });

    closeModal();

    if (newStatus === 'Completed' && book.status !== 'Completed') {
      celebrateCompletion();
      showToast(`Finished "${book.title}"! Beautifully done! 🌟`, 'success');
    } else {
      showToast(`Saved updates for "${book.title}"`);
    }
  };
}

/**
 * 2. Add or Edit Book Form Modal
 */
export function openBookFormModal(bookId = null) {
  const isEdit = Boolean(bookId);
  const book = isEdit ? stateManager.getBookById(bookId) : null;

  const modalEl = document.getElementById('modal-book-form');
  if (!modalEl) return;

  modalEl.querySelector('.modal-dialog').innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Edit Book Details' : 'Add to Your Bookshelf'}</h2>
      <button class="modal-close-btn" title="Close">${getIcon('x')}</button>
    </div>

    <form id="form-book" class="modal-body">
      <div class="form-grid">
        <div class="form-group col-span-2">
          <label class="form-label" for="book-input-title">Title *</label>
          <input 
            type="text" 
            id="book-input-title" 
            class="form-input" 
            placeholder="e.g. The Picture of Dorian Gray"
            value="${escapeHtml(book ? book.title : '')}" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="book-input-author">Author *</label>
          <input 
            type="text" 
            id="book-input-author" 
            class="form-input" 
            placeholder="e.g. Oscar Wilde"
            value="${escapeHtml(book ? book.author : '')}" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="book-input-genre">Genre / Subject</label>
          <input 
            type="text" 
            id="book-input-genre" 
            class="form-input" 
            placeholder="e.g. Classics, Philosophy, Mystery"
            value="${escapeHtml(book ? book.genre : 'Philosophy')}" 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="book-input-total-pages">Total Pages *</label>
          <input 
            type="number" 
            id="book-input-total-pages" 
            class="form-input" 
            min="1" 
            value="${book ? book.totalPages : 320}" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="book-input-current-page">Current Page</label>
          <input 
            type="number" 
            id="book-input-current-page" 
            class="form-input" 
            min="0" 
            value="${book ? book.currentPage : 0}" 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="book-input-status">Reading Status</label>
          <select class="form-select" id="book-input-status">
            <option value="Want to Read" ${book && book.status === 'Want to Read' ? 'selected' : ''}>Want to Read</option>
            <option value="Currently Reading" ${book && book.status === 'Currently Reading' ? 'selected' : (!book ? 'selected' : '')}>Currently Reading</option>
            <option value="Completed" ${book && book.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="On Hold" ${book && book.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
            <option value="Dropped" ${book && book.status === 'Dropped' ? 'selected' : ''}>Dropped</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="book-input-rating">Rating (0 to 5)</label>
          <select class="form-select" id="book-input-rating">
            <option value="0" ${book && book.rating === 0 ? 'selected' : ''}>Not Rated</option>
            <option value="5" ${book && book.rating === 5 ? 'selected' : ''}>5 ★★★★★ (Masterpiece)</option>
            <option value="4.5" ${book && book.rating === 4.5 ? 'selected' : ''}>4.5 ★★★★½</option>
            <option value="4" ${book && book.rating === 4 ? 'selected' : ''}>4 ★★★★☆ (Great)</option>
            <option value="3" ${book && book.rating === 3 ? 'selected' : ''}>3 ★★★☆☆ (Good)</option>
            <option value="2" ${book && book.rating === 2 ? 'selected' : ''}>2 ★★☆☆☆</option>
            <option value="1" ${book && book.rating === 1 ? 'selected' : ''}>1 ★☆☆☆☆</option>
          </select>
        </div>
        
        <div class="form-group col-span-2">
          <label class="form-label" for="book-input-notes">Initial Thoughts or Notes</label>
          <textarea id="book-input-notes" class="form-textarea" placeholder="Why did you pick this book up?">${escapeHtml(book ? book.notes : '')}</textarea>
        </div>
      </div>

      <div class="modal-footer" style="margin: 1.5rem -2rem -2rem; padding: 1.25rem 2rem;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-book">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Book'}</button>
      </div>
    </form>
  `;

  setupBackdrop(modalEl);

  const presetSelect = modalEl.querySelector('#book-input-cover-preset');
  const customWrap = modalEl.querySelector('#custom-cover-wrap');
  presetSelect.addEventListener('change', () => {
    if (presetSelect.value === 'custom') {
      customWrap.style.display = 'block';
    } else {
      customWrap.style.display = 'none';
    }
  });

  modalEl.querySelector('#btn-cancel-book').onclick = () => closeModal();

  const form = modalEl.querySelector('#form-book');
  form.onsubmit = async (e) => {
      e.preventDefault();

      const title = modalEl.querySelector('#book-input-title').value.trim();
      const author = modalEl.querySelector('#book-input-author').value.trim();
      const genre = modalEl.querySelector('#book-input-genre').value.trim() || 'General';
      const totalPages = Number(modalEl.querySelector('#book-input-total-pages').value) || 1;
      const currentPage = Number(modalEl.querySelector('#book-input-current-page').value) || 0;
      const status = modalEl.querySelector('#book-input-status').value;
      const rating = Number(modalEl.querySelector('#book-input-rating').value) || 0;
      const notes = modalEl.querySelector('#book-input-notes').value.trim();

      let coverUrl = presetSelect.value;
      if (coverUrl === 'custom') {
        coverUrl = modalEl.querySelector('#book-input-custom-cover').value.trim() || COVER_PRESETS[0].url;
      }

      try {
          if (isEdit) {
              await stateManager.updateBook(book.id, {
                  title, author, genre, totalPages, currentPage, status, rating, coverUrl, notes
              });

              showToast(`Updated "${title}"`);
          } else {
          await stateManager.addBook({
            title, author, genre, totalPages, currentPage, status, rating, coverUrl, notes
          });
          showToast(`"${title}" added to your bookshelf! 📚`);
        }

        closeModal();

      } catch (error) {
        console.error('Error saving book:', error);
        showToast(error.message || 'Could not save the book. Please try again.');
      }
  };
}

/**
 * 3. Journal Entry Form Modal
 */
export function openJournalFormModal(entryId = null, preselectedBookId = null) {
  const isEdit = Boolean(entryId);
  const entry = isEdit ? stateManager.getJournalEntries().find(e => e.id === entryId) : null;
  const allBooks = stateManager.getBooks();

  const modalEl = document.getElementById('modal-journal-form');
  if (!modalEl) return;

  const defaultBookId = entry ? entry.bookId : (preselectedBookId || (allBooks.length > 0 ? allBooks[0].id : ''));
  const today = new Date().toISOString().split('T')[0];

  modalEl.querySelector('.modal-dialog').innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Edit Reflection' : 'New Journal Entry'}</h2>
      <button class="modal-close-btn" title="Close">${getIcon('x')}</button>
    </div>

    <form id="form-journal" class="modal-body">
      <div class="form-grid">
        <div class="form-group col-span-2">
          <label class="form-label" for="journal-input-title">Entry Title *</label>
          <input 
            type="text" 
            id="journal-input-title" 
            class="form-input" 
            placeholder="e.g. Thoughts on Chapter 4 / The Power of Rest"
            value="${escapeHtml(entry ? entry.title : '')}" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="journal-input-book">Associated Book</label>
          <select class="form-select" id="journal-input-book">
            <option value="">None (General Reflection)</option>
            ${allBooks.map(b => `
              <option value="${b.id}" ${b.id === defaultBookId ? 'selected' : ''}>
                ${escapeHtml(b.title)}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="journal-input-date">Date</label>
          <input 
            type="date" 
            id="journal-input-date" 
            class="form-input" 
            value="${entry ? entry.date : today}" 
          />
        </div>

        <div class="form-group col-span-2">
          <label class="form-label" for="journal-input-quote">Favorite Quote / Passage (Optional)</label>
          <textarea 
            id="journal-input-quote" 
            class="form-textarea" 
            style="min-height: 60px;" 
            placeholder="“Copy a line that resonated deeply...”"
          >${escapeHtml(entry ? entry.quote : '')}</textarea>
        </div>

        <div class="form-group col-span-2">
          <label class="form-label" for="journal-input-reflection">Personal Reflection & Notes *</label>
          <textarea 
            id="journal-input-reflection" 
            class="form-textarea" 
            style="min-height: 120px;" 
            placeholder="What stirred in your mind while reading? What connections did you make to your own life?"
            required
          >${escapeHtml(entry ? entry.reflection : '')}</textarea>
        </div>

        <div class="form-group col-span-2">
          <label class="form-label" for="journal-input-mood">Reading Mood</label>
          <select class="form-select" id="journal-input-mood">
            <option value="Contemplative" ${entry && entry.mood === 'Contemplative' ? 'selected' : ''}>Contemplative</option>
            <option value="Inspired" ${entry && entry.mood === 'Inspired' ? 'selected' : ''}>Inspired</option>
            <option value="Peaceful" ${entry && entry.mood === 'Peaceful' ? 'selected' : ''}>Peaceful</option>
            <option value="Challenged" ${entry && entry.mood === 'Challenged' ? 'selected' : ''}>Challenged</option>
            <option value="Curious" ${entry && entry.mood === 'Curious' ? 'selected' : ''}>Curious</option>
            <option value="Nostalgic" ${entry && entry.mood === 'Nostalgic' ? 'selected' : ''}>Nostalgic</option>
          </select>
        </div>
      </div>

      <div class="modal-footer" style="margin: 1.5rem -2rem -2rem; padding: 1.25rem 2rem;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-journal">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Record Entry'}</button>
      </div>
    </form>
  `;

  setupBackdrop(modalEl);

  modalEl.querySelector('#btn-cancel-journal').onclick = () => closeModal();

  const form = modalEl.querySelector('#form-journal');
  form.onsubmit = (e) => {
    e.preventDefault();

    const title = modalEl.querySelector('#journal-input-title').value.trim();
    const bookId = modalEl.querySelector('#journal-input-book').value;
    const book = stateManager.getBookById(bookId);
    const bookTitle = book ? book.title : '';
    const date = modalEl.querySelector('#journal-input-date').value || today;
    const quote = modalEl.querySelector('#journal-input-quote').value.trim();
    const reflection = modalEl.querySelector('#journal-input-reflection').value.trim();
    const mood = modalEl.querySelector('#journal-input-mood').value;

    if (isEdit) {
      stateManager.updateJournalEntry(entry.id, {
        title, bookId, bookTitle, date, quote, reflection, mood
      });
      showToast(`Updated journal entry: "${title}"`);
    } else {
      stateManager.addJournalEntry({
        title, bookId, bookTitle, date, quote, reflection, mood
      });
      showToast(`Reflection saved to your journal! 🖋️`);
    }

    closeModal();
  };
}

/**
 * 4. Goal Adjustment Modal
 */
export function openGoalEditModal() {
  const goals = stateManager.getGoals();
  const modalEl = document.getElementById('modal-generic');
  if (!modalEl) return;

  modalEl.querySelector('.modal-dialog').innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">Adjust Reading Targets</h2>
      <button class="modal-close-btn" title="Close">${getIcon('x')}</button>
    </div>

    <form id="form-goals" class="modal-body">
      <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.25rem;">
        Set realistic reading milestones that excite you without creating pressure.
      </p>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label" for="goal-yearly">Yearly Goal (${goals.currentYear} Books)</label>
          <input 
            type="number" 
            id="goal-yearly" 
            class="form-input" 
            min="1" 
            max="365" 
            value="${goals.yearlyTarget || 24}" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="goal-monthly">Monthly Pace (Books / Month)</label>
          <input 
            type="number" 
            id="goal-monthly" 
            class="form-input" 
            min="1" 
            max="30" 
            value="${goals.monthlyTarget || 2}" 
            required 
          />
        </div>
      </div>

      <div class="modal-footer" style="margin: 1.5rem -2rem -2rem; padding: 1.25rem 2rem;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-goals">Cancel</button>
        <button type="submit" class="btn btn-primary">Update Targets</button>
      </div>
    </form>
  `;

  setupBackdrop(modalEl);

  modalEl.querySelector('#btn-cancel-goals').onclick = () => closeModal();

  const form = modalEl.querySelector('#form-goals');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const yearly = modalEl.querySelector('#goal-yearly').value;
    const monthly = modalEl.querySelector('#goal-monthly').value;

    try {
      await stateManager.updateGoals(yearly, monthly);
      showToast(`Updated ${goals.currentYear} reading target to ${yearly} books! 🎯`);
      closeModal();
    } catch (error) {
      console.error('Error updating reading goal:', error);
      showToast(error.message || 'Could not update reading goals. Please try again.');
    }
  };
}

/**
 * 5. Delightful "Pick My Next Read" Randomizer Modal
 */
export function openPickNextModal() {
  const books = stateManager.getBooks();
  // Prefer Want to Read or unread books
  let eligibleBooks = books.filter(b => b.status === 'Want to Read');
  if (eligibleBooks.length === 0) {
    eligibleBooks = books.filter(b => b.status !== 'Completed');
  }
  if (eligibleBooks.length === 0) {
    eligibleBooks = books;
  }

  const modalEl = document.getElementById('modal-generic');
  if (!modalEl) return;

  const randomBook = eligibleBooks[Math.floor(Math.random() * eligibleBooks.length)];

  modalEl.querySelector('.modal-dialog').innerHTML = `
    <div class="modal-header">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="color:var(--accent-rose-dark);">${getIcon('sparkles')}</span>
        <h2 class="modal-title">Serendipity Shelf</h2>
      </div>
      <button class="modal-close-btn" title="Close">${getIcon('x')}</button>
    </div>

    <div class="modal-body" style="text-align: center; padding: 2.25rem 2rem;">
      <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:1.5rem;">
        We reached into your library stacks and found this gem waiting for you:
      </p>

      <div style="width: 140px; height: 200px; margin: 0 auto 1.5rem; border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-book);">
        <img src="${randomBook.coverUrl}" alt="${escapeHtml(randomBook.title)}" style="width:100%; height:100%; object-fit:cover;" />
      </div>

      <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.06em;">
        ${escapeHtml(randomBook.genre)} · ${randomBook.totalPages} pages
      </span>
      <h3 style="font-size: 1.7rem; font-family: var(--font-serif); color: var(--accent-forest); margin: 0.25rem 0;">
        ${escapeHtml(randomBook.title)}
      </h3>
      <p style="color: var(--text-secondary); font-size: 1rem;">by ${escapeHtml(randomBook.author)}</p>

      ${randomBook.notes ? `
        <div style="background: var(--bg-primary); border-radius: var(--radius-sm); padding: 0.85rem 1.25rem; margin: 1.25rem auto 0; max-width: 440px; font-size: 0.88rem; font-style: italic; color: var(--text-secondary); border: 1px solid var(--border-light);">
          “${escapeHtml(randomBook.notes)}”
        </div>
      ` : ''}
    </div>

    <div class="modal-footer" style="justify-content: space-between;">
      <button class="btn btn-secondary" id="btn-reshuffle-pick">
        ${getIcon('refresh')} Pick Another
      </button>

      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary" id="btn-close-pick">Later</button>
        <button class="btn btn-primary" id="btn-start-reading-picked">
          ${getIcon('book-open')} Start Reading Now
        </button>
      </div>
    </div>
  `;

  setupBackdrop(modalEl);

  modalEl.querySelector('#btn-close-pick').onclick = () => closeModal();

  modalEl.querySelector('#btn-reshuffle-pick').onclick = () => {
    openPickNextModal();
  };

  modalEl.querySelector('#btn-start-reading-picked').onclick = () => {
    stateManager.updateBook(randomBook.id, {
      status: 'Currently Reading',
      startDate: new Date().toISOString().split('T')[0]
    });
    closeModal();
    openBookDetailModal(randomBook.id);
    showToast(`Started reading "${randomBook.title}"! Enjoy the journey 📖`, 'success');
  };
}

/**
 * 6. Generic Confirmation Modal
 */
export function openConfirmModal({ title, message, confirmText = 'Confirm', confirmBtnClass = 'btn-primary', onConfirm }) {
  const modalEl = document.getElementById('modal-generic');
  if (!modalEl) return;

  modalEl.querySelector('.modal-dialog').innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${escapeHtml(title)}</h2>
      <button class="modal-close-btn" title="Close">${getIcon('x')}</button>
    </div>

    <div class="modal-body">
      <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.6;">
        ${message}
      </p>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" id="btn-confirm-cancel">Cancel</button>
      <button class="btn ${confirmBtnClass}" id="btn-confirm-ok">${escapeHtml(confirmText)}</button>
    </div>
  `;

  setupBackdrop(modalEl);

  modalEl.querySelector('#btn-confirm-cancel').onclick = () => closeModal();
  modalEl.querySelector('#btn-confirm-ok').onclick = () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  };
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
