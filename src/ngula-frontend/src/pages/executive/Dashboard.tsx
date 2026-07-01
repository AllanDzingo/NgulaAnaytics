import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/api/client';
import { KpiCard } from '@/components/KpiCard';
import { ChartCard } from '@/components/ChartCard';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, ShieldAlert, CheckSquare, AlertTriangle,
  Wrench, Bell, Activity, RefreshCw,
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

const COLORS = ['#d4a843', '#2ecc71', '#e74c3c', '#5a6e8f'];

const severityColor = (s: string) =>
  s === 'Critical' ? 'var(--red)' : s === 'Warning' ? 'var(--amber)' : 'var(--slate-400)';

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--white)]">Executive Dashboard</h2>
          <p className="text-sm text-[var(--slate-400)] mt-0.5">
            Mining operations overview · Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="glass-card p-5 gold-accent h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Production Trend (7 Days)" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DUMMY_TREND}>
                  <defs>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2ecc71" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }}
                    labelStyle={{ color: 'var(--white)' }}
                  />
                  <Area type="monotone" dataKey="crushed" stroke="#d4a843" strokeWidth={2} fill="url(#gc)" name="Tons Crushed" />
                  <Area type="monotone" dataKey="milled" stroke="#2ecc71" strokeWidth={2} fill="url(#gm)" name="Tons Milled" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Equipment Status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--slate-400)' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Bottom row — Alerts & Quick links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Alerts */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2">
                  <Bell size={16} className="text-[var(--gold-400)]" /> Recent Alerts
                </h3>
                <span className="text-xs text-[var(--slate-500)]">{summary?.recentAlerts.length ?? 0} unread</span>
              </div>
              <div className="space-y-2">
                {summary?.recentAlerts.length ? summary.recentAlerts.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--navy-700)]/50 hover:bg-[var(--navy-700)] transition-colors">
                    <AlertTriangle size={16} style={{ color: severityColor(a.severity), marginTop: 2 }} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--white)] truncate">{a.title}</p>
                      <p className="text-xs text-[var(--slate-400)] truncate">{a.message}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{
                      background: `${severityColor(a.severity)}20`,
                      color: severityColor(a.severity)
                    }}>{a.severity}</span>
                  </div>
                )) : (
                  <p className="text-sm text-[var(--slate-500)] text-center py-4">No recent alerts</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--white)] mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: '/production', label: 'Production KPIs', icon: <TrendingUp size={20} />, color: 'var(--gold-500)' },
                  { to: '/engineering', label: 'Engineering', icon: <Wrench size={20} />, color: 'var(--emerald)' },
                  { to: '/sheq', label: 'SHEQ Dashboard', icon: <ShieldAlert size={20} />, color: 'var(--amber)' },
                  { to: '/actions', label: 'Action Tracker', icon: <CheckSquare size={20} />, color: 'var(--gold-400)' },
                  { to: '/handover', label: 'Shift Handover', icon: <Activity size={20} />, color: 'var(--slate-300)' },
                  { to: '/shifts/new', label: 'New Report', icon: <Activity size={20} />, color: 'var(--slate-300)' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--navy-700)]/50 hover:bg-[var(--navy-700)] border border-transparent hover:border-[var(--slate-600)]/40 transition-all group"
                  >
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <span className="text-sm text-[var(--slate-300)] group-hover:text-[var(--white)] transition-colors">{item.label}</span>
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
