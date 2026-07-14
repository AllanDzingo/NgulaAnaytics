import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardKpi } from '@/types';

interface Props {
  kpi: DashboardKpi;
}

const STATUS_META: Record<string, { bar: string; value: string }> = {
  good: { bar: 'var(--success)', value: 'var(--text-strong)' },
  warning: { bar: 'var(--warning)', value: 'var(--text-strong)' },
  critical: { bar: 'var(--danger)', value: 'var(--text-strong)' },
  neutral: { bar: 'var(--brand)', value: 'var(--text-strong)' },
};

export function KpiCard({ kpi }: Props) {
  const meta = STATUS_META[kpi.status ?? 'neutral'] ?? STATUS_META.neutral;

  const trendColor =
    kpi.trendDirection === 'up'
      ? 'var(--success)'
      : kpi.trendDirection === 'down'
        ? 'var(--danger)'
        : 'var(--text-muted)';

  return (
    <div className="glass-card card-interactive relative overflow-hidden p-5">
      {/* Accent bar */}
      <span
        className="absolute inset-y-0 left-0 w-1 rounded-r"
        style={{ background: meta.bar }}
        aria-hidden="true"
      />
      <div className="mb-3 flex items-center justify-between pl-1">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          {kpi.label}
        </span>
        {kpi.trend !== undefined && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ color: trendColor, background: `${trendColor}14` }}
          >
            {kpi.trendDirection === 'up' ? (
              <TrendingUp size={13} />
            ) : kpi.trendDirection === 'down' ? (
              <TrendingDown size={13} />
            ) : (
              <Minus size={13} />
            )}
            {kpi.trend > 0 ? '+' : ''}
            {kpi.trend}%
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 pl-1">
        <span className="kpi-value text-2xl font-bold" style={{ color: meta.value }}>
          {kpi.value}
        </span>
        {kpi.unit && <span className="text-sm text-[var(--text-muted)]">{kpi.unit}</span>}
      </div>
    </div>
  );
}
