import { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface Incident {
  id: number;
  type: string;
  severity: string;
  description: string;
  date: string;
  section: string;
  status: 'Open' | 'Investigating' | 'Closed';
  injuries: number;
}

// In a real app these would come from the API; using seeded data placeholders here
const MOCK_INCIDENTS: Incident[] = [
  { id: 1, type: 'Near Miss', severity: 'Warning', description: 'Worker slipped near the wet ore feed area', date: '2025-06-28', section: 'Primary Crushing', status: 'Closed', injuries: 0 },
  { id: 2, type: 'Environmental', severity: 'Warning', description: 'Minor tailings spill at dam perimeter', date: '2025-06-25', section: 'Tailings', status: 'Investigating', injuries: 0 },
  { id: 3, type: 'Safety', severity: 'Critical', description: 'Oxygen deficiency detected in underground level 3', date: '2025-06-20', section: 'Underground', status: 'Closed', injuries: 0 },
  { id: 4, type: 'Health', severity: 'Warning', description: 'High dust levels recorded during shift change', date: '2025-06-18', section: 'Milling', status: 'Open', injuries: 0 },
  { id: 5, type: 'Safety', severity: 'Warning', description: 'Near miss: falling object from conveyor walkway', date: '2025-06-15', section: 'Secondary Crushing', status: 'Investigating', injuries: 0 },
];

const severityColors: Record<string, string> = {
  Critical: 'var(--red)',
  Warning: 'var(--amber)',
  Info: 'var(--slate-400)',
};

const statusColors: Record<string, string> = {
  Open: 'var(--red)',
  Investigating: 'var(--amber)',
  Closed: 'var(--emerald)',
};

export function Incidents() {
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const filtered = incidents.filter(i => {
    const matchText = !filter || i.description.toLowerCase().includes(filter.toLowerCase()) || i.type.toLowerCase().includes(filter.toLowerCase());
    const matchSev = !severityFilter || i.severity === severityFilter;
    return matchText && matchSev;
  });

  const counts = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'Open').length,
    investigating: incidents.filter(i => i.status === 'Investigating').length,
    closed: incidents.filter(i => i.status === 'Closed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--white)]">Incident Log</h2>
        <p className="text-sm text-[var(--slate-400)] mt-0.5">Safety, health and environmental incident records</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Incidents', value: counts.total, color: 'var(--gold-400)', icon: <ShieldAlert size={18} /> },
          { label: 'Open', value: counts.open, color: 'var(--red)', icon: <AlertTriangle size={18} /> },
          { label: 'Investigating', value: counts.investigating, color: 'var(--amber)', icon: <Clock size={18} /> },
          { label: 'Closed', value: counts.closed, color: 'var(--emerald)', icon: <CheckCircle2 size={18} /> },
        ].map(c => (
          <div key={c.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${c.color}15`, color: c.color }}>
              {c.icon}
            </div>
            <div>
              <p className="text-xl font-bold font-mono" style={{ color: c.color }}>{c.value}</p>
              <p className="text-xs text-[var(--slate-400)]">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          id="incident-search"
          placeholder="Search incidents..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 min-w-48"
        />
        <select id="severity-filter" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="Warning">Warning</option>
          <option value="Info">Info</option>
        </select>
      </div>

      {/* Incident cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center text-[var(--slate-400)]">No incidents found</div>
        ) : filtered.map(incident => (
          <div key={incident.id} className="glass-card p-5 hover:border-[var(--slate-500)]/40 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${severityColors[incident.severity]}15` }}
                >
                  <AlertTriangle size={18} style={{ color: severityColors[incident.severity] }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--white)]">{incident.type}</span>
                    <span className="status-badge text-[10px]" style={{
                      background: `${severityColors[incident.severity]}15`,
                      color: severityColors[incident.severity]
                    }}>{incident.severity}</span>
                    <span className="status-badge text-[10px]" style={{
                      background: `${statusColors[incident.status]}15`,
                      color: statusColors[incident.status]
                    }}>{incident.status}</span>
                  </div>
                  <p className="text-sm text-[var(--slate-300)] mt-1">{incident.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--slate-500)]">
                    <span>{incident.section}</span>
                    <span>·</span>
                    <span>{new Date(incident.date).toLocaleDateString()}</span>
                    {incident.injuries > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-[var(--red)]">{incident.injuries} injury/injuries</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary shrink-0" style={{ padding: '6px 12px', fontSize: 12 }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
