/**
 * Between the Pages - Reading Goals View
 */

import { stateManager } from '../state.js';
import { getIcon } from '../icons.js';
import { openGoalEditModal } from '../modals.js';
import { showToast, celebrateCompletion } from '../toast.js';

export function renderGoals(container) {
  if (!container) return;

  const stats = stateManager.getStats();
  const goals = stateManager.getGoals();
  const streak = stateManager.getStreak();
  const completedBooks = stateManager.getBooks().filter(b => b.status === 'Completed');

  const yearlyTarget = goals.yearlyTarget || 24;
  const completedCount = completedBooks.length;
  const remainingCount = Math.max(0, yearlyTarget - completedCount);
  const yearlyPercent = Math.min(100, Math.round((completedCount / yearlyTarget) * 100));

  // Circular gauge geometry
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (yearlyPercent / 100) * circumference;

  // Monthly stats
  const monthlyTarget = goals.monthlyTarget || 2;
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const booksThisMonth = completedBooks.filter(b => {
    if (!b.completedDate) return false;
    const d = new Date(b.completedDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const monthlyPercent = Math.min(100, Math.round((booksThisMonth / monthlyTarget) * 100));

  // Encouraging message
  let encouragementTitle = "You're building a beautiful habit!";
  let encouragementMessage = `At your current pace, you are well on track to fulfill your reading aspiration for ${goals.currentYear}. Every page is a step forward.`;

  if (completedCount >= yearlyTarget) {
    encouragementTitle = "Goal Achieved! You're an extraordinary reader! 🌟";
    encouragementMessage = `You set out to finish ${yearlyTarget} books and you made it! Consider setting a new milestone or enjoying your favorite classics again.`;
  } else if (yearlyPercent >= 75) {
    encouragementTitle = "The finish line is in sight!";
    encouragementMessage = `Just ${remainingCount} more book${remainingCount === 1 ? '' : 's'} to hit your annual reading goal. Keep the pages turning!`;
  } else if (yearlyPercent >= 50) {
    encouragementTitle = "Halfway milestone surpassed!";
    encouragementMessage = `You've conquered more than half of your goal. Your dedication to literary enrichment is truly admirable.`;
  }

  // Days of week for streak tracker
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6

  container.innerHTML = `
    <header class="page-header">
      <div>
        <h1 class="page-title">Reading Goals & Intentions</h1>
        <p class="page-subtitle">Track your annual milestones, build lasting habits, and celebrate the books you finish.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-edit-goals">
          ${getIcon('edit')} Adjust Reading Targets
        </button>
      </div>
    </header>

    <!-- Hero Goal Showcase Grid -->
    <div class="goals-hero-grid">
      <!-- Annual Goal Card -->
      <div class="goal-showcase-card">
        <div>
          <div class="goal-card-header">
            <div>
              <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);">Annual Intention</span>
              <h2 class="goal-card-title">${goals.currentYear} Reading Milestone</h2>
            </div>
            <div class="stat-icon" style="background-color: var(--accent-sage-light); color: var(--accent-forest); width: 36px; height: 36px;">
              ${getIcon('target')}
            </div>
          </div>

          <div class="goal-big-gauge-wrap">
            <div class="big-gauge-circle">
              <svg class="gauge-svg" viewBox="0 0 140 140">
                <circle class="gauge-bg" cx="70" cy="70" r="${radius}" stroke-width="12"></circle>
                <circle class="gauge-fill" cx="70" cy="70" r="${radius}" 
                  stroke-width="12"
                  stroke-dasharray="${circumference}" 
                  stroke-dashoffset="${strokeOffset}">
                </circle>
              </svg>
              <div class="gauge-percent tabular-nums">${yearlyPercent}%</div>
            </div>

            <div class="goal-stat-metrics">
              <div class="goal-count-big tabular-nums">${completedCount} <span style="font-size: 1.4rem; font-weight: 500; color: var(--text-muted); font-family: var(--font-sans);">/ ${yearlyTarget}</span></div>
              <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.4;">
                ${completedCount >= yearlyTarget 
                  ? 'Annual goal completed! 🌟' 
                  : `<strong>${remainingCount}</strong> book${remainingCount === 1 ? '' : 's'} remaining to reach your target.`
                }
              </p>
            </div>
          </div>
        </div>

        <div class="goal-encouragement-banner">
          ${getIcon('sparkles')}
          <div>
            <div style="font-family: var(--font-serif); font-size: 1.1rem; font-weight: 600; color: var(--accent-forest);">
              ${encouragementTitle}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.15rem;">
              ${encouragementMessage}
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Target Card -->
      <div class="goal-showcase-card">
        <div>
          <div class="goal-card-header">
            <div>
              <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);">Current Month</span>
              <h2 class="goal-card-title">${currentMonthName} Pacing</h2>
            </div>
            <div class="stat-icon" style="background-color: var(--accent-rose-light); color: var(--accent-rose-dark); width: 36px; height: 36px;">
              ${getIcon('calendar')}
            </div>
          </div>

          <div style="margin: 1.5rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <span style="font-size: 0.9rem; color: var(--text-secondary);">Target: ${monthlyTarget} books per month</span>
              <span class="tabular-nums font-mono" style="font-weight: 600; color: var(--accent-forest);">${booksThisMonth} of ${monthlyTarget} read</span>
            </div>
            <div class="progress-bar-bg" style="height: 10px;">
              <div class="progress-bar-fill" style="width: ${monthlyPercent}%;"></div>
            </div>
          </div>

          <div style="background-color: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1.5rem;">
            <div style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--accent-forest); font-weight: 600;">
              Books Completed in ${goals.currentYear}
            </div>
            <div style="display: flex; gap: 0.75rem; margin-top: 0.85rem; overflow-x: auto; padding-bottom: 0.25rem;">
              ${completedBooks.length > 0 ? completedBooks.map(b => `
                <div style="width: 50px; height: 72px; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1); flex-shrink: 0;" title="${escapeHtml(b.title)}">
                  <img src="${b.coverUrl}" alt="${escapeHtml(b.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
              `).join('') : `
                <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No books completed yet this year. You'll get there!</p>
              `}
            </div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
          <button class="btn btn-sage btn-sm" id="btn-trigger-celebrate">
            ${getIcon('award')} Celebrate Progress
          </button>
        </div>
      </div>
    </div>

    <!-- Daily Reading Streak Tracker -->
    <div class="streak-tracker-card">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--accent-rose-dark);">${getIcon('flame')}</span>
            <h3 style="font-size: 1.45rem; color: var(--accent-forest); font-family: var(--font-serif); font-weight: 600;">
              Daily Reading Rhythm
            </h3>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.2rem;">
            Current Streak: <strong class="tabular-nums" style="color: var(--accent-forest);">${streak.current} consecutive days</strong>. Even 10 minutes a day compounds into dozens of completed volumes.
          </p>
        </div>

        <button class="btn ${streak.checkedToday ? 'btn-secondary' : 'btn-primary'}" id="btn-goal-checkin">
          ${streak.checkedToday ? `${getIcon('check')} Read Today` : `${getIcon('flame')} Mark I Read Today`}
        </button>
      </div>

      <!-- Weekly Rhythm Calendar Days -->
      <div class="streak-days-row">
        ${days.map((day, idx) => {
          const isDone = idx <= todayIndex;
          const isToday = idx === todayIndex;

          return `
            <div class="streak-day-box ${isDone ? 'active' : ''}">
              <div class="streak-day-name">${day}</div>
              <div class="streak-day-icon">
                ${isDone 
                  ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` 
                  : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5BFB2" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>`
                }
              </div>
              ${isToday ? `<div style="font-size: 0.65rem; color: var(--accent-forest); font-weight: 700; margin-top: 0.2rem;">TODAY</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  bindGoalsEvents(container);
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

function bindGoalsEvents(container) {
  // Adjust goals modal
  const btnEdit = container.querySelector('#btn-edit-goals');
  if (btnEdit) {
    btnEdit.addEventListener('click', () => openGoalEditModal());
  }

  // Celebrate progress
  const btnCelebrate = container.querySelector('#btn-trigger-celebrate');
  if (btnCelebrate) {
    btnCelebrate.addEventListener('click', () => {
      celebrateCompletion();
      showToast('Bravo on your reading commitment! 📖✨', 'success');
    });
  }

  // Daily Checkin
  const btnCheckin = container.querySelector('#btn-goal-checkin');
  if (btnCheckin) {
    btnCheckin.addEventListener('click', () => {
      const result = stateManager.checkInToday();
      if (result.alreadyChecked) {
        showToast('You are already checked in for today! Keep savoring those pages.', 'info');
      } else {
        celebrateCompletion();
        showToast(`Streak boosted to ${result.current} days! 🔥`, 'success');
      }
    });
  }
}
