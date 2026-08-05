import { apiRequest } from './api/httpClient';
import type { LoginRequest, LoginResponse } from '../types/auth';
import { decodeJwtPayload } from '../utils/jwt';

const TOKEN_KEY = 'pricelens-token';

interface TokenPayload {
  sub?: string;
  role?: 'ADMIN' | 'SELLER';
  exp?: number;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<void> {
    const { access_token } = await apiRequest<LoginResponse>('/api/v1/login/', {
      method: 'POST',
      body: credentials,
    });
    localStorage.setItem(TOKEN_KEY, access_token);
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return localStorage.getItem(TOKEN_KEY) !== null;
  },

  getRole(): 'ADMIN' | 'SELLER' | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      return decodeJwtPayload<TokenPayload>(token).role ?? null;
    } catch {
      return null;
    }
  },

  getUserId(): number | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const sub = decodeJwtPayload<TokenPayload>(token).sub;
      return sub !== undefined ? Number(sub) : null;
    } catch {
      return null;
    }
  },
};

