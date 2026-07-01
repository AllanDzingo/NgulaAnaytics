import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, AlertTriangle, Search, User } from 'lucide-react';
import { alertsApi } from '@/api/client';
import { useEffect } from 'react';
import type { Alert } from '@/types';

export function TopBar() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    alertsApi.getAll().then(res => setAlerts(res.data));
  }, []);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const markRead = async (id: number) => {
    await alertsApi.markRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  return (
    <header className="h-[var(--topbar-height)] bg-[var(--navy-800)]/80 backdrop-blur-md border-b border-[var(--slate-600)]/40 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" size={16} />
        <input
          type="text"
          placeholder="Search reports, equipment, actions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 bg-[var(--navy-700)] border border-[var(--slate-600)]/50 rounded-lg text-sm text-[var(--white)] placeholder-[var(--slate-500)] focus:border-[var(--gold-500)] focus:ring-1 focus:ring-[var(--gold-500)]/20 w-full"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-lg hover:bg-[var(--navy-700)] transition-colors"
          >
            <Bell size={20} className={unreadCount > 0 ? 'text-[var(--gold-400)]' : 'text-[var(--slate-400)]'} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--red)] text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-full mt-2 w-96 glass-card z-50 max-h-[400px] overflow-y-auto">
              <div className="p-3 border-b border-[var(--slate-600)]/40">
                <h3 className="text-sm font-semibold text-[var(--white)]">Notifications</h3>
              </div>
              {alerts.length === 0 ? (
                <p className="p-4 text-sm text-[var(--slate-400)] text-center">No notifications</p>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => markRead(alert.id)}
                    className={`p-3 border-b border-[var(--slate-600)]/20 cursor-pointer hover:bg-[var(--navy-700)]/50 transition-colors ${alert.isRead ? 'opacity-60' : ''
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {alert.severity === 'Critical' && <AlertTriangle size={16} className="text-[var(--red)] mt-0.5 shrink-0" />}
                      <div>
                        <p className="text-sm font-medium text-[var(--white)]">{alert.title}</p>
                        <p className="text-xs text-[var(--slate-400)] mt-0.5">{alert.message}</p>
                        <p className="text-[10px] text-[var(--slate-600)] mt-1">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--slate-600)]/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold-500)] to-[var(--gold-600)] flex items-center justify-center">
            <User size={16} className="text-[var(--navy-900)]" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[var(--white)]">{user?.fullName}</p>
            <p className="text-[10px] text-[var(--gold-400)] uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}