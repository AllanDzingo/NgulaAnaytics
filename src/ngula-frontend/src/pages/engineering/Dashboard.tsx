import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/api/client';
import { KpiCard } from '@/components/KpiCard';
import { ChartCard } from '@/components/ChartCard';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Wrench, Activity, RefreshCw } from 'lucide-react';

interface EngineeringKpi {
  mtbf: number;
  mttr: number;
  availability: number;
  reliability: number;
  serviceCompliance: number;
}

const RADAR_DATA = (kpi: EngineeringKpi) => [
  { metric: 'Availability', value: Math.min(kpi.availability, 100) },
  { metric: 'Reliability', value: Math.min(kpi.reliability, 100) },
  { metric: 'MTBF Score', value: Math.min((kpi.mtbf / 500) * 100, 100) },
  { metric: 'Compliance', value: kpi.serviceCompliance },
  { metric: 'MTTR Score', value: Math.max(0, 100 - kpi.mttr * 2) },
];

const EQUIP_DOWNTIME = [
  { name: 'Crusher 1', hours: 12 },
  { name: 'Ball Mill 1', hours: 8 },
  { name: 'Pump A', hours: 5 },
  { name: 'Conveyor 2', hours: 3 },
  { name: 'Crusher 2', hours: 2 },
];

export function EngineeringDashboard() {
  const [kpis, setKpis] = useState<EngineeringKpi | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getEngineeringKpis();
      setKpis(res.data);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cards = kpis ? [
    { label: 'Availability', value: `${kpis.availability.toFixed(1)}`, unit: '%', status: kpis.availability >= 85 ? 'good' : 'warning' as const, trend: 1.2, trendDirection: 'up' as const },
    { label: 'Reliability', value: `${kpis.reliability.toFixed(1)}`, unit: '%', status: kpis.reliability >= 80 ? 'good' : 'warning' as const },
    { label: 'MTBF', value: kpis.mtbf.toFixed(0), unit: 'hrs', status: 'good' as const, trend: 5, trendDirection: 'up' as const },
    { label: 'MTTR', value: kpis.mttr.toFixed(1), unit: 'hrs', status: kpis.mttr <= 4 ? 'good' : 'warning' as const },
    { label: 'Service Compliance', value: `${kpis.serviceCompliance.toFixed(1)}`, unit: '%', status: kpis.serviceCompliance >= 90 ? 'good' : 'warning' as const },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--white)]">Engineering Dashboard</h2>
          <p className="text-sm text-[var(--slate-400)] mt-0.5">Equipment reliability, availability and maintenance KPIs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/engineering/equipment" className="btn btn-primary">
            <Wrench size={16} /> Equipment List
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse gold-accent" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map(k => <KpiCard key={k.label} kpi={k} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Performance Radar">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={kpis ? RADAR_DATA(kpis) : []}>
                  <PolarGrid stroke="#2a3a52" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#8899b4', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#d4a843" fill="#d4a843" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Equipment Downtime (hrs this month)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={EQUIP_DOWNTIME} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                  <Bar dataKey="hours" fill="#e74c3c" radius={[0, 4, 4, 0]} name="Downtime hrs" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Reliability Overview */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--white)] mb-4 flex items-center gap-2">
              <Activity size={16} className="text-[var(--gold-400)]" /> KPI Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kpis && [
                { label: 'Availability Target (≥85%)', value: kpis.availability, target: 85 },
                { label: 'Reliability Target (≥80%)', value: kpis.reliability, target: 80 },
                { label: 'Service Compliance Target (≥90%)', value: kpis.serviceCompliance, target: 90 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--slate-400)]">{item.label}</span>
                    <span className="font-mono text-[var(--gold-400)]">{item.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--navy-700)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(item.value, 100)}%`,
                        background: item.value >= item.target ? 'var(--emerald)' : item.value >= item.target * 0.9 ? 'var(--gold-500)' : 'var(--red)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
