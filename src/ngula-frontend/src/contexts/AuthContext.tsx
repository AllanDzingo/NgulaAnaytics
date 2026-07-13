import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/api/client';


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
    // Use a static import of authApi (imported at top of file). The previous
    // dynamic import() could fail to resolve the chunk at runtime and throw
    // BEFORE the network request was ever made, which the Login page then
    // reported as "Invalid email or password" even though the credentials
    // were correct and the API was never called.
    try {
      const { data } = await authApi.login(email, password);
      // API returns: { token, email, fullName, role }
      const { token, fullName, role } = data as { token: string; email: string; fullName: string; role: string };
      const user: User = { id: '', email, fullName, role, isActive: true };

      localStorage.setItem('ngula_token', token);
      localStorage.setItem('ngula_user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      // Surface the real reason in the console so login failures are debuggable
      // instead of silently collapsing into a generic message.
      console.error('Login failed:', err);
      throw err;
    }
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