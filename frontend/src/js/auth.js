
import { apiRequest } from "./api.js";

const TOKEN_KEY = "reading_tracker_token";
const USER_KEY = "reading_tracker_user";

class AuthService {
    constructor() {
        this.listeners = [];
        this.currentUser = this.loadSession();
    }

    loadSession() {
        try {
            const user = localStorage.getItem(USER_KEY);
            const token = localStorage.getItem(TOKEN_KEY);

            if (user && token) {
                return JSON.parse(user);
            }
        } catch (error) {
            console.error("Session loading error:", error);
        }

        return null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    onAuthChange(callback) {
        this.listeners.push(callback);

        return () => {
            this.listeners = this.listeners.filter(
                cb => cb !== callback
            );
        };
    }

    notify(event, user) {
        this.listeners.forEach(callback => callback(event, user));
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    saveSession(user, token) {
        const formattedUser = {
            id: String(user.user_id),
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            avatarInitial: user.name.charAt(0).toUpperCase()
        };

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(formattedUser));

        this.currentUser = formattedUser;

        return formattedUser;
    }

    async login(email, password) {
        const cleanEmail = (email || "").trim().toLowerCase();

        if (!cleanEmail || !this.validateEmail(cleanEmail)) {
            return {
                success: false,
                error: "Please enter a valid email address."
            };
        }

        if (!password) {
            return {
                success: false,
                error: "Please enter your password."
            };
        }

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: cleanEmail,
                    password
                })
            });

            const user = this.saveSession(data.user, data.token);

            this.notify("login", user);

            return { success: true, user };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signup(name, email, password) {
        const cleanName = (name || "").trim();
        const cleanEmail = (email || "").trim().toLowerCase();

        if (cleanName.length < 2) {
            return {
                success: false,
                error: "Please enter your full name."
            };
        }

        if (!this.validateEmail(cleanEmail)) {
            return {
                success: false,
                error: "Please enter a valid email address."
            };
        }

        if (!password || password.length < 6) {
            return {
                success: false,
                error: "Password must be at least 6 characters long."
            };
        }

        try {
            await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: cleanName,
                    email: cleanEmail,
                    password
                })
            });

            // Log in after successful registration
            return await this.login(cleanEmail, password);

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    requestPasswordReset() {
        return {
            success: false,
            error: "Password reset is not available yet."
        };
    }

    logout() {
        const previousUser = this.currentUser;

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        this.currentUser = null;
        this.notify("logout", previousUser);
    }
}

export const authService = new AuthService();
