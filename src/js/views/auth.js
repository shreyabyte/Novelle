/**
 * Between the Pages - Authentication View Controller
 * Welcome, Login, Sign Up, and Forgot Password interfaces
 */

import { authService } from '../auth.js';
import { getIcon } from '../icons.js';
import { showToast } from '../toast.js';

let authMode = 'login'; // 'login' | 'signup' | 'forgot'
let showPassword = false;

export function renderAuthView(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="auth-layout">
      <!-- Ambient Editorial Hero Panel -->
      <div class="auth-editorial-panel">
        <div class="auth-quote-wrap">
          <span class="auth-flourish">Between the Pages</span>
          <blockquote class="auth-pullquote">
            “To read is to voyage through an infinity of minds, preserving the words that shape our quietest hours.”
          </blockquote>
          <div class="auth-quote-credit">— A sanctuary for thoughtful readers</div>
          
          <div style="margin-top: 2rem; position: relative; z-index: 2;">
            <button class="btn btn-primary" id="btn-editorial-watch-demo" style="background: var(--accent-forest); color: white; border: 1px solid rgba(255,255,255,0.2);">
              ${getIcon('sparkles')} Watch Demo Preview
            </button>
          </div>
        </div>
      </div>

      <!-- Authentication Interactive Card -->
      <div class="auth-form-panel">
        <div class="auth-card">
          <!-- Brand Header -->
          <div class="auth-card-header">
            <h1 class="auth-brand-title">Between the Pages</h1>
            <p class="auth-welcoming-text">
              ${authMode === 'login' 
                ? 'Your reading journey begins here.' 
                : authMode === 'signup' 
                  ? 'Begin your quiet literary sanctuary.' 
                  : 'Recover access to your journal.'}
            </p>
          </div>

          <!-- Watch Demo Banner -->
          <div class="auth-demo-banner">
            <div>
              <div class="auth-demo-banner-title">
                ${getIcon('sparkles')}
                <span>Watch Live Demo</span>
              </div>
              <p class="auth-demo-banner-desc">Explore the library, progress tracker, and journal with no sign-in.</p>
            </div>
            <button class="btn btn-sage btn-sm" id="btn-watch-demo" style="white-space: nowrap;">
              Enter Demo →
            </button>
          </div>

          <!-- Auth Mode Navigation Tabs -->
          ${authMode !== 'forgot' ? `
            <div class="auth-mode-tabs" role="tablist">
              <button 
                class="auth-mode-tab ${authMode === 'login' ? 'active' : ''}" 
                id="tab-mode-login" 
                role="tab"
              >
                Sign In
              </button>
              <button 
                class="auth-mode-tab ${authMode === 'signup' ? 'active' : ''}" 
                id="tab-mode-signup" 
                role="tab"
              >
                Create Account
              </button>
            </div>
          ` : ''}

          <!-- Feedback Error / Notice Banner -->
          <div id="auth-alert-box" class="auth-alert" style="display: none;"></div>

          <!-- Form Content -->
          ${authMode === 'login' ? renderLoginForm() : authMode === 'signup' ? renderSignupForm() : renderForgotForm()}

          <!-- Demo Quick Switcher Bar -->
          <div class="auth-demo-ribbon">
            <span class="auth-demo-label">Instant Demo Profiles:</span>
            <div class="auth-demo-buttons">
              <button class="btn-demo-quick" data-email="eleanor@betweenthepages.com" data-password="password123" title="Log in as Eleanor Vance">
                Eleanor (5 Books)
              </button>
              <button class="btn-demo-quick" data-email="julian@betweenthepages.com" data-password="password123" title="Log in as Julian Morrow">
                Julian (3 Books)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  bindAuthEvents(container);
}

function renderLoginForm() {
  return `
    <form id="form-auth-login" class="auth-form" novalidate>
      <div class="form-group">
        <label class="form-label" for="login-email">Email Address</label>
        <div class="input-icon-wrap">
          <span class="input-leading-icon">${getIcon('mail')}</span>
          <input 
            type="email" 
            id="login-email" 
            class="form-input has-icon" 
            placeholder="reader@betweenthepages.com" 
            required 
            autocomplete="email"
          />
        </div>
      </div>

      <div class="form-group">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <label class="form-label" for="login-password">Password</label>
          <a href="#" class="auth-link" id="link-goto-forgot" style="font-size: 0.8rem;">Forgot password?</a>
        </div>
        <div class="input-icon-wrap">
          <span class="input-leading-icon">${getIcon('lock')}</span>
          <input 
            type="${showPassword ? 'text' : 'password'}" 
            id="login-password" 
            class="form-input has-icon has-trailing" 
            placeholder="••••••••" 
            required 
            autocomplete="current-password"
          />
          <button type="button" class="btn-password-toggle" id="btn-toggle-password" title="Toggle password visibility" aria-label="Toggle password visibility">
            ${showPassword ? getIcon('eye-off') : getIcon('eye')}
          </button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-auth-submit">
        Sign In to Your Journal
      </button>

      <div class="auth-switch-prompt">
        Don’t have an account yet? <a href="#" class="auth-link" id="link-goto-signup">Create one now</a>
      </div>
    </form>
  `;
}

function renderSignupForm() {
  return `
    <form id="form-auth-signup" class="auth-form" novalidate>
      <div class="form-group">
        <label class="form-label" for="signup-name">Your Full Name</label>
        <div class="input-icon-wrap">
          <span class="input-leading-icon">${getIcon('user')}</span>
          <input 
            type="text" 
            id="signup-name" 
            class="form-input has-icon" 
            placeholder="e.g. Clara Oswald" 
            required 
            autocomplete="name"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="signup-email">Email Address</label>
        <div class="input-icon-wrap">
          <span class="input-leading-icon">${getIcon('mail')}</span>
          <input 
            type="email" 
            id="signup-email" 
            class="form-input has-icon" 
            placeholder="clara@example.com" 
            required 
            autocomplete="email"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="signup-password">Create Password (min. 6 characters)</label>
        <div class="input-icon-wrap">
          <span class="input-leading-icon">${getIcon('lock')}</span>
          <input 
            type="${showPassword ? 'text' : 'password'}" 
            id="signup-password" 
            class="form-input has-icon has-trailing" 
            placeholder="••••••••" 
            required 
            autocomplete="new-password"
          />
          <button type="button" class="btn-password-toggle" id="btn-toggle-password" title="Toggle password visibility" aria-label="Toggle password visibility">
            ${showPassword ? getIcon('eye-off') : getIcon('eye')}
          </button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-auth-submit">
        Start My Reading Sanctuary
      </button>

      <div class="auth-switch-prompt">
        Already have an account? <a href="#" class="auth-link" id="link-goto-login">Sign in here</a>
      </div>
    </form>
  `;
}

function renderForgotForm() {
  return `
    <form id="form-auth-forgot" class="auth-form" novalidate>
      <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.25rem;">
        Enter your registered email below. We’ll simulate sending a reset link so you can regain entry to your reading records.
      </p>

      <div class="form-group">
        <label class="form-label" for="forgot-email">Account Email Address</label>
        <div class="input-icon-wrap">
          <span class="input-leading-icon">${getIcon('mail')}</span>
          <input 
            type="email" 
            id="forgot-email" 
            class="form-input has-icon" 
            placeholder="reader@betweenthepages.com" 
            required 
          />
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-auth-submit">
        Send Reset Instructions
      </button>

      <div class="auth-switch-prompt">
        Remembered your password? <a href="#" class="auth-link" id="link-back-login">Return to Sign In</a>
      </div>
    </form>
  `;
}

function showAlert(container, message, type = 'error') {
  const alertBox = container.querySelector('#auth-alert-box');
  if (!alertBox) return;

  alertBox.className = `auth-alert auth-alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
}

function hideAlert(container) {
  const alertBox = container.querySelector('#auth-alert-box');
  if (alertBox) alertBox.style.display = 'none';
}

function bindAuthEvents(container) {
  // Mode switches
  const tabLogin = container.querySelector('#tab-mode-login');
  const tabSignup = container.querySelector('#tab-mode-signup');
  const linkGotoSignup = container.querySelector('#link-goto-signup');
  const linkGotoLogin = container.querySelector('#link-goto-login');
  const linkGotoForgot = container.querySelector('#link-goto-forgot');
  const linkBackLogin = container.querySelector('#link-back-login');

  if (tabLogin) tabLogin.addEventListener('click', () => { authMode = 'login'; renderAuthView(container); });
  if (tabSignup) tabSignup.addEventListener('click', () => { authMode = 'signup'; renderAuthView(container); });
  if (linkGotoSignup) linkGotoSignup.addEventListener('click', (e) => { e.preventDefault(); authMode = 'signup'; renderAuthView(container); });
  if (linkGotoLogin) linkGotoLogin.addEventListener('click', (e) => { e.preventDefault(); authMode = 'login'; renderAuthView(container); });
  if (linkGotoForgot) linkGotoForgot.addEventListener('click', (e) => { e.preventDefault(); authMode = 'forgot'; renderAuthView(container); });
  if (linkBackLogin) linkBackLogin.addEventListener('click', (e) => { e.preventDefault(); authMode = 'login'; renderAuthView(container); });

  // Watch Demo Handlers
  const handleWatchDemo = () => {
    const res = authService.loginAsDemo('eleanor');
    if (res.success) {
      showToast(`Entering Demo Mode! Exploring Eleanor’s reading sanctuary 📖✨`);
      if (typeof window.onAuthSuccess === 'function') {
        window.onAuthSuccess(res.user);
      }
    }
  };

  const btnWatchDemo = container.querySelector('#btn-watch-demo');
  if (btnWatchDemo) btnWatchDemo.addEventListener('click', handleWatchDemo);

  const btnEditorialDemo = container.querySelector('#btn-editorial-watch-demo');
  if (btnEditorialDemo) btnEditorialDemo.addEventListener('click', handleWatchDemo);

  // Password visibility toggle
  const btnTogglePw = container.querySelector('#btn-toggle-password');
  if (btnTogglePw) {
    btnTogglePw.addEventListener('click', () => {
      showPassword = !showPassword;
      const pwInput = container.querySelector('#login-password') || container.querySelector('#signup-password');
      if (pwInput) {
        pwInput.type = showPassword ? 'text' : 'password';
        btnTogglePw.innerHTML = showPassword ? getIcon('eye-off') : getIcon('eye');
      }
    });
  }

  // Quick Demo Buttons
  container.querySelectorAll('.btn-demo-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      const password = btn.getAttribute('data-password');
      const res = authService.login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}! 📚`);
        if (typeof window.onAuthSuccess === 'function') {
          window.onAuthSuccess(res.user);
        }
      }
    });
  });

  // Login form submit
  const formLogin = container.querySelector('#form-auth-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert(container);

      const email = container.querySelector('#login-email').value;
      const password = container.querySelector('#login-password').value;

      const result = authService.login(email, password);
      if (result.success) {
        showToast(`Welcome back, ${result.user.name}! 📖`);
        if (typeof window.onAuthSuccess === 'function') {
          window.onAuthSuccess(result.user);
        }
      } else {
        showAlert(container, result.error, 'error');
      }
    });
  }

  // Sign up form submit
  const formSignup = container.querySelector('#form-auth-signup');
  if (formSignup) {
    formSignup.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert(container);

      const name = container.querySelector('#signup-name').value;
      const email = container.querySelector('#signup-email').value;
      const password = container.querySelector('#signup-password').value;

      const result = authService.signup(name, email, password);
      if (result.success) {
        showToast(`Welcome to Between the Pages, ${result.user.name}! ✨`);
        if (typeof window.onAuthSuccess === 'function') {
          window.onAuthSuccess(result.user);
        }
      } else {
        showAlert(container, result.error, 'error');
      }
    });
  }

  // Forgot password form submit
  const formForgot = container.querySelector('#form-auth-forgot');
  if (formForgot) {
    formForgot.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert(container);

      const email = container.querySelector('#forgot-email').value;
      const result = authService.requestPasswordReset(email);
      if (result.success) {
        showAlert(container, result.message, 'success');
      } else {
        showAlert(container, result.error, 'error');
      }
    });
  }
}
