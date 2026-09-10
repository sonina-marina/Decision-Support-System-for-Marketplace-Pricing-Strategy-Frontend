import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth';
import { usersService } from '../services/users';
import type { LoginRequest } from '../types/auth';
import type { UserView } from '../types/user';

interface AuthContextValue {
  user: UserView | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCurrentUser() {
    const userId = authService.getUserId();
    if (userId === null) {
      setUser(null);
      return;
    }
    try {
      const profile = await usersService.getById(userId);
      setUser(profile);
    } catch {
      authService.logout();
      setUser(null);
    }
  }

  useEffect(() => {
    loadCurrentUser().finally(() => setIsLoading(false));
  }, []);

  async function login(credentials: LoginRequest) {
    await authService.login(credentials);
    await loadCurrentUser();
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри <AuthProvider>');
  return ctx;
}

