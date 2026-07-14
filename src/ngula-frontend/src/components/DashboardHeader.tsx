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
    <div className="bg-[var(--navy-800)]/60 border-b border-[var(--slate-600)]/40 px-6 pt-4">
      {/* Title row with logo icon */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--navy-900)] border border-[var(--gold-500)]/40 flex items-center justify-center shrink-0">
          <NgulaLogo className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[var(--white)] leading-tight">Dashboard</h1>
          <p className="text-[11px] text-[var(--slate-400)] leading-tight">
            {role === 'Executive'
              ? 'Cross-department operations intelligence'
              : `${role} workspace`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto">
        {visibleTabs.map((tab) => {
          const active = isTabActive(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-[var(--gold-500)] text-[var(--gold-400)]'
                  : 'border-transparent text-[var(--slate-400)] hover:text-[var(--white)]'
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
