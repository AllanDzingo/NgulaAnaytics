import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NgulaLogo } from './NgulaLogo';
import {
  LayoutDashboard,
  Factory,
  Wrench,
  Pickaxe,
  ShieldAlert,
  ClipboardList,
  ArrowRightLeft,
  CheckSquare,
} from 'lucide-react';

interface DashboardTab {
  label: string;
  path: string;
  icon: React.ReactNode;
  /** Roles that see this tab. Executive always sees every tab. */
  roles: string[];
}

// The full set of dashboard tabs. Each tab is scoped to the roles that should
// see it. Executives see ALL tabs (links to every department's data); every
// other role only sees the tabs relevant to their department, plus the shared
// Actions tab.
const TABS: DashboardTab[] = [
  { label: 'Overview', path: '/', icon: <LayoutDashboard size={16} />, roles: ['Executive'] },
  { label: 'Production', path: '/production', icon: <Factory size={16} />, roles: ['Executive', 'Production'] },
  { label: 'Engineering', path: '/engineering', icon: <Wrench size={16} />, roles: ['Executive', 'Engineering'] },
  { label: 'Maintenance', path: '/maintenance', icon: <Pickaxe size={16} />, roles: ['Executive', 'Engineering'] },
  { label: 'SHEQ', path: '/sheq', icon: <ShieldAlert size={16} />, roles: ['Executive', 'SHEQ'] },
  { label: 'Shift Reports', path: '/shifts/new', icon: <ClipboardList size={16} />, roles: ['Executive', 'Supervisor'] },
  { label: 'Handover', path: '/handover', icon: <ArrowRightLeft size={16} />, roles: ['Executive', 'Supervisor'] },
  { label: 'Actions', path: '/actions', icon: <CheckSquare size={16} />, roles: ['Executive', 'Production', 'Engineering', 'SHEQ', 'Supervisor'] },
];

export function DashboardHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role ?? '';

  // Executive sees every tab; other roles only see tabs that list their role.
  const visibleTabs = TABS.filter(
    (t) => role === 'Executive' || t.roles.includes(role),
  );

  const isTabActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 pt-4 sm:px-6 lg:px-8">
      {/* Title row with logo icon */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] ring-1 ring-[var(--border)]">
          <NgulaLogo className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight text-[var(--text-strong)]">Dashboard</h1>
          <p className="text-[12px] leading-tight text-[var(--text-muted)]">
            {role === 'Executive'
              ? 'Cross-department operations intelligence'
              : `${role} workspace`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="-mb-px flex items-center gap-1 overflow-x-auto">
        {visibleTabs.map((tab) => {
          const active = isTabActive(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-[var(--brand)] text-[var(--text-strong)]'
                  : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
