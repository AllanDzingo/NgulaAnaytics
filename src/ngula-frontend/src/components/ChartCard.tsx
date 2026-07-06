import type { ReactNode } from 'react';

interface Props { title: string; children: ReactNode; className?: string; }

export function ChartCard({ title, children, className = '' }: Props) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-[var(--white)] mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}