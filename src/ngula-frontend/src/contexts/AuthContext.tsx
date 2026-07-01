import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ngula_user');
    const token = localStorage.getItem('ngula_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await import('@/api/client').then(m => m.authApi.login(email, password));
    // API returns: { token, email, fullName, role }
    const { token, fullName, role } = data as { token: string; email: string; fullName: string; role: string };
    const user: User = { id: '', email, fullName, role, isActive: true };

    localStorage.setItem('ngula_token', token);
    localStorage.setItem('ngula_user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('ngula_token');
    localStorage.removeItem('ngula_user');
    setUser(null);
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    if (role === 'All') return true;
    return user.role === role || user.role === 'Executive';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}