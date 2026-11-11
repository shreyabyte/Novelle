/**
 * Between the Pages - Main App Controller & Router
 * Vanilla JavaScript Architecture with Simulated Auth & Individual User Support
 */

import { authService } from './auth.js';
import { stateManager } from './state.js';
import { getIcon } from './icons.js';
import { showToast, celebrateCompletion } from './toast.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLibrary } from './views/library.js';
import { renderJournal } from './views/journal.js';
import { renderGoals } from './views/goals.js';
import { renderInsights } from './views/insights.js';
import { renderAuthView } from './views/auth.js';
import { openConfirmModal } from './modals.js';

let activeView = 'dashboard';

const VIEW_CONTAINERS = {
  dashboard: 'view-dashboard',
  library: 'view-library',
  journal: 'view-journal',
  goals: 'view-goals',
  insights: 'view-insights'
};

export function navigateTo(viewName) {
  if (!VIEW_CONTAINERS[viewName]) return;
  activeView = viewName;

  // Update nav item active states
  document.querySelectorAll('.nav-item').forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Switch view visibility
  Object.entries(VIEW_CONTAINERS).forEach(([name, elementId]) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (name === viewName) {
      el.classList.add('active');
      renderCurrentView(name, el);
    } else {
      el.classList.remove('active');
    }
  });

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Expose navigation globally for helper buttons
window.appNavigate = navigateTo;

function renderCurrentView(viewName, containerEl) {
  switch (viewName) {
    case 'dashboard':
      renderDashboard(containerEl);
      break;
    case 'library':
      renderLibrary(containerEl);
      break;
    case 'journal':
      renderJournal(containerEl);
      break;
    case 'goals':
      renderGoals(containerEl);
      break;
    case 'insights':
      renderInsights(containerEl);
      break;
  }
}

function updateSidebarStreak() {
  const streak = stateManager.getStreak();
  const countEl = document.getElementById('sidebar-streak-count');
  const btnEl = document.getElementById('btn-sidebar-checkin');

  if (countEl) countEl.textContent = `${streak.current} Days`;
  if (btnEl) {
    if (streak.checkedToday) {
      btnEl.textContent = 'Read Today ✓';
      btnEl.classList.add('checked');
    } else {
      btnEl.textContent = 'Check In';
      btnEl.classList.remove('checked');
    }
  }
}

function updateUserInfo(user) {
  if (!user) return;
  
  const avatarEl = document.getElementById('sidebar-user-avatar');
  const nameEl = document.getElementById('sidebar-user-name');
  const emailEl = document.getElementById('sidebar-user-email');
  const mobileNameEl = document.getElementById('mobile-user-name');

  if (avatarEl) avatarEl.textContent = user.avatarInitial || user.name.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (mobileNameEl) mobileNameEl.textContent = user.name.split(' ')[0] || user.name;
}

function handleLogout() {
  authService.logout();
  showToast('You have signed out of your journal.', 'info');
  syncAuthScreen();
}

function syncAuthScreen() {
  const authContainer = document.getElementById('auth-container');
  const appLayout = document.getElementById('app-layout');
  const user = authService.getCurrentUser();

  if (!user) {
    if (appLayout) appLayout.style.display = 'none';
    if (authContainer) {
      authContainer.style.display = 'flex';
      renderAuthView(authContainer);
    }
  } else {
    if (authContainer) authContainer.style.display = 'none';
    if (appLayout) appLayout.style.display = 'flex';

    stateManager.setUser(user);
    updateUserInfo(user);
    updateSidebarStreak();
    navigateTo('dashboard');
  }
}

// Global callback when user successfully signs in / signs up
window.onAuthSuccess = (user) => {
  syncAuthScreen();
};

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  // Check current session - if no active session, syncAuthScreen will display the Welcome/Login view
  const currentUser = authService.getCurrentUser();

  // Setup navigation items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      navigateTo(view);
    });
  });

  // Mobile menu button
  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Logout triggers
  const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
  if (btnSidebarLogout) {
    btnSidebarLogout.addEventListener('click', (e) => {
      e.stopPropagation();
      handleLogout();
    });
  }

  const btnMobileLogout = document.getElementById('btn-mobile-logout');
  if (btnMobileLogout) {
    btnMobileLogout.addEventListener('click', (e) => {
      e.stopPropagation();
      handleLogout();
    });
  }

  // Sidebar daily check-in
  const btnSidebarCheckin = document.getElementById('btn-sidebar-checkin');
  if (btnSidebarCheckin) {
    btnSidebarCheckin.addEventListener('click', () => {
      const result = stateManager.checkInToday();
      if (result.alreadyChecked) {
        showToast('You are already checked in for today!', 'info');
      } else {
        celebrateCompletion();
        showToast(`Streak increased to ${result.current} days! 🔥`, 'success');
      }
    });
  }

  // Subscribe to state changes to re-render active view and sidebar stats
  stateManager.subscribe((event, payload) => {
    updateSidebarStreak();
    const currentContainer = document.getElementById(VIEW_CONTAINERS[activeView]);
    if (currentContainer && currentContainer.classList.contains('active')) {
      renderCurrentView(activeView, currentContainer);
    }
  });

  // Listen to auth changes
  authService.onAuthChange((event, user) => {
    if (event === 'logout') {
      syncAuthScreen();
    } else {
      updateUserInfo(user);
    }
  });

  // Initial display sync
  syncAuthScreen();
});
