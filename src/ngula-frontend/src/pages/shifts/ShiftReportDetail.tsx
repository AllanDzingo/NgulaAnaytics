import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shiftReportApi } from '@/api/client';
import { ChevronLeft, CheckCircle2, Clock, Factory, Wrench, ShieldAlert, Wind } from 'lucide-react';

interface ShiftReportData {
  id: number; date: string; shift: string; status: string; submittedAt: string;
  supervisor: { fullName: string };
  section: { name: string };
  productionEntries: { tonsCrushed: number; tonsMilled: number; feedGrade: number; recoveryPercentage: number; concentrateProduced: number; comments: string }[];
  downtimeEntries: { id: number; equipment: { name: string }; durationHours: number; reason: string; rootCause: string }[];
  equipmentObservations: { id: number; equipment: { name: string }; noiseLevel: number; generalCondition: string }[];
  sheqObservations: { incidents: number; nearMisses: number; safetyObservations: string; airQualityScore: number }[];
  undergroundReadings: { oxygenLevelStart: number; oxygenLevelMidshift: number; oxygenLevelFinish: number; dustLevel: number; visibility: string; incidents: number }[];
  shiftHandover: { majorEvents: string; equipmentIssues: string; safetyConcerns: string; outstandingActions: string; generalNotes: string } | null;
}

const statusColor = (s: string) => s === 'Submitted' ? 'var(--emerald)' : s === 'Approved' ? 'var(--gold-400)' : 'var(--amber)';

export function ShiftReportDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ShiftReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    shiftReportApi.getById(Number(id))
      .then(res => setReport(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-28 animate-pulse" />)}
    </div>
  );
  if (!report) return <div className="glass-card p-8 text-center text-[var(--slate-400)]">Report not found.</div>;

  const prod = report.productionEntries?.[0];
  const sheq = report.sheqObservations?.[0];
  const ug = report.undergroundReadings?.[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/shifts/new" className="flex items-center gap-1 text-[var(--slate-400)] hover:text-[var(--gold-400)] transition-colors">
          <ChevronLeft size={16} /> Shift Reports
        </Link>
        <span className="text-[var(--slate-600)]">/</span>
        <span className="text-[var(--white)]">Report #{report.id}</span>
      </div>

      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-[var(--white)]">Shift Report #{report.id}</h2>
              <span className="status-badge" style={{ background: `${statusColor(report.status)}15`, color: statusColor(report.status) }}>
                {report.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <span className="text-[var(--slate-400)]">Date: <span className="text-[var(--white)]">{new Date(report.date).toLocaleDateString()}</span></span>
              <span className="text-[var(--slate-400)]">Shift: <span className="text-[var(--gold-400)] font-semibold">{report.shift}</span></span>
              <span className="text-[var(--slate-400)]">Section: <span className="text-[var(--white)]">{report.section?.name}</span></span>
              <span className="text-[var(--slate-400)]">Supervisor: <span className="text-[var(--white)]">{report.supervisor?.fullName}</span></span>
              <span className="text-[var(--slate-400)]">Submitted: <span className="text-[var(--white)]">{new Date(report.submittedAt).toLocaleString()}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report.status === 'Submitted' && (
              <button className="btn btn-primary"><CheckCircle2 size={16} /> Approve</button>
            )}
          </div>
        </div>
      </div>

      {/* Production */}
      {prod && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2 mb-4">
            <Factory size={16} className="text-[var(--gold-400)]" /> Production Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Tons Crushed', value: `${prod.tonsCrushed.toLocaleString()} t` },
              { label: 'Tons Milled', value: `${prod.tonsMilled.toLocaleString()} t` },
              { label: 'Feed Grade', value: `${prod.feedGrade} g/t` },
              { label: 'Recovery', value: `${prod.recoveryPercentage}%` },
              { label: 'Concentrate', value: `${prod.concentrateProduced} t` },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-lg bg-[var(--navy-700)]/50">
                <p className="text-xs text-[var(--slate-400)] mb-1">{item.label}</p>
                <p className="font-mono font-bold text-[var(--gold-400)]">{item.value}</p>
              </div>
            ))}
          </div>
          {prod.comments && <p className="mt-3 text-sm text-[var(--slate-300)] italic">"{prod.comments}"</p>}
        </div>
      )}

      {/* Downtime */}
      {report.downtimeEntries?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2 mb-4">
            <Clock size={16} className="text-[var(--red)]" /> Downtime Events ({report.downtimeEntries.length})
          </h3>
          <table className="data-table">
            <thead><tr><th>Equipment</th><th>Duration</th><th>Reason</th><th>Root Cause</th></tr></thead>
            <tbody>
              {report.downtimeEntries.map(d => (
                <tr key={d.id}>
                  <td className="text-[var(--white)]">{d.equipment?.name ?? `Equip #${d.id}`}</td>
                  <td className="font-mono text-[var(--amber)]">{Number(d.durationHours).toFixed(1)} hrs</td>
                  <td>{d.reason}</td>
                  <td className="text-[var(--slate-400)]">{d.rootCause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Equipment Observations */}
      {report.equipmentObservations?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2 mb-4">
            <Wrench size={16} className="text-[var(--gold-400)]" /> Equipment Observations
          </h3>
          <table className="data-table">
            <thead><tr><th>Equipment</th><th>Noise Level</th><th>Condition</th></tr></thead>
            <tbody>
              {report.equipmentObservations.map(o => (
                <tr key={o.id}>
                  <td>{o.equipment?.name ?? `Equip #${o.id}`}</td>
                  <td className={`font-mono ${Number(o.noiseLevel) > 85 ? 'text-[var(--red)]' : 'text-[var(--emerald)]'}`}>{o.noiseLevel} dB</td>
                  <td>
                    <span className={`status-badge ${o.generalCondition === 'Good' || o.generalCondition === 'Excellent' ? 'status-operational' : o.generalCondition === 'Fair' ? 'status-warning' : 'status-down'}`}>
                      {o.generalCondition}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SHEQ */}
      {sheq && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2 mb-4">
            <ShieldAlert size={16} className="text-[var(--amber)]" /> SHEQ Observations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Incidents', value: sheq.incidents, critical: sheq.incidents > 0 },
              { label: 'Near Misses', value: sheq.nearMisses, critical: sheq.nearMisses > 0 },
              { label: 'Air Quality', value: sheq.airQualityScore },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-lg bg-[var(--navy-700)]/50">
                <p className="text-xs text-[var(--slate-400)] mb-1">{item.label}</p>
                <p className="font-mono font-bold" style={{ color: item.critical ? 'var(--red)' : 'var(--emerald)' }}>{item.value}</p>
              </div>
            ))}
          </div>
          {sheq.safetyObservations && <p className="text-sm text-[var(--slate-300)]">{sheq.safetyObservations}</p>}
        </div>
      )}

      {/* Underground */}
      {ug && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2 mb-4">
            <Wind size={16} className="text-[var(--slate-300)]" /> Underground Readings
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'O₂ Start', value: `${ug.oxygenLevelStart}%`, warn: ug.oxygenLevelStart < 19.5 },
              { label: 'O₂ Midshift', value: `${ug.oxygenLevelMidshift}%`, warn: ug.oxygenLevelMidshift < 19.5 },
              { label: 'O₂ Finish', value: `${ug.oxygenLevelFinish}%`, warn: ug.oxygenLevelFinish < 19.5 },
              { label: 'Dust Level', value: `${ug.dustLevel} mg/m³`, warn: ug.dustLevel > 0.5 },
              { label: 'Visibility', value: ug.visibility, warn: ug.visibility === 'Poor' || ug.visibility === 'Hazardous' },
              { label: 'Incidents', value: ug.incidents, warn: ug.incidents > 0 },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-lg bg-[var(--navy-700)]/50">
                <p className="text-xs text-[var(--slate-400)] mb-1">{item.label}</p>
                <p className="font-mono font-bold" style={{ color: item.warn ? 'var(--red)' : 'var(--emerald)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Handover */}
      {report.shiftHandover && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] mb-4">Shift Handover Notes</h3>
          <div className="space-y-3">
            {[
              { label: 'Major Events', value: report.shiftHandover.majorEvents },
              { label: 'Equipment Issues', value: report.shiftHandover.equipmentIssues },
              { label: 'Safety Concerns', value: report.shiftHandover.safetyConcerns },
              { label: 'Outstanding Actions', value: report.shiftHandover.outstandingActions },
              { label: 'General Notes', value: report.shiftHandover.generalNotes },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="p-3 rounded-lg bg-[var(--navy-700)]/50">
                <p className="text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1">{f.label}</p>
                <p className="text-sm text-[var(--slate-300)]">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
