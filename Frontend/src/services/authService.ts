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
const DB_NAME = 'bitelog_permanent_store';
const STORE_NAME = 'session';

// IndexedDB permanent store helper (survives Android webview resets, reboots & process kills)
function openPermanentDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function setPermanentValue(key: string, val: string): Promise<void> {
  const db = await openPermanentDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getPermanentValue(key: string): Promise<string | null> {
  const db = await openPermanentDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function deletePermanentValue(key: string): Promise<void> {
  const db = await openPermanentDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      if (window.location.port && window.location.port !== '8001') {
        return 'http://127.0.0.1:8001/api';
      }
    }
  }
  return '/api';
};

const API_BASE = getApiBase();

export const authService = {
  // Synchronously get stored user from localStorage
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Auto-restore session on app launch across restarts, task kills, or reboot
  async initSession(): Promise<User | null> {
    let user = this.getCurrentUser();
    if (!user) {
      const storedUserData = await getPermanentValue(USER_STORAGE_KEY);
      const storedToken = await getPermanentValue(TOKEN_STORAGE_KEY);
      if (storedUserData && storedToken) {
        try {
          user = JSON.parse(storedUserData);
          localStorage.setItem(USER_STORAGE_KEY, storedUserData);
          localStorage.setItem(TOKEN_STORAGE_KEY, storedToken);
          window.dispatchEvent(new Event('bitelog_auth_changed'));
        } catch {
          user = null;
        }
      }
    } else {
      // Sync to permanent store as well
      setPermanentValue(USER_STORAGE_KEY, JSON.stringify(user));
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) setPermanentValue(TOKEN_STORAGE_KEY, token);
    }
    return user;
  },

  // Save session permanently (dual-layer: localStorage + IndexedDB)
  saveSession(user: User, token: string) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setPermanentValue(USER_STORAGE_KEY, JSON.stringify(user));
    setPermanentValue(TOKEN_STORAGE_KEY, token);
    window.dispatchEvent(new Event('bitelog_auth_changed'));
  },

  // Clear session ONLY when the user manually clicks "Sign Out"
  logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    deletePermanentValue(USER_STORAGE_KEY);
    deletePermanentValue(TOKEN_STORAGE_KEY);
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
    const res = await fetch(`${API_BASE}/auth/register`, {
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
    const res = await fetch(`${API_BASE}/auth/login`, {
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
    const res = await fetch(`${API_BASE}/auth/security-question`, {
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
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
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
