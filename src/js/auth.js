/**
 * Between the Pages - Simulated Authentication System
 * 
 * Note: This module implements simulated client-side authentication for 
 * individual user experiences and prototyping. It does not provide cryptographic 
 * backend security, but is structured cleanly to be swapped with a real 
 * backend/OAuth provider in a future phase.
 */

const USERS_STORAGE_KEY = 'between_the_pages_users_v1';
const SESSION_STORAGE_KEY = 'between_the_pages_session_v2';

// Seed default users so the app is immediately testable
const DEFAULT_USERS = [
  {
    id: 'user-eleanor',
    name: 'Eleanor Vance',
    email: 'eleanor@betweenthepages.com',
    password: 'password123',
    avatarInitial: 'E',
    joinedDate: '2026-08-01'
  },
  {
    id: 'user-julian',
    name: 'Julian Morrow',
    email: 'julian@betweenthepages.com',
    password: 'password123',
    avatarInitial: 'J',
    joinedDate: '2026-09-15'
  }
];

class AuthService {
  constructor() {
    this.listeners = [];
    this.users = this.loadUsers();
    this.currentUser = this.loadSession();
  }

  loadUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read users from localStorage', e);
    }
    // Initialize default users
    this.saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  saveUsers(usersList = this.users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  loadSession() {
    try {
      const activeUserId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (activeUserId) {
        const found = this.users.find(u => u.id === activeUserId);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Could not load session', e);
    }
    // If no active session, default to null so the login view is presented or user can login
    return null;
  }

  saveSession(user) {
    try {
      if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, user.id);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to update session in storage', e);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUsers() {
    return this.users;
  }

  onAuthChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, user) {
    this.listeners.forEach(cb => cb(event, user));
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * Watch Demo / Instant Preview Login
   * Seamlessly enters demo mode with preloaded library
   */
  loginAsDemo(profile = 'eleanor') {
    const targetEmail = profile === 'julian' ? 'julian@betweenthepages.com' : 'eleanor@betweenthepages.com';
    const user = this.users.find(u => u.email.toLowerCase() === targetEmail) || this.users[0];
    if (user) {
      this.currentUser = user;
      this.saveSession(user);
      this.notify('login', user);
      return { success: true, user };
    }
    return { success: false, error: 'Demo user not available' };
  }

  /**
   * Simulated Login
   */
  login(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!this.validateEmail(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    const user = this.users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      return { 
        success: false, 
        error: 'No account found with this email. Please check your spelling or sign up.' 
      };
    }

    if (user.password !== cleanPassword) {
      return { 
        success: false, 
        error: 'Incorrect password. Please try again or use the reset option.' 
      };
    }

    // Login successful
    this.currentUser = user;
    this.saveSession(user);
    this.notify('login', user);
    return { success: true, user };
  }

  /**
   * Simulated Sign Up
   */
  signup(name, email, password) {
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 letters).' };
    }
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!this.validateEmail(trimmedEmail)) {
      return { success: false, error: 'Please provide a valid email format.' };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check existing email
    const exists = this.users.some(u => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { 
        success: false, 
        error: 'An account with this email already exists. Try signing in instead.' 
      };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      password: cleanPassword,
      avatarInitial: trimmedName.charAt(0).toUpperCase() || 'R',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    this.users.push(newUser);
    this.saveUsers(this.users);

    this.currentUser = newUser;
    this.saveSession(newUser);
    this.notify('signup', newUser);

    return { success: true, user: newUser };
  }

  /**
   * Simulated Forgot Password
   */
  requestPasswordReset(email) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Please provide the email linked to your reading journal.' };
    }
    if (!this.validateEmail(trimmedEmail)) {
      return { success: false, error: 'Please provide a valid email format.' };
    }

    const user = this.users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      return { 
        success: false, 
        error: 'We could not find an account associated with that email address.' 
      };
    }

    // In a real system an email would be sent. Here we simulate success.
    return { 
      success: true, 
      message: `A simulated password reset instructions note has been dispatched to ${user.email}. (Demo password is: ${user.password})` 
    };
  }

  /**
   * Simulated Logout
   */
  logout() {
    const prevUser = this.currentUser;
    this.currentUser = null;
    this.saveSession(null);
    this.notify('logout', prevUser);
  }
}

export const authService = new AuthService();
