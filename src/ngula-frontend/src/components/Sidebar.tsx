import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NgulaLogo } from './NgulaLogo';
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
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  role: string;
  badge?: number;
}

export function Sidebar() {
  const { user, hasRole, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Executive', path: '/', icon: <LayoutDashboard size={20} />, role: 'Executive' },
    { label: 'Production', path: '/production', icon: <Factory size={20} />, role: 'Production' },
    { label: 'Engineering', path: '/engineering', icon: <Wrench size={20} />, role: 'Engineering' },
    { label: 'Maintenance', path: '/maintenance', icon: <Pickaxe size={20} />, role: 'Engineering' },
    { label: 'SHEQ', path: '/sheq', icon: <ShieldAlert size={20} />, role: 'SHEQ' },
    { label: 'Shift Reports', path: '/shifts/new', icon: <ClipboardList size={20} />, role: 'Supervisor' },
    { label: 'Handover', path: '/handover', icon: <ArrowRightLeft size={20} />, role: 'Supervisor' },
    { label: 'Actions', path: '/actions', icon: <CheckSquare size={20} />, role: 'All' },
  ];

  const visibleItems = navItems.filter(item => hasRole(item.role));

  return (
    <aside
      className={`flex flex-col bg-[var(--navy-800)] border-r border-[var(--slate-600)]/40 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[var(--sidebar-width)]'
        }`}
    >
      {/* Logo */}
      <div className="h-[var(--topbar-height)] flex items-center px-4 border-b border-[var(--slate-600)]/40">
        <NgulaLogo className={collapsed ? 'w-8 h-8' : 'w-8 h-8'} />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <h1 className="text-sm font-bold text-[var(--white)] whitespace-nowrap">Ngula Analytics</h1>
            <p className="text-[10px] text-[var(--slate-400)] whitespace-nowrap">Mining Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[var(--gold-500)]/10 text-[var(--gold-400)] border-l-2 border-[var(--gold-500)]'
                : 'text-[var(--slate-400)] hover:bg-[var(--navy-700)] hover:text-[var(--white)]'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className={location.pathname === item.path ? 'text-[var(--gold-400)]' : ''}>
              {item.icon}
            </span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-[var(--red)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 border-t border-[var(--slate-600)]/40 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-[var(--navy-700)]/50">
            <p className="text-xs font-semibold text-[var(--white)] truncate">{user.fullName}</p>
            <p className="text-[10px] text-[var(--slate-400)] uppercase tracking-wider">{user.role}</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--slate-500)] hover:bg-[var(--navy-700)] hover:text-[var(--white)] transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        {!collapsed && (
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-xs text-[var(--slate-500)] hover:text-[var(--red)] transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}