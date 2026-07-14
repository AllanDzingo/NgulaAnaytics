import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Factory,
  Wrench,
  ShieldAlert,
  ClipboardList,
  ArrowRightLeft,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Pickaxe,
  LogOut,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NgulaLogo } from './NgulaLogo';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  role: string;
  badge?: number;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, hasRole, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Executive', path: '/', icon: <LayoutDashboard size={19} />, role: 'Executive' },
    { label: 'Production', path: '/production', icon: <Factory size={19} />, role: 'Production' },
    { label: 'Engineering', path: '/engineering', icon: <Wrench size={19} />, role: 'Engineering' },
    { label: 'Maintenance', path: '/maintenance', icon: <Pickaxe size={19} />, role: 'Engineering' },
    { label: 'SHEQ', path: '/sheq', icon: <ShieldAlert size={19} />, role: 'SHEQ' },
    { label: 'Shift Reports', path: '/shifts/new', icon: <ClipboardList size={19} />, role: 'Supervisor' },
    { label: 'Handover', path: '/handover', icon: <ArrowRightLeft size={19} />, role: 'Supervisor' },
    { label: 'Actions', path: '/actions', icon: <CheckSquare size={19} />, role: 'All' },
  ];

  const visibleItems = navItems.filter((item) => hasRole(item.role));

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'U';

  const navBody = (
    <>
      {/* Brand */}
      <div className="flex h-[var(--topbar-height)] items-center gap-2.5 border-b border-[var(--border)] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] ring-1 ring-[var(--border)]">
          <NgulaLogo className="h-6 w-6" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="whitespace-nowrap text-sm font-semibold text-[var(--text-strong)]">Ngula Analytics</h1>
            <p className="whitespace-nowrap text-[11px] text-[var(--text-muted)]">Mining Intelligence</p>
          </div>
        )}
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="ml-auto rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] lg:hidden"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
            Workspaces
          </p>
        )}
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--brand-tint)] text-[var(--brand-strong)] ring-1 ring-[var(--brand)]/25'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-strong)]'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge ? (
              <span className="ml-auto rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {/* User & footer */}
      <div className="space-y-2 border-t border-[var(--border)] p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-subtle)] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-[#2a2107]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--text-strong)]">{user.fullName}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{user.role}</p>
            </div>
          </div>
        )}

        <div className={`flex ${collapsed ? 'flex-col' : ''} gap-2`}>
          <button
            onClick={logout}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft,#fee2e2)] hover:text-[var(--danger)] ${
              collapsed ? 'justify-center' : 'flex-1'
            }`}
            title="Sign out"
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden items-center justify-center rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-strong)] lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] transition-[width] duration-300 lg:flex ${
          collapsed ? 'w-[76px]' : 'w-[var(--sidebar-width)]'
        }`}
      >
        {navBody}
      </aside>

      {/* Mobile drawer + overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[264px] flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] shadow-pop transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navBody}
      </aside>
    </>
  );
}
