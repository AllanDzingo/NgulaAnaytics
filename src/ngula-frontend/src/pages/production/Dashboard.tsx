import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/api/client';
import { KpiCard } from '@/components/KpiCard';
import { ChartCard } from '@/components/ChartCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { Target, TrendingUp, RefreshCw } from 'lucide-react';

interface ProductionKpi {
  targetAchievement: number;
  recoveryRate: number;
  throughput: number;
  tonsCrushed: number;
  tonsMilled: number;
  concentrateProduced: number;
}

const SECTIONS = [
  { id: 1, name: 'Primary Crushing' },
  { id: 2, name: 'Secondary Crushing' },
  { id: 3, name: 'Milling' },
  { id: 4, name: 'Flotation' },
  { id: 5, name: 'Tailings' },
];

const SHIFT_DATA = [
  { shift: 'Day', tonsCrushed: 820, tonsMilled: 740, recovery: 86.2 },
  { shift: 'Afternoon', tonsCrushed: 780, tonsMilled: 710, recovery: 84.8 },
  { shift: 'Night', tonsCrushed: 750, tonsMilled: 680, recovery: 83.5 },
];

const WEEKLY_TREND = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
  day: d, recovery: 83 + Math.sin(i) * 2.5,
}));

export function ProductionDashboard() {
  const [kpis, setKpis] = useState<ProductionKpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionId, setSectionId] = useState<number | undefined>();

  const load = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getProductionKpis(sectionId);
      setKpis(res.data);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [sectionId]);

  const cards = kpis ? [
    { label: 'Target Achievement', value: `${kpis.targetAchievement.toFixed(1)}`, unit: '%', status: kpis.targetAchievement >= 95 ? 'good' : kpis.targetAchievement >= 80 ? 'warning' : 'critical' as const, trend: 2.1, trendDirection: 'up' as const },
    { label: 'Recovery Rate', value: `${kpis.recoveryRate.toFixed(1)}`, unit: '%', status: kpis.recoveryRate >= 85 ? 'good' : 'warning' as const, trend: -0.4, trendDirection: 'down' as const },
    { label: 'Throughput', value: kpis.throughput.toFixed(1), unit: 't/hr', status: 'good' as const, trend: 1.8, trendDirection: 'up' as const },
    { label: 'Tons Crushed', value: kpis.tonsCrushed.toLocaleString(), unit: 't', status: 'good' as const },
    { label: 'Tons Milled', value: kpis.tonsMilled.toLocaleString(), unit: 't', status: 'good' as const },
    { label: 'Concentrate Produced', value: kpis.concentrateProduced.toFixed(1), unit: 't', status: 'good' as const },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--white)]">Production Dashboard</h2>
          <p className="text-sm text-[var(--slate-400)] mt-0.5">Real-time production KPIs and section performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            id="section-filter"
            value={sectionId ?? ''}
            onChange={e => setSectionId(e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: 'auto' }}
          >
            <option value="">All Sections</option>
            {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={load} disabled={loading} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/production/targets" className="btn btn-primary">
            <Target size={16} /> Targets
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-24 animate-pulse gold-accent" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map(k => <KpiCard key={k.label} kpi={k} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Production by Shift">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SHIFT_DATA} barGap={4}>
                  <XAxis dataKey="shift" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                  <Bar dataKey="tonsCrushed" fill="#d4a843" radius={[4, 4, 0, 0]} name="Tons Crushed" />
                  <Bar dataKey="tonsMilled" fill="#2ecc71" radius={[4, 4, 0, 0]} name="Tons Milled" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Recovery Rate Trend (%)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3a52" />
                  <XAxis dataKey="day" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <YAxis domain={[80, 90]} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="recovery" stroke="#d4a843" strokeWidth={2} dot={{ fill: '#d4a843', r: 3 }} name="Recovery %" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Target achievement progress */}
          {kpis && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--white)] mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--gold-400)]" /> Monthly Target Progress
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Tons Milled vs Target', value: kpis.targetAchievement },
                  { label: 'Recovery Rate vs Target (85%)', value: (kpis.recoveryRate / 85) * 100 },
                  { label: 'Throughput vs Target', value: Math.min((kpis.throughput / 120) * 100, 100) },
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
                          background: item.value >= 95 ? 'var(--emerald)' : item.value >= 80 ? 'var(--gold-500)' : 'var(--red)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
