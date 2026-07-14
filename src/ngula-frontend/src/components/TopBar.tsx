import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, AlertTriangle, Search, Menu } from 'lucide-react';
import { alertsApi } from '@/api/client';
import type { Alert } from '@/types';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    alertsApi.getAll().then((res) => setAlerts(res.data)).catch(() => {});
  }, []);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const markRead = async (id: number) => {
    await alertsApi.markRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 flex h-[var(--topbar-height)] items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)]/85 px-4 backdrop-blur-md sm:px-6">
      {/* Left: mobile menu + search */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-strong)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search reports, equipment, actions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!bg-[var(--bg-subtle)] !border-transparent pl-9 text-sm"
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts((v) => !v)}
            className="relative rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-strong)]"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showAlerts && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
              <div className="glass-card absolute right-0 top-full z-50 mt-2 max-h-[420px] w-[min(90vw,360px)] overflow-y-auto !shadow-pop">
                <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
                  <h3 className="text-sm font-semibold text-[var(--text-strong)]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[var(--brand-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-strong)]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Bell size={22} className="text-[var(--text-faint)]" />
                    <p className="text-sm text-[var(--text-muted)]">You're all caught up</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => markRead(alert.id)}
                      className={`flex w-full items-start gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--bg-subtle)] ${
                        alert.isRead ? 'opacity-60' : ''
                      }`}
                    >
                      {alert.severity === 'Critical' ? (
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--danger)]" />
                      ) : (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-strong)]">{alert.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">{alert.message}</p>
                        <p className="mt-1 text-[10px] text-[var(--text-faint)]">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 border-l border-[var(--border)] pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-[#2a2107]">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight text-[var(--text-strong)]">{user?.fullName}</p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
