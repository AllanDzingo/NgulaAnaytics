import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NgulaLogo } from '@/components/NgulaLogo';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // NOTE: These must match the credentials created by the backend DataSeeder.
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel (hidden on small screens) */}
      <div className="relative hidden overflow-hidden bg-[var(--ink-900,#111318)] lg:flex lg:flex-col lg:justify-between lg:p-12" style={{ background: '#111318' }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#d4a843 1px, transparent 1px), linear-gradient(90deg, #d4a843 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: '#d4a843' }} />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <NgulaLogo className="h-7 w-7" />
          </div>
          <span className="text-lg font-semibold text-white">Ngula Analytics</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Operational intelligence for mining excellence.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Real-time production, equipment and safety insights — unified into one
            clean, enterprise-grade platform.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-white/50">
            <ShieldCheck size={15} className="text-[#d4a843]" />
            Secure, role-based access for every department
          </div>
        </div>

        <p className="relative text-xs text-white/40">© 2025 Ngula Mining Analytics · All rights reserved</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-[var(--bg-app)] p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <NgulaLogo className="mb-3 h-12 w-12" />
            <h1 className="text-xl font-bold text-[var(--text-strong)]">Ngula Analytics</h1>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-strong)]">Welcome back</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Sign in to your workspace to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@ngula.demo"
                  required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] transition-colors hover:text-[var(--text-strong)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#fca5a5] bg-[#fee2e2] p-3">
                <AlertCircle size={16} className="shrink-0 text-[var(--danger)]" />
                <p className="text-sm text-[#991b1b]">{error}</p>
              </div>
            )}

            <button id="login-submit" type="submit" disabled={loading} className="btn btn-primary mt-1 w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo users */}
          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <p className="mb-3 text-center text-xs text-[var(--text-muted)]">
              Demo accounts · password{' '}
              <span className="font-mono font-semibold text-[var(--brand-strong)]">{DEMO_PASSWORD}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(DEMO_PASSWORD); }}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-left text-xs transition-all hover:border-[var(--brand)]/50 hover:bg-[var(--brand-tint)]"
                >
                  <span className="font-semibold text-[var(--text-strong)]">{u.label}</span>
                  <span className="block truncate text-[var(--text-muted)]">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
