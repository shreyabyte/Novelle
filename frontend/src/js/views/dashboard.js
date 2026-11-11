import { authService } from '../auth.js';
import { stateManager } from '../state.js';
import { getIcon } from '../icons.js';
import { getQuoteOfTheDay, getRandomQuote } from '../quotes.js';
import { openBookDetailModal, openPickNextModal, openBookFormModal } from '../modals.js';
import { showToast } from '../toast.js';

let activeQuote = getQuoteOfTheDay();

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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

export function renderDashboard(container) {
  if (!container) return;

  const user = authService.getCurrentUser();
  const userName = user ? (user.name.split(' ')[0] || user.name) : 'Reader';

  const stats = stateManager.getStats();
  const currentlyReading = stateManager.getBooks().filter(b => b.status === 'Currently Reading');
  const streak = stateManager.getStreak();
  const activities = stateManager.getActivities();
  const greeting = getTimeGreeting();

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (stats.yearlyPercent / 100) * circumference;

  container.innerHTML = `
    <!-- Page Header & Greeting -->
    <header class="page-header">
      <div>
        <h1 class="page-title">${greeting}, ${escapeHtml(userName)}</h1>
        <p class="page-subtitle">Welcome to your sanctuary of stories. Let’s see where the pages take you today.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-dash-switch-user" title="Sign out or switch accounts">
          ${getIcon('user')} ${escapeHtml(userName)} (Sign Out)
        </button>
        <button class="btn btn-primary" id="btn-dash-add-book">
          ${getIcon('plus')} Add to Library
        </button>
      </div>
    </header>

    <!-- Literary Quote Banner -->
    <div class="quote-banner">
      <div class="quote-content">
        <blockquote class="quote-text" id="dash-quote-text">“${activeQuote.quote}”</blockquote>
        <div class="quote-author" id="dash-quote-author">— ${activeQuote.author}${activeQuote.source ? ` · <em>${activeQuote.source}</em>` : ''}</div>
      </div>
      <button class="btn-refresh-quote" id="btn-shuffle-quote" title="Get another inspiring quote">
        ${getIcon('refresh')} Inspire Me
      </button>
    </div>

    <!-- Compact Key Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Books Read (${new Date().getFullYear()})</span>
          <div class="stat-icon">${getIcon('book')}</div>
        </div>
        <div class="stat-value tabular-nums">${stats.completedCount}</div>
        <div class="stat-subtext">${stats.yearlyTarget - stats.completedCount > 0 ? `${stats.yearlyTarget - stats.completedCount} remaining for yearly goal` : 'Yearly goal achieved! 🌟'}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Pages Turned</span>
          <div class="stat-icon">${getIcon('book-open')}</div>
        </div>
        <div class="stat-value tabular-nums">${stats.totalPagesRead.toLocaleString()}</div>
        <div class="stat-subtext">Across ${stats.totalBooks} books logged</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Reading Streak</span>
          <div class="stat-icon" style="background-color: var(--accent-rose-light); color: var(--accent-rose-dark);">${getIcon('flame')}</div>
        </div>
        <div class="stat-value tabular-nums">${streak.current} <span style="font-size: 1.1rem; font-weight: 500; font-family: var(--font-sans);">days</span></div>
        <div class="stat-subtext">${streak.checkedToday ? '✓ Checked in for today' : 'Tap to check in today'}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Average Rating</span>
          <div class="stat-icon" style="background-color: var(--accent-amber-light); color: var(--accent-amber);">${getIcon('star')}</div>
        </div>
        <div class="stat-value tabular-nums">${stats.avgRating} <span style="font-size: 1.1rem; color: var(--accent-amber);">★</span></div>
        <div class="stat-subtext">Top genre: <strong>${stats.topGenre}</strong></div>
      </div>
    </div>

    <!-- Currently Reading Section -->
    <div class="section-heading-row">
      <h2 class="section-title">Currently Reading</h2>
      <a class="section-link" id="link-view-all-library">View All Books ${getIcon('arrowRight')}</a>
    </div>

    ${currentlyReading.length > 0 ? `
      <div class="current-reads-grid">
        ${currentlyReading.map(book => {
          const percent = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)) || 0;
          return `
            <article class="current-read-card" data-book-id="${book.id}">
              <div class="book-cover-wrap btn-open-detail" data-book-id="${book.id}">
                <img src="${book.coverUrl}" alt="Cover of ${book.title}" class="book-cover-img" loading="lazy" />
              </div>
              <div class="current-read-info">
                <div>
                  <div class="book-meta-inline">
                    <span>${book.genre || 'Literature'}</span>
                    <span aria-hidden="true">·</span>
                    <span class="tabular-nums">${percent}% complete</span>
                  </div>
                  <h3 class="current-book-title btn-open-detail" data-book-id="${book.id}">${book.title}</h3>
                  <p class="current-book-author">by ${book.author}</p>
                </div>

                <div class="progress-container">
                  <div class="progress-header">
                    <span class="tabular-nums">Page ${book.currentPage} of ${book.totalPages}</span>
                    <span class="tabular-nums font-mono">${percent}%</span>
                  </div>
                  <div class="progress-bar-bg" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                  </div>
                </div>

                <div class="current-read-actions">
                  <button class="btn-quick-page btn-add-pages" data-book-id="${book.id}" data-pages="5">+5 pgs</button>
                  <button class="btn-quick-page btn-add-pages" data-book-id="${book.id}" data-pages="15">+15 pgs</button>
                  <button class="btn btn-secondary btn-sm btn-open-detail" data-book-id="${book.id}">
                    Continue Reading
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="empty-state" style="padding: 2.5rem 1.5rem; margin-bottom: 2.5rem;">
        <div class="empty-state-icon">${getIcon('book-open')}</div>
        <h3 class="empty-state-title">No books currently in progress</h3>
        <p class="empty-state-desc">Choose a book from your library or pick a new title to begin your next literary voyage.</p>
        <button class="btn btn-primary" id="btn-empty-start-read">Browse My Library</button>
      </div>
    `}

    <!-- Two-Column Split: Yearly Goal Spotlight + Recent Reading Activity -->
    <div class="dashboard-split-grid">
      <!-- Yearly Goal Showcase Panel -->
      <div class="card-panel">
        <div class="section-heading-row" style="margin-bottom: 0.5rem;">
          <h3 class="section-title" style="font-size: 1.3rem;">2026 Reading Goal</h3>
          <a class="section-link" id="link-view-goals">Details ${getIcon('arrowRight')}</a>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">Target: ${stats.yearlyTarget} books in 2026</p>

        <div class="goal-highlight-box">
          <div class="circular-gauge-wrap">
            <svg class="gauge-svg" viewBox="0 0 100 100">
              <circle class="gauge-bg" cx="50" cy="50" r="${radius}"></circle>
              <circle class="gauge-fill" cx="50" cy="50" r="${radius}" 
                stroke-dasharray="${circumference}" 
                stroke-dashoffset="${strokeOffset}">
              </circle>
            </svg>
            <div class="gauge-percent tabular-nums">${stats.yearlyPercent}%</div>
          </div>
          <div class="goal-details">
            <div class="goal-status-text tabular-nums">${stats.completedCount} of ${stats.yearlyTarget} Finished</div>
            <div class="goal-pacing-note">
              ${stats.completedCount >= stats.yearlyTarget 
                ? 'Congratulations! You have surpassed your annual reading target! 🎉' 
                : `You are making wonderful steady progress. Just ${stats.yearlyTarget - stats.completedCount} books to go!`
              }
            </div>
          </div>
        </div>

        <!-- Delightful Pick Next Read Prompt -->
        <div class="pick-next-card">
          <div>
            <div class="pick-next-title">Unsure what to read next?</div>
            <div class="pick-next-sub">Let serendipity pick a treasure from your Want to Read shelf.</div>
          </div>
          <button class="btn btn-sage btn-sm" id="btn-dash-pick-next">
            ${getIcon('sparkles')} Pick For Me
          </button>
        </div>
      </div>

      <!-- Recent Activity Panel -->
      <div class="card-panel">
        <div class="section-heading-row" style="margin-bottom: 0.5rem;">
          <h3 class="section-title" style="font-size: 1.3rem;">Reading Journal & Log</h3>
          <a class="section-link" id="link-view-journal">All Entries ${getIcon('arrowRight')}</a>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">Your latest bookmarks and reflections</p>

        <div class="activity-list">
          ${activities.slice(0, 4).map(act => `
            <div class="activity-item">
              <div class="activity-icon-bullet">${getIcon('feather')}</div>
              <div class="activity-content">
                <div class="activity-text">${act.text}</div>
                <div class="activity-time">${act.time}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Bind interactive elements
  bindDashboardEvents(container);
}

function bindDashboardEvents(container) {
  // Quote shuffle
  const btnShuffle = container.querySelector('#btn-shuffle-quote');
  if (btnShuffle) {
    btnShuffle.addEventListener('click', () => {
      activeQuote = getRandomQuote();
      const textEl = container.querySelector('#dash-quote-text');
      const authEl = container.querySelector('#dash-quote-author');
      if (textEl && authEl) {
        textEl.textContent = `“${activeQuote.quote}”`;
        authEl.innerHTML = `— ${activeQuote.author}${activeQuote.source ? ` · <em>${activeQuote.source}</em>` : ''}`;
      }
    });
  }

  // Add book button
  const btnAdd = container.querySelector('#btn-dash-add-book');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openBookFormModal());
  }

  // Switch User / Sign Out button
  const btnSwitchUser = container.querySelector('#btn-dash-switch-user');
  if (btnSwitchUser) {
    btnSwitchUser.addEventListener('click', () => {
      authService.logout();
      showToast('You have signed out. Welcome to the sign in page!', 'info');
    });
  }

  // Quick page progress increment buttons
  container.querySelectorAll('.btn-add-pages').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookId = btn.getAttribute('data-book-id');
      const pagesToAdd = Number(btn.getAttribute('data-pages')) || 5;
      const book = stateManager.getBookById(bookId);
      if (book) {
        const newPage = Math.min(book.totalPages, book.currentPage + pagesToAdd);
        stateManager.updateBook(bookId, { currentPage: newPage });
        showToast(`Turned ${pagesToAdd} pages in "${book.title}"! 📖`);
      }
    });
  });

  // Open book details
  container.querySelectorAll('.btn-open-detail').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookId = el.getAttribute('data-book-id');
      if (bookId) openBookDetailModal(bookId);
    });
  });

  // Pick Next Read
  const btnPickNext = container.querySelector('#btn-dash-pick-next');
  if (btnPickNext) {
    btnPickNext.addEventListener('click', () => openPickNextModal());
  }

  // Internal navigation shortcuts
  const linkLib = container.querySelector('#link-view-all-library');
  const btnEmptyLib = container.querySelector('#btn-empty-start-read');
  if (linkLib) linkLib.addEventListener('click', () => window.appNavigate('library'));
  if (btnEmptyLib) btnEmptyLib.addEventListener('click', () => window.appNavigate('library'));

  const linkGoals = container.querySelector('#link-view-goals');
  if (linkGoals) linkGoals.addEventListener('click', () => window.appNavigate('goals'));

  const linkJournal = container.querySelector('#link-view-journal');
  if (linkJournal) linkJournal.addEventListener('click', () => window.appNavigate('journal'));
}
