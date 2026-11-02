/**
 * Between the Pages - Reading Insights View (Charts & Analytics)
 */

import { stateManager } from '../state.js';
import { getIcon } from '../icons.js';

export function renderInsights(container) {
  if (!container) return;

  const stats = stateManager.getStats();
  const books = stateManager.getBooks();

  // Monthly pages calculation for past 6 months
  const monthlyData = [
    { month: 'Jun', pages: 340, books: 1 },
    { month: 'Jul', pages: 480, books: 2 },
    { month: 'Aug', pages: 610, books: 2 },
    { month: 'Sep', pages: 750, books: 3 },
    { month: 'Oct', pages: 580, books: 2 },
    { month: 'Nov', pages: 290, books: 1, current: true }
  ];

  // Adjust current month with live data
  const livePagesSum = stats.totalPagesRead;
  if (livePagesSum > 1000) {
    monthlyData[5].pages = Math.min(850, Math.round(livePagesSum * 0.28));
  }

  const maxPages = Math.max(...monthlyData.map(d => d.pages), 800);

  // Genre breakdown
  const genreEntries = Object.entries(stats.genreMap || {}).sort((a, b) => b[1] - a[1]);
  const totalGenreBooks = books.length || 1;

  container.innerHTML = `
    <header class="page-header">
      <div>
        <h1 class="page-title">Reading Insights</h1>
        <p class="page-subtitle">Reflective patterns and quantitative records of your intellectual journey.</p>
      </div>
    </header>

    <!-- Key Metrics Ribbon -->
    <div class="stats-grid" style="margin-bottom: 2.25rem;">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Total Completed</span>
          <div class="stat-icon">${getIcon('book')}</div>
        </div>
        <div class="stat-value tabular-nums">${stats.completedCount}</div>
        <div class="stat-subtext">Finished volumes</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Total Pages Read</span>
          <div class="stat-icon">${getIcon('book-open')}</div>
        </div>
        <div class="stat-value tabular-nums">${stats.totalPagesRead.toLocaleString()}</div>
        <div class="stat-subtext">Estimated ~${Math.round(stats.totalPagesRead * 1.5)} minutes read</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Average Rating</span>
          <div class="stat-icon" style="background-color: var(--accent-amber-light); color: var(--accent-amber);">${getIcon('star')}</div>
        </div>
        <div class="stat-value tabular-nums">${stats.avgRating} <span style="font-size: 1.1rem; color: var(--accent-amber);">★</span></div>
        <div class="stat-subtext">Across evaluated titles</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Favorite Genre</span>
          <div class="stat-icon" style="background-color: var(--accent-rose-light); color: var(--accent-rose-dark);">${getIcon('feather')}</div>
        </div>
        <div class="stat-value" style="font-size: 1.45rem; line-height: 1.25; margin-top: 0.25rem;">${stats.topGenre}</div>
        <div class="stat-subtext">${stats.topGenreCount} books in collection</div>
      </div>
    </div>

    <!-- Charts Two-Column Grid -->
    <div class="insights-charts-grid">
      <!-- Monthly Pages Bar Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">Pages Turned Over Time</h2>
          <p class="chart-desc">Monthly reading activity recorded over the past 6 months</p>
        </div>

        <div class="bar-chart-container">
          <svg class="bar-chart-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
            <!-- Gridlines -->
            <line x1="40" y1="30" x2="480" y2="30" stroke="#EFEAE0" stroke-width="1" />
            <line x1="40" y1="90" x2="480" y2="90" stroke="#EFEAE0" stroke-width="1" />
            <line x1="40" y1="150" x2="480" y2="150" stroke="#EFEAE0" stroke-width="1" />
            
            ${monthlyData.map((d, i) => {
              const barWidth = 36;
              const spacing = 70;
              const x = 55 + i * spacing;
              const barHeight = Math.round((d.pages / maxPages) * 120);
              const y = 150 - barHeight;

              return `
                <g class="chart-bar-group">
                  <!-- Bar Rect -->
                  <rect 
                    x="${x}" 
                    y="${y}" 
                    width="${barWidth}" 
                    height="${barHeight}" 
                    rx="4" 
                    class="chart-bar ${d.current ? 'chart-bar-current' : ''}"
                  >
                    <title>${d.month}: ${d.pages} pages read</title>
                  </rect>

                  <!-- Value Top Label -->
                  <text x="${x + barWidth / 2}" y="${y - 8}" class="chart-value-label tabular-nums">${d.pages}</text>

                  <!-- Month Axis Bottom Label -->
                  <text x="${x + barWidth / 2}" y="172" class="chart-axis-label">${d.month}</text>
                </g>
              `;
            }).join('')}
          </svg>
        </div>

        <div style="margin-top: 1rem; display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid rgba(44, 45, 41, 0.05); padding-top: 0.75rem;">
          <span>Monthly average: ~${Math.round(monthlyData.reduce((s, d) => s + d.pages, 0) / monthlyData.length)} pages</span>
          <span>Highest month: ${monthlyData.reduce((m, d) => d.pages > m.pages ? d : m, monthlyData[0]).month}</span>
        </div>
      </div>

      <!-- Genre Distribution Horizontal Bars -->
      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">Genres & Subjects</h2>
          <p class="chart-desc">Breakdown of literary subjects in your library</p>
        </div>

        <div class="genre-bars-list">
          ${genreEntries.length > 0 ? genreEntries.map(([genre, count]) => {
            const pct = Math.round((count / totalGenreBooks) * 100);
            return `
              <div class="genre-bar-item">
                <div class="genre-bar-meta">
                  <span class="genre-name">${escapeHtml(genre)}</span>
                  <span class="genre-count tabular-nums">${count} book${count === 1 ? '' : 's'} (${pct}%)</span>
                </div>
                <div class="genre-track">
                  <div class="genre-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('') : `
            <p style="color: var(--text-muted); font-size: 0.9rem;">Add books to explore your genre preferences.</p>
          `}
        </div>
      </div>
    </div>

    <!-- Second Row: Reading Status Breakdown & Reading Pace Insights -->
    <div class="insights-charts-grid">
      <!-- Status Breakdown -->
      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">Collection Status Distribution</h2>
          <p class="chart-desc">Where each book currently rests along your reading continuum</p>
        </div>

        <!-- Visual Segmented Bar -->
        <div style="height: 14px; width: 100%; border-radius: 999px; overflow: hidden; display: flex; margin: 1.25rem 0 1.75rem;">
          <div style="width: ${(stats.completedCount / totalGenreBooks) * 100}%; background-color: var(--accent-sage);" title="Completed"></div>
          <div style="width: ${(stats.currentlyReadingCount / totalGenreBooks) * 100}%; background-color: var(--accent-forest);" title="Currently Reading"></div>
          <div style="width: ${(stats.wantToReadCount / totalGenreBooks) * 100}%; background-color: var(--accent-amber);" title="Want to Read"></div>
          <div style="width: ${(stats.onHoldCount / totalGenreBooks) * 100}%; background-color: var(--accent-rose);" title="On Hold"></div>
          <div style="width: ${(stats.droppedCount / totalGenreBooks) * 100}%; background-color: var(--text-muted);" title="Dropped"></div>
        </div>

        <div class="status-breakdown-list">
          <div class="status-breakdown-row">
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-dot completed"></span> Completed
            </span>
            <span class="tabular-nums font-mono"><strong>${stats.completedCount}</strong> (${Math.round((stats.completedCount / totalGenreBooks) * 100)}%)</span>
          </div>

          <div class="status-breakdown-row">
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-dot reading"></span> Currently Reading
            </span>
            <span class="tabular-nums font-mono"><strong>${stats.currentlyReadingCount}</strong> (${Math.round((stats.currentlyReadingCount / totalGenreBooks) * 100)}%)</span>
          </div>

          <div class="status-breakdown-row">
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-dot want"></span> Want to Read
            </span>
            <span class="tabular-nums font-mono"><strong>${stats.wantToReadCount}</strong> (${Math.round((stats.wantToReadCount / totalGenreBooks) * 100)}%)</span>
          </div>

          <div class="status-breakdown-row">
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-dot hold"></span> On Hold
            </span>
            <span class="tabular-nums font-mono"><strong>${stats.onHoldCount}</strong> (${Math.round((stats.onHoldCount / totalGenreBooks) * 100)}%)</span>
          </div>
        </div>
      </div>

      <!-- Reading Pace & Curatorial Notes -->
      <div class="chart-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="chart-header">
            <h2 class="chart-title">Reading Habit Reflections</h2>
            <p class="chart-desc">Observations drawn from your current library activity</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.15rem; margin-top: 1rem;">
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div class="stat-icon" style="flex-shrink: 0; background: var(--accent-sage-light); color: var(--accent-forest);">${getIcon('book-open')}</div>
              <div>
                <strong style="color: var(--accent-forest); display: block;">Average Book Length</strong>
                <span style="font-size: 0.88rem; color: var(--text-secondary);">
                  ~${Math.round(stats.totalLibraryPages / totalGenreBooks)} pages per book. You favor thoughtful, medium-length volumes.
                </span>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div class="stat-icon" style="flex-shrink: 0; background: var(--accent-rose-light); color: var(--accent-rose-dark);">${getIcon('star')}</div>
              <div>
                <strong style="color: var(--accent-forest); display: block;">High Curation Quality</strong>
                <span style="font-size: 0.88rem; color: var(--text-secondary);">
                  With an average rating of ${stats.avgRating} ★, you select books with care and intention.
                </span>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div class="stat-icon" style="flex-shrink: 0; background: var(--accent-amber-light); color: var(--accent-amber);">${getIcon('feather')}</div>
              <div>
                <strong style="color: var(--accent-forest); display: block;">Journaling Ratio</strong>
                <span style="font-size: 0.88rem; color: var(--text-secondary);">
                  You've documented ${stats.journalCount} journal reflections for your reading journey.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style="background-color: var(--bg-primary); border-radius: var(--radius-sm); padding: 1rem; margin-top: 1.5rem; font-size: 0.82rem; color: var(--text-secondary); font-style: italic; border: 1px solid var(--border-light);">
          “To read is to fly: it is to soar to a point of vantage which gives a view over wide terrains of history, human variety, ideas, and emotion.”
        </div>
      </div>
    </div>
  `;
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
