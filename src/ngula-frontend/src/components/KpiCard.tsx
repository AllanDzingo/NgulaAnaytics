import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardKpi } from '@/types';

interface Props { kpi: DashboardKpi; }

export function KpiCard({ kpi }: Props) {
  const statusColor = kpi.status === 'good' ? 'var(--emerald)' : kpi.status === 'warning' ? 'var(--amber)' : kpi.status === 'critical' ? 'var(--red)' : 'var(--gold-500)';
  
  return (
    <div className="glass-card p-5 gold-accent">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[var(--slate-400)] uppercase tracking-wider">{kpi.label}</span>
        {kpi.trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${kpi.trendDirection === 'up' ? 'text-[var(--emerald)]' : kpi.trendDirection === 'down' ? 'text-[var(--red)]' : 'text-[var(--slate-400)]'}`}>
            {kpi.trendDirection === 'up' ? <TrendingUp size={14} /> : kpi.trendDirection === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
            {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold kpi-value" style={{ color: statusColor }}>{kpi.value}</span>
        {kpi.unit && <span className="text-sm text-[var(--slate-400)]">{kpi.unit}</span>}
      </div>
    </div>
  );
}