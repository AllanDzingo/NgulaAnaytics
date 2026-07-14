import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/api/client';
import { KpiCard } from '@/components/KpiCard';
import { ChartCard } from '@/components/ChartCard';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, ShieldAlert, CheckSquare, AlertTriangle,
  Wrench, Bell, RefreshCw, ChevronRight, ArrowRightLeft, FilePlus2,
} from 'lucide-react';

interface ExecutiveSummary {
  totalTonsCrushed: number;
  totalTonsMilled: number;
  averageRecovery: number;
  totalIncidents: number;
  openActions: number;
  overdueActions: number;
  equipmentAvailability: number;
  recentAlerts: { id: number; type: string; severity: string; title: string; message: string; isRead: boolean; createdAt: string }[];
}

const DUMMY_TREND = [
  { day: 'Mon', crushed: 1800, milled: 1600 },
  { day: 'Tue', crushed: 2100, milled: 1900 },
  { day: 'Wed', crushed: 1950, milled: 1750 },
  { day: 'Thu', crushed: 2300, milled: 2100 },
  { day: 'Fri', crushed: 2000, milled: 1820 },
  { day: 'Sat', crushed: 1700, milled: 1500 },
  { day: 'Sun', crushed: 1900, milled: 1700 },
];

const COLORS = ['#d4a843', '#16a34a', '#dc2626', '#9aa2ae'];

const AXIS_TICK = { fill: '#9aa2ae', fontSize: 11 };
const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid #e6e8ec',
  borderRadius: 12,
  boxShadow: '0 8px 28px rgba(16,24,40,0.12)',
  fontSize: 12,
  color: '#111318',
};

const severityColor = (s: string) =>
  s === 'Critical' ? 'var(--danger)' : s === 'Warning' ? 'var(--warning)' : 'var(--text-muted)';

export function ExecutiveDashboard() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getExecutiveSummary();
      setSummary(res.data);
      setLastUpdated(new Date());
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const kpis = summary ? [
    { label: 'Tons Crushed', value: summary.totalTonsCrushed.toLocaleString(), unit: 't', trend: 4.2, trendDirection: 'up' as const, status: 'good' as const },
    { label: 'Tons Milled', value: summary.totalTonsMilled.toLocaleString(), unit: 't', trend: 2.1, trendDirection: 'up' as const, status: 'good' as const },
    { label: 'Avg Recovery', value: `${summary.averageRecovery.toFixed(1)}`, unit: '%', trend: -0.5, trendDirection: 'down' as const, status: summary.averageRecovery >= 85 ? 'good' : summary.averageRecovery >= 80 ? 'warning' : 'critical' },
    { label: 'Equip. Availability', value: `${summary.equipmentAvailability.toFixed(1)}`, unit: '%', trend: 1.8, trendDirection: 'up' as const, status: summary.equipmentAvailability >= 85 ? 'good' : 'warning' },
    { label: 'Total Incidents', value: summary.totalIncidents, trendDirection: 'neutral' as const, status: summary.totalIncidents === 0 ? 'good' : summary.totalIncidents <= 2 ? 'warning' : 'critical' },
    { label: 'Open Actions', value: summary.openActions, trendDirection: 'neutral' as const, status: summary.openActions <= 5 ? 'good' : 'warning' },
    { label: 'Overdue Actions', value: summary.overdueActions, trendDirection: 'neutral' as const, status: summary.overdueActions === 0 ? 'good' : 'critical' },
  ] : [];

  const pieData = summary ? [
    { name: 'Operational', value: Math.round(summary.equipmentAvailability) },
    { name: 'Maintenance', value: Math.round(100 - summary.equipmentAvailability) },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-strong)]">Executive Dashboard</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Mining operations overview · Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-secondary">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !summary ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-[104px]" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => <KpiCard key={k.label} kpi={k} />)}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard
              title="Production Trend"
              subtitle="Tons crushed vs. milled — last 7 days"
              className="lg:col-span-2"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DUMMY_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a843" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceef1" vertical={false} />
                  <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#e6e8ec' }} />
                  <Area type="monotone" dataKey="crushed" stroke="#d4a843" strokeWidth={2.5} fill="url(#gc)" name="Tons Crushed" />
                  <Area type="monotone" dataKey="milled" stroke="#16a34a" strokeWidth={2.5} fill="url(#gm)" name="Tons Milled" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Equipment Status" subtitle="Availability split">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Bottom row — Alerts & Quick links */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Recent Alerts */}
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-strong)]">
                  <Bell size={16} className="text-[var(--brand-strong)]" /> Recent Alerts
                </h3>
                <span className="text-xs text-[var(--text-muted)]">{summary?.recentAlerts.length ?? 0} unread</span>
              </div>
              <div className="space-y-2">
                {summary?.recentAlerts.length ? summary.recentAlerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3 transition-colors hover:bg-[var(--bg-muted)]">
                    <AlertTriangle size={16} style={{ color: severityColor(a.severity), marginTop: 2 }} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-strong)]">{a.title}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{a.message}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{
                      background: `${severityColor(a.severity)}18`,
                      color: severityColor(a.severity),
                    }}>{a.severity}</span>
                  </div>
                )) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Bell size={22} className="text-[var(--text-faint)]" />
                    <p className="text-sm text-[var(--text-muted)]">No recent alerts</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-[var(--text-strong)]">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: '/production', label: 'Production KPIs', icon: <TrendingUp size={18} />, color: 'var(--brand-strong)' },
                  { to: '/engineering', label: 'Engineering', icon: <Wrench size={18} />, color: 'var(--success)' },
                  { to: '/sheq', label: 'SHEQ Dashboard', icon: <ShieldAlert size={18} />, color: 'var(--warning)' },
                  { to: '/actions', label: 'Action Tracker', icon: <CheckSquare size={18} />, color: 'var(--brand-strong)' },
                  { to: '/handover', label: 'Shift Handover', icon: <ArrowRightLeft size={18} />, color: 'var(--text-muted)' },
                  { to: '/shifts/new', label: 'New Report', icon: <FilePlus2 size={18} />, color: 'var(--text-muted)' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-muted)]"
                  >
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <span className="flex-1 text-sm font-medium text-[var(--text)] transition-colors group-hover:text-[var(--text-strong)]">{item.label}</span>
                    <ChevronRight size={15} className="text-[var(--text-faint)] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
