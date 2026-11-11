/**
 * Between the Pages - Authentication View Controller
 * Welcome, Login, Sign Up interfaces
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
          <span class="auth-flourish">Novelle</span>
          <blockquote class="auth-pullquote">
            “To read is to voyage through an infinity of minds, preserving the words that shape our quietest hours.”
          </blockquote>
          <div class="auth-quote-credit">— A sanctuary for thoughtful readers</div>
        </div>
      </div>

      <!-- Authentication Interactive Card -->
      <div class="auth-form-panel">
        <div class="auth-card">
          <!-- Brand Header -->
          <div class="auth-card-header">
            <h1 class="auth-brand-title">Novelle</h1>
            <p class="auth-welcoming-text">
              ${authMode === 'login' 
                ? 'Your reading journey begins here.' 
                : authMode === 'signup' 
                  ? 'Begin your quiet literary sanctuary.' 
                  : 'Recover access to your journal.'}
            </p>
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


  // Login form submit
  const formLogin = container.querySelector('#form-auth-login');

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert(container);

      const email = container.querySelector('#login-email').value;
      const password = container.querySelector('#login-password').value;

      const result = await authService.login(email, password);

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
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert(container);

      const name = container.querySelector('#signup-name').value;
      const email = container.querySelector('#signup-email').value;
      const password = container.querySelector('#signup-password').value;

      const result = await authService.signup(name, email, password);

      if (result.success) {
        showToast(`Welcome to Novelle, ${result.user.name}! ✨`);

        if (typeof window.onAuthSuccess === 'function') {
          window.onAuthSuccess(result.user);
        }
      } else {
        showAlert(container, result.error, 'error');
      }
    });
  }
}
