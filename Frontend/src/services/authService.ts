export interface User {
  id: number;
  full_name: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  token: string;
}

const USER_STORAGE_KEY = 'bitelog_user';
const TOKEN_STORAGE_KEY = 'bitelog_token';

export const authService = {
  // Get stored user from localStorage
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Save session to localStorage and notify listeners
  saveSession(user: User, token: string) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    window.dispatchEvent(new Event('bitelog_auth_changed'));
  },

  // Clear session
  logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event('bitelog_auth_changed'));
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  // Register
  async register(data: {
    full_name: string;
    username: string;
    password: string;
    security_question: string;
    security_answer: string;
  }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const result: AuthResponse = await res.json();
    this.saveSession(result.user, result.token);
    return result;
  },

  // Login
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid username or password');
    }
    const result: AuthResponse = await res.json();
    this.saveSession(result.user, result.token);
    return result;
  },

  // Fetch security question
  async getSecurityQuestion(username: string): Promise<string> {
    const res = await fetch('/api/auth/security-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'User not found');
    }
    const result = await res.json();
    return result.security_question;
  },

  // Reset password
  async resetPassword(data: {
    username: string;
    security_answer: string;
    new_password: string;
  }): Promise<{ message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Password reset failed');
    }
    return await res.json();
  },
};
