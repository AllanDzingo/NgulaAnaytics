import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { equipmentApi } from '@/api/client';
import { ChevronLeft, Activity, Clock, Wrench, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface EquipmentDetail {
  equipment: {
    id: number; name: string; manufacturer: string; model: string;
    status: string; currentOperatingHours: number; serviceIntervalHours: number;
    commissionDate: string;
    observations: { id: number; noiseLevel: number; generalCondition: string }[];
    downtimeEntries: { id: number; startTime: string; durationHours: number; reason: string }[];
    maintenanceRecords: { id: number; performedAt: string; hoursAtService: number; description: string }[];
  };
  healthScore: number;
  recentObservations: { id: number; noiseLevel: number; generalCondition: string }[];
  recentDowntime: { id: number; startTime: string; durationHours: number; reason: string }[];
}

const conditionColor = (c: string) => {
  if (c === 'Excellent' || c === 'Good') return 'var(--emerald)';
  if (c === 'Fair') return 'var(--amber)';
  if (c === 'Poor') return 'var(--red)';
  return 'var(--red)';
};

const healthColor = (score: number) =>
  score >= 70 ? 'var(--emerald)' : score >= 40 ? 'var(--amber)' : 'var(--red)';

export function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    equipmentApi.getById(Number(id))
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)}
    </div>
  );

  if (!data) return (
    <div className="glass-card p-8 text-center text-[var(--slate-400)]">Equipment not found.</div>
  );

  const { equipment, healthScore, recentObservations, recentDowntime } = data;
  const noiseTrend = recentObservations.map((o, i) => ({ index: i + 1, noise: o.noiseLevel }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/engineering/equipment" className="flex items-center gap-1 text-[var(--slate-400)] hover:text-[var(--gold-400)] transition-colors">
          <ChevronLeft size={16} /> Equipment List
        </Link>
        <span className="text-[var(--slate-600)]">/</span>
        <span className="text-[var(--white)]">{equipment.name}</span>
      </div>

      {/* Header */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--gold-500)]/10 flex items-center justify-center">
            <Wrench size={24} className="text-[var(--gold-400)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--white)]">{equipment.name}</h2>
            <p className="text-sm text-[var(--slate-400)]">{equipment.manufacturer} · {equipment.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {/* Health Score */}
          <div className="text-center">
            <div
              className="text-3xl font-bold font-mono"
              style={{ color: healthColor(healthScore) }}
            >
              {healthScore.toFixed(0)}
            </div>
            <p className="text-xs text-[var(--slate-400)] mt-0.5">Health Score</p>
          </div>
          <div>
            <span className={`status-badge status-${equipment.status.toLowerCase().replace(' ', '')}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {equipment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Operating Hours', value: `${equipment.currentOperatingHours.toLocaleString()} hrs`, icon: <Clock size={18} /> },
          { label: 'Service Interval', value: `${equipment.serviceIntervalHours.toLocaleString()} hrs`, icon: <Wrench size={18} /> },
          { label: 'Commission Date', value: new Date(equipment.commissionDate).toLocaleDateString(), icon: <Activity size={18} /> },
          {
            label: 'Hours to Next Service',
            value: `${Math.max(0, equipment.serviceIntervalHours - equipment.currentOperatingHours).toLocaleString()} hrs`,
            icon: <AlertTriangle size={18} />
          },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--gold-500)]/10 flex items-center justify-center text-[var(--gold-400)]">
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-[var(--slate-400)]">{s.label}</p>
              <p className="text-sm font-semibold text-[var(--white)] font-mono">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Noise Trend */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] mb-4">Noise Level Trend (dB)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={noiseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a52" />
                <XAxis dataKey="index" tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} label={{ value: 'Observations', position: 'insideBottom', fill: '#5a6e8f', fontSize: 10 }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#8899b4', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--navy-800)', border: '1px solid var(--slate-600)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="noise" stroke="#d4a843" strokeWidth={2} dot={{ fill: '#d4a843', r: 3 }} name="Noise dB" />
                {/* Safety threshold */}
                <Line type="monotone" dataKey={() => 85} stroke="#e74c3c" strokeDasharray="4 2" strokeWidth={1} dot={false} name="Threshold (85dB)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Observations */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] mb-4">Recent Observations</h3>
          {recentObservations.length === 0 ? (
            <p className="text-sm text-[var(--slate-500)] text-center py-6">No observations recorded</p>
          ) : (
            <div className="space-y-2">
              {recentObservations.map((obs, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--navy-700)]/50">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: conditionColor(obs.generalCondition) }} />
                    <span className="text-sm text-[var(--white)]">{obs.generalCondition}</span>
                  </div>
                  <span className="text-sm font-mono text-[var(--slate-400)]">{obs.noiseLevel} dB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Downtime */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--white)] mb-4">Recent Downtime Events</h3>
        {recentDowntime.length === 0 ? (
          <p className="text-sm text-[var(--slate-500)] text-center py-4">No downtime recorded recently</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Duration</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {recentDowntime.map(d => (
                <tr key={d.id}>
                  <td>{new Date(d.startTime).toLocaleDateString()}</td>
                  <td className="font-mono text-[var(--amber)]">{Number(d.durationHours).toFixed(1)} hrs</td>
                  <td className="text-[var(--slate-300)]">{d.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
