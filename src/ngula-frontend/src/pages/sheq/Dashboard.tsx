import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/api/client';
import { KpiCard } from '@/components/KpiCard';
import { ChartCard } from '@/components/ChartCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { ShieldAlert, Wind, Thermometer, Droplets, RefreshCw } from 'lucide-react';

interface SheqKpi {
  oxygenCompliance: number;
  dustCompliance: number;
  excavationRate: number;
  totalTruckloads: number;
  totalIncidents: number;
}

const INCIDENT_TREND = [
  { month: 'Jan', incidents: 2 }, { month: 'Feb', incidents: 1 }, { month: 'Mar', incidents: 0 },
  { month: 'Apr', incidents: 3 }, { month: 'May', incidents: 1 }, { month: 'Jun', incidents: 0 },
];

const COMPLIANCE_BARS = [
  { metric: 'O₂ Compliance', target: 100 },
  { metric: 'Dust Compliance', target: 100 },
  { metric: 'Heat Compliance', target: 100 },
];

export function SheqDashboard() {
  const [kpis, setKpis] = useState<SheqKpi | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getSheqKpis();
      setKpis(res.data);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cards = kpis ? [
    { label: 'Oxygen Compliance', value: `${kpis.oxygenCompliance.toFixed(1)}`, unit: '%', status: kpis.oxygenCompliance >= 95 ? 'good' : kpis.oxygenCompliance >= 80 ? 'warning' : 'critical' as const, trend: 2, trendDirection: 'up' as const },
    { label: 'Dust Compliance', value: `${kpis.dustCompliance.toFixed(1)}`, unit: '%', status: kpis.dustCompliance >= 95 ? 'good' : 'warning' as const },
    { label: 'Total Incidents (MTD)', value: kpis.totalIncidents, trendDirection: 'neutral' as const, status: kpis.totalIncidents === 0 ? 'good' : kpis.totalIncidents <= 2 ? 'warning' : 'critical' as const },
    { label: 'Excavation Rate', value: kpis.excavationRate.toFixed(1), unit: 'loads/shift', status: 'good' as const },
    { label: 'Total Truckloads', value: kpis.totalTruckloads.toFixed(0), unit: 'loads', status: 'good' as const },
  ] : [];

  const complianceBarsWithValues = kpis ? [
    { metric: 'O₂ Compliance', value: kpis.oxygenCompliance },
    { metric: 'Dust Compliance', value: kpis.dustCompliance },
    { metric: 'Noise Compliance', value: 92 },
  ] : COMPLIANCE_BARS.map(b => ({ ...b, value: 0 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--white)]">SHEQ Dashboard</h2>
          <p className="text-sm text-[var(--slate-400)] mt-0.5">Safety, Health, Environment & Quality metrics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/sheq/incidents" className="btn btn-primary">
            <ShieldAlert size={16} /> Incident Log
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

          {/* Environmental Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Oxygen Level (avg)', value: '20.2%', icon: <Wind size={20} />, status: 'good', threshold: '≥ 19.5%' },
              { label: 'Dust Level (avg)', value: '0.32 mg/m³', icon: <Droplets size={20} />, status: 'good', threshold: '≤ 0.5 mg/m³' },
              { label: 'Heat Index (avg)', value: '28°C', icon: <Thermometer size={20} />, status: 'warning', threshold: '≤ 32°C' },
            ].map(item => (
              <div key={item.label} className="glass-card p-5" style={{ borderLeft: `3px solid ${item.status === 'good' ? 'var(--emerald)' : 'var(--amber)'}` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider">{item.label}</span>
                  <span style={{ color: item.status === 'good' ? 'var(--emerald)' : 'var(--amber)' }}>{item.icon}</span>
                </div>
                <p className="text-2xl font-bold font-mono" style={{ color: item.status === 'good' ? 'var(--emerald)' : 'var(--amber)' }}>{item.value}</p>
                <p className="text-xs text-[var(--slate-500)] mt-1">Threshold: {item.threshold}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Incident Trend (6 Months)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={INCIDENT_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3a52" />
                  <XAxis dataKey="month" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="incidents" stroke="#e74c3c" strokeWidth={2} dot={{ fill: '#e74c3c', r: 4 }} name="Incidents" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Compliance Rates (%)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceBarsWithValues}>
                  <XAxis dataKey="metric" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#d4a843" radius={[4, 4, 0, 0]} name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
