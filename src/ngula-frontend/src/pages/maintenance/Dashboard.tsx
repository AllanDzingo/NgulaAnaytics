import { useEffect, useState } from 'react';
import { equipmentApi, maintenanceApi } from '@/api/client';
import type { MaintenanceKpi } from '@/types';

import { KpiCard } from '@/components/KpiCard';
import { ChartCard } from '@/components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wrench, AlertTriangle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

interface Equipment {
  id: number; name: string; manufacturer: string; model: string;
  status: string; currentOperatingHours: number; serviceIntervalHours: number;
  commissionDate: string;
  maintenanceRecords: { id: number; performedAt: string; hoursAtService: number }[];
}

const hoursUntilService = (e: Equipment) => {
  const lastService = e.maintenanceRecords?.sort((a, b) =>
    new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
  const hoursSince = lastService ? e.currentOperatingHours - lastService.hoursAtService : e.currentOperatingHours;
  return e.serviceIntervalHours - hoursSince;
};

export function MaintenanceDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [kpiData, setKpiData] = useState<MaintenanceKpi | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [eqRes, kpiRes] = await Promise.all([
        equipmentApi.getAll(),
        maintenanceApi.getKpis(),
      ]);
      setEquipment(eqRes.data);
      setKpiData(kpiRes.data);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const overdue = equipment.filter(e => hoursUntilService(e) < 0);
  const upcoming = equipment.filter(e => { const h = hoursUntilService(e); return h >= 0 && h <= 50; });
  const ok = equipment.filter(e => hoursUntilService(e) > 50);

  const barData = equipment
    .map(e => ({ name: e.name.split(' ')[0], hours: Math.max(0, hoursUntilService(e)), overdue: hoursUntilService(e) < 0 }))
    .sort((a, b) => a.hours - b.hours)
    .slice(0, 8);

  // Prefer authoritative KPI values from the backend; fall back to
  // locally-computed values when the KPI endpoint has not (yet) responded.
  const totalEquipment = kpiData?.totalEquipment ?? equipment.length;
  const overdueCount = kpiData?.overdueServices ?? overdue.length;
  const upcomingCount = kpiData?.upcomingServices ?? upcoming.length;
  const onScheduleCount = kpiData?.onSchedule ?? ok.length;

  const kpis = [
    { label: 'Total Equipment', value: totalEquipment, trendDirection: 'neutral' as const, status: 'good' as const },
    { label: 'Overdue Services', value: overdueCount, trendDirection: 'neutral' as const, status: overdueCount === 0 ? 'good' : 'critical' as const },
    { label: 'Due Soon (≤50hrs)', value: upcomingCount, trendDirection: 'neutral' as const, status: upcomingCount <= 2 ? 'good' : 'warning' as const },
    { label: 'On Schedule', value: onScheduleCount, trendDirection: 'neutral' as const, status: 'good' as const },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--white)]">Maintenance Dashboard</h2>
          <p className="text-sm text-[var(--slate-400)] mt-0.5">Service schedules, overdue equipment and upcoming maintenance</p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-secondary">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse gold-accent" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map(k => <KpiCard key={k.label} kpi={k} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Hours Until Next Service (Top 8)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                  <Bar dataKey="hours" radius={[0, 4, 4, 0]} name="Hours Remaining">
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.overdue ? '#e74c3c' : entry.hours <= 50 ? '#f39c12' : '#2ecc71'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Status cards */}
            <div className="space-y-3">
              {/* Overdue */}
              {overdue.length > 0 && (
                <div className="glass-card p-4" style={{ borderLeft: '3px solid var(--red)' }}>
                  <h4 className="text-sm font-semibold text-[var(--red)] flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} /> Overdue Services ({overdue.length})
                  </h4>
                  <div className="space-y-2">
                    {overdue.map(e => (
                      <div key={e.id} className="flex justify-between items-center p-2 rounded bg-[var(--red)]/5">
                        <span className="text-sm text-[var(--white)]">{e.name}</span>
                        <span className="text-xs font-mono text-[var(--red)]">{Math.abs(hoursUntilService(e)).toFixed(0)} hrs overdue</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {upcoming.length > 0 && (
                <div className="glass-card p-4" style={{ borderLeft: '3px solid var(--amber)' }}>
                  <h4 className="text-sm font-semibold text-[var(--amber)] flex items-center gap-2 mb-3">
                    <Clock size={16} /> Due Soon ({upcoming.length})
                  </h4>
                  <div className="space-y-2">
                    {upcoming.map(e => (
                      <div key={e.id} className="flex justify-between items-center p-2 rounded bg-[var(--amber)]/5">
                        <span className="text-sm text-[var(--white)]">{e.name}</span>
                        <span className="text-xs font-mono text-[var(--amber)]">{hoursUntilService(e).toFixed(0)} hrs left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {overdue.length === 0 && upcoming.length === 0 && (
                <div className="glass-card p-6 text-center" style={{ borderLeft: '3px solid var(--emerald)' }}>
                  <CheckCircle2 size={32} className="text-[var(--emerald)] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[var(--emerald)]">All equipment services are on schedule!</p>
                  <p className="text-xs text-[var(--slate-400)] mt-1">Next service is more than 50 hours away</p>
                </div>
              )}
            </div>
          </div>

          {/* Full schedule table */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--slate-600)]/40">
              <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2">
                <Wrench size={16} className="text-[var(--gold-400)]" /> Full Service Schedule
              </h3>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Equipment</th><th>Manufacturer</th><th>Operating Hrs</th><th>Interval</th><th>Next Service</th><th>Status</th></tr>
              </thead>
              <tbody>
                {equipment.map(e => {
                  const hrs = hoursUntilService(e);
                  return (
                    <tr key={e.id}>
                      <td className="font-medium text-[var(--white)]">{e.name}</td>
                      <td className="text-[var(--slate-400)]">{e.manufacturer}</td>
                      <td className="font-mono">{e.currentOperatingHours.toLocaleString()}</td>
                      <td className="font-mono text-[var(--slate-400)]">{e.serviceIntervalHours.toLocaleString()}</td>
                      <td className="font-mono" style={{ color: hrs < 0 ? 'var(--red)' : hrs <= 50 ? 'var(--amber)' : 'var(--emerald)' }}>
                        {hrs < 0 ? `${Math.abs(hrs).toFixed(0)} hrs overdue` : `${hrs.toFixed(0)} hrs`}
                      </td>
                      <td>
                        <span className={`status-badge ${hrs < 0 ? 'status-down' : hrs <= 50 ? 'status-warning' : 'status-operational'}`}>
                          {hrs < 0 ? 'Overdue' : hrs <= 50 ? 'Due Soon' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
