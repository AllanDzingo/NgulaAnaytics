import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NgulaLogo } from '@/components/NgulaLogo';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // NOTE: These must match the credentials created by the backend DataSeeder
  // (src/NgulAnalytics.Api/Seed/DataSeeder.cs -> CreateUser). The password is
  // "Demo@2025". Previously this page used "Ngula2025!", which did not match
  // the seeded hash, so every demo button produced "invalid credentials".
  const DEMO_PASSWORD = 'Demo@2025';
  const demoUsers = [
    { label: 'Executive', email: 'exec@ngula.demo' },
    { label: 'Engineering', email: 'engineer@ngula.demo' },
    { label: 'Production', email: 'production@ngula.demo' },
    { label: 'SHEQ', email: 'sheq@ngula.demo' },
    { label: 'Supervisor', email: 'supervisor@ngula.demo' },
  ];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password. Try a demo account below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(212,168,67,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(30,60,114,0.6) 0%, transparent 50%), var(--navy-900)',
      }}
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(var(--gold-500) 1px, transparent 1px), linear-gradient(90deg, var(--gold-500) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="glass-card p-8" style={{ borderTop: '3px solid var(--gold-500)' }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <NgulaLogo className="w-14 h-14 mb-4" />
            <h1 className="text-2xl font-bold text-[var(--white)]">Ngula Analytics</h1>
            <p className="text-sm text-[var(--slate-400)] mt-1">Mining Intelligence Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">
                Email Address
              </label>

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@ngula.demo"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">
                Password
              </label>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)] hover:text-[var(--white)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/30">
                <AlertCircle size={16} className="text-[var(--red)] shrink-0" />
                <p className="text-sm text-[var(--red)]">{error}</p>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--navy-900)]/30 border-t-[var(--navy-900)] rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo users */}
          <div className="mt-6 pt-6 border-t border-[var(--slate-600)]/40">
            <p className="text-xs font-semibold text-[var(--slate-500)] uppercase tracking-wider mb-3 text-center">
              Demo Accounts (password: <span className="font-mono text-[var(--gold-400)]">{DEMO_PASSWORD}</span>)

            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(DEMO_PASSWORD); }}

                  className="text-left px-3 py-2 rounded-lg text-xs bg-[var(--navy-700)] hover:bg-[var(--navy-600)] border border-[var(--slate-600)]/40 hover:border-[var(--gold-500)]/40 transition-all"
                >
                  <span className="font-semibold text-[var(--gold-400)]">{u.label}</span>
                  <span className="block text-[var(--slate-400)] truncate">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--slate-600)] mt-4">
          © 2025 Ngula Mining Analytics · All rights reserved
        </p>
      </div>
    </div>
  );
}
