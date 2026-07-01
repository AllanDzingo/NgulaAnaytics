import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shiftReportApi } from '@/api/client';
import { Plus, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';

const SECTIONS = [
  { id: 1, name: 'Primary Crushing' }, { id: 2, name: 'Secondary Crushing' },
  { id: 3, name: 'Milling' }, { id: 4, name: 'Flotation' },
  { id: 5, name: 'Tailings' }, { id: 6, name: 'Underground' },
];

type SectionKey = 'production' | 'downtime' | 'observations' | 'sheq' | 'underground' | 'handover';

export function NewShiftReport() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    production: true, downtime: false, observations: false, sheq: false, underground: false, handover: false,
  });

  const toggle = (key: SectionKey) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('DAY');
  const [sectionId, setSectionId] = useState(1);

  const [production, setProduction] = useState({
    tonsCrushed: '', tonsMilled: '', feedGrade: '',
    recoveryPercentage: '', concentrateProduced: '', comments: '',
  });

  const [downtimes, setDowntimes] = useState([{
    equipmentId: 1, startTime: '', endTime: '', reason: '', rootCause: '', correctiveAction: '',
  }]);

  const [sheq, setSheq] = useState({
    incidents: 0, nearMisses: 0, safetyObservations: '', environmentalObservations: '',
    airQualityScore: 85, dustLevel: 0.3, heatIndex: 28,
  });

  const [underground, setUnderground] = useState({
    truckloadsExcavated: 0, oxygenLevelStart: 20.9, oxygenLevelMidshift: 20.8, oxygenLevelFinish: 20.7,
    dustLevel: 0.3, visibility: 'Good', incidents: 0, incidentDescriptions: '',
  });

  const [handover, setHandover] = useState({
    majorEvents: '', equipmentIssues: '', safetyConcerns: '',
    productionConcerns: '', outstandingActions: '', generalNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        date, shift, sectionId,
        productionEntry: {
          tonsCrushed: Number(production.tonsCrushed),
          tonsMilled: Number(production.tonsMilled),
          feedGrade: Number(production.feedGrade),
          recoveryPercentage: Number(production.recoveryPercentage),
          concentrateProduced: Number(production.concentrateProduced),
          comments: production.comments,
        },
      };
      if (downtimes.some(d => d.startTime && d.endTime)) {
        payload.downtimeEntries = downtimes
          .filter(d => d.startTime && d.endTime)
          .map(d => ({ ...d, equipmentId: Number(d.equipmentId) }));
      }
      if (openSections.sheq) payload.sheqObservation = sheq;
      if (openSections.underground) payload.undergroundReading = underground;
      if (handover.majorEvents) payload.handover = handover;

      const res = await shiftReportApi.create(payload);
      navigate(`/shifts/${res.data.id}`);
    } catch (err) {
      alert('Failed to submit shift report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const SectionHeader = ({ title, section, badge }: { title: string; section: SectionKey; badge?: string }) => (
    <button
      type="button"
      onClick={() => toggle(section)}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--navy-700)]/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-[var(--white)]">{title}</h3>
        {badge && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--gold-500)]/15 text-[var(--gold-400)]">{badge}</span>}
      </div>
      {openSections[section] ? <ChevronUp size={16} className="text-[var(--slate-400)]" /> : <ChevronDown size={16} className="text-[var(--slate-400)]" />}
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--white)]">New Shift Report</h2>
        <p className="text-sm text-[var(--slate-400)] mt-0.5">Submit a comprehensive shift report for your section</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Header */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--white)] mb-4">Report Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">Date</label>
              <input id="report-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">Shift</label>
              <select id="report-shift" value={shift} onChange={e => setShift(e.target.value)}>
                <option value="DAY">Day Shift</option>
                <option value="AFT">Afternoon Shift</option>
                <option value="NGT">Night Shift</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">Section</label>
              <select id="report-section" value={sectionId} onChange={e => setSectionId(Number(e.target.value))}>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="glass-card overflow-hidden">
          <SectionHeader title="Production Data" section="production" badge="Required" />
          {openSections.production && (
            <div className="p-5 pt-0 border-t border-[var(--slate-600)]/30">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {[
                  { id: 'tons-crushed', label: 'Tons Crushed', key: 'tonsCrushed' },
                  { id: 'tons-milled', label: 'Tons Milled', key: 'tonsMilled' },
                  { id: 'feed-grade', label: 'Feed Grade (g/t)', key: 'feedGrade' },
                  { id: 'recovery', label: 'Recovery (%)', key: 'recoveryPercentage' },
                  { id: 'concentrate', label: 'Concentrate Produced (t)', key: 'concentrateProduced' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input id={f.id} type="number" step="0.01" value={production[f.key as keyof typeof production]}
                      onChange={e => setProduction(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">Comments</label>
                  <textarea id="prod-comments" rows={2} value={production.comments}
                    onChange={e => setProduction(p => ({ ...p, comments: e.target.value }))} placeholder="Any notable observations..." />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Downtime */}
        <div className="glass-card overflow-hidden">
          <SectionHeader title="Downtime Events" section="downtime" />
          {openSections.downtime && (
            <div className="p-5 pt-0 border-t border-[var(--slate-600)]/30 space-y-4 mt-4">
              {downtimes.map((dt, i) => (
                <div key={i} className="p-4 rounded-lg bg-[var(--navy-700)]/50 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--slate-400)] mb-1">Equipment ID</label>
                      <input id={`dt-equip-${i}`} type="number" value={dt.equipmentId}
                        onChange={e => setDowntimes(p => p.map((d, j) => j === i ? { ...d, equipmentId: Number(e.target.value) } : d))} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--slate-400)] mb-1">Start Time</label>
                      <input id={`dt-start-${i}`} type="datetime-local" value={dt.startTime}
                        onChange={e => setDowntimes(p => p.map((d, j) => j === i ? { ...d, startTime: e.target.value } : d))} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--slate-400)] mb-1">End Time</label>
                      <input id={`dt-end-${i}`} type="datetime-local" value={dt.endTime}
                        onChange={e => setDowntimes(p => p.map((d, j) => j === i ? { ...d, endTime: e.target.value } : d))} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--slate-400)] mb-1">Reason</label>
                      <input id={`dt-reason-${i}`} type="text" value={dt.reason}
                        onChange={e => setDowntimes(p => p.map((d, j) => j === i ? { ...d, reason: e.target.value } : d))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[var(--slate-400)] mb-1">Root Cause</label>
                      <input id={`dt-root-${i}`} type="text" value={dt.rootCause}
                        onChange={e => setDowntimes(p => p.map((d, j) => j === i ? { ...d, rootCause: e.target.value } : d))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[var(--slate-400)] mb-1">Corrective Action</label>
                      <input id={`dt-action-${i}`} type="text" value={dt.correctiveAction}
                        onChange={e => setDowntimes(p => p.map((d, j) => j === i ? { ...d, correctiveAction: e.target.value } : d))} />
                    </div>
                  </div>
                  {downtimes.length > 1 && (
                    <button type="button" onClick={() => setDowntimes(p => p.filter((_, j) => j !== i))} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setDowntimes(p => [...p, { equipmentId: 1, startTime: '', endTime: '', reason: '', rootCause: '', correctiveAction: '' }])}
                className="btn btn-secondary w-full">
                <Plus size={14} /> Add Downtime Event
              </button>
            </div>
          )}
        </div>

        {/* SHEQ */}
        <div className="glass-card overflow-hidden">
          <SectionHeader title="SHEQ Observations" section="sheq" />
          {openSections.sheq && (
            <div className="p-5 pt-0 border-t border-[var(--slate-600)]/30 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'sheq-incidents', label: 'Incidents', key: 'incidents', type: 'number' },
                  { id: 'sheq-near-misses', label: 'Near Misses', key: 'nearMisses', type: 'number' },
                  { id: 'sheq-air', label: 'Air Quality Score', key: 'airQualityScore', type: 'number' },
                  { id: 'sheq-dust', label: 'Dust Level (mg/m³)', key: 'dustLevel', type: 'number' },
                  { id: 'sheq-heat', label: 'Heat Index (°C)', key: 'heatIndex', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input id={f.id} type={f.type} value={sheq[f.key as keyof typeof sheq]}
                      onChange={e => setSheq(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">Safety Observations</label>
                  <textarea id="sheq-safety" rows={2} value={sheq.safetyObservations}
                    onChange={e => setSheq(p => ({ ...p, safetyObservations: e.target.value }))} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Underground */}
        {sectionId === 6 && (
          <div className="glass-card overflow-hidden">
            <SectionHeader title="Underground Readings" section="underground" badge="Underground Only" />
            {openSections.underground && (
              <div className="p-5 pt-0 border-t border-[var(--slate-600)]/30 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'ug-trucks', label: 'Truckloads Excavated', key: 'truckloadsExcavated' },
                    { id: 'ug-o2-start', label: 'O₂ Level Start (%)', key: 'oxygenLevelStart' },
                    { id: 'ug-o2-mid', label: 'O₂ Level Midshift (%)', key: 'oxygenLevelMidshift' },
                    { id: 'ug-o2-end', label: 'O₂ Level Finish (%)', key: 'oxygenLevelFinish' },
                    { id: 'ug-dust', label: 'Dust Level (mg/m³)', key: 'dustLevel' },
                    { id: 'ug-incidents', label: 'Incidents', key: 'incidents' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input id={f.id} type="number" step="0.1" value={underground[f.key as keyof typeof underground]}
                        onChange={e => setUnderground(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">Visibility</label>
                    <select id="ug-visibility" value={underground.visibility} onChange={e => setUnderground(p => ({ ...p, visibility: e.target.value }))}>
                      <option>Good</option><option>Moderate</option><option>Poor</option><option>Hazardous</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Handover */}
        <div className="glass-card overflow-hidden">
          <SectionHeader title="Shift Handover" section="handover" />
          {openSections.handover && (
            <div className="p-5 pt-0 border-t border-[var(--slate-600)]/30 mt-4 space-y-3">
              {[
                { id: 'ho-events', label: 'Major Events', key: 'majorEvents' },
                { id: 'ho-equip', label: 'Equipment Issues', key: 'equipmentIssues' },
                { id: 'ho-safety', label: 'Safety Concerns', key: 'safetyConcerns' },
                { id: 'ho-production', label: 'Production Concerns', key: 'productionConcerns' },
                { id: 'ho-actions', label: 'Outstanding Actions', key: 'outstandingActions' },
                { id: 'ho-notes', label: 'General Notes', key: 'generalNotes' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-[var(--slate-400)] uppercase tracking-wider mb-1.5">{f.label}</label>
                  <textarea id={f.id} rows={2} value={handover[f.key as keyof typeof handover]}
                    onChange={e => setHandover(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} id="submit-report" className="btn btn-primary flex-1">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[var(--navy-900)]/30 border-t-[var(--navy-900)] rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <><Send size={16} /> Submit Shift Report</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
