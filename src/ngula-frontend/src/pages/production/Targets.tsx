import { useEffect, useState } from 'react';
import { targetsApi } from '@/api/client';
import { Plus, Edit3, Save, X } from 'lucide-react';

interface Target {
  id: number;
  sectionId: number;
  year: number;
  month: number;
  targetTonsCrushed: number;
  targetTonsMilled: number;
  targetRecovery: number;
  targetGrade: number;
  targetTruckloads: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SECTIONS = [
  { id: 1, name: 'Primary Crushing' }, { id: 2, name: 'Secondary Crushing' },
  { id: 3, name: 'Milling' }, { id: 4, name: 'Flotation' }, { id: 5, name: 'Tailings' },
];

const currentYear = new Date().getFullYear();

export function ProductionTargets() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Target>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterSection, setFilterSection] = useState<number | ''>('');
  const [newTarget, setNewTarget] = useState<Partial<Target>>({
    year: currentYear, month: 1, sectionId: 1,
    targetTonsCrushed: 0, targetTonsMilled: 0, targetRecovery: 85, targetGrade: 0, targetTruckloads: 0,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await targetsApi.getAll({ year: filterYear, sectionId: filterSection || undefined });
      setTargets(res.data);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterYear, filterSection]);

  const startEdit = (t: Target) => { setEditId(t.id); setEditValues({ ...t }); };
  const cancelEdit = () => { setEditId(null); setEditValues({}); };

  const saveEdit = async () => {
    if (!editId) return;
    await targetsApi.update(editId, editValues);
    setTargets(prev => prev.map(t => t.id === editId ? { ...t, ...editValues } as Target : t));
    cancelEdit();
  };

  const saveNew = async () => {
    const res = await targetsApi.create(newTarget);
    setTargets(prev => [...prev, res.data]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--white)]">Production Targets</h2>
          <p className="text-sm text-[var(--slate-400)] mt-0.5">Set and manage monthly production targets per section</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <Plus size={16} /> Add Target
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select id="filter-year" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} style={{ width: 'auto' }}>
          {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select id="filter-section" value={filterSection} onChange={e => setFilterSection(e.target.value ? Number(e.target.value) : '')} style={{ width: 'auto' }}>
          <option value="">All Sections</option>
          {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass-card p-5 border-[var(--gold-500)]/40">
          <h3 className="text-sm font-semibold text-[var(--white)] mb-4">New Target</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="label-xs">Section</label>
              <select value={newTarget.sectionId} onChange={e => setNewTarget(p => ({ ...p, sectionId: Number(e.target.value) }))}>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Month</label>
              <select value={newTarget.month} onChange={e => setNewTarget(p => ({ ...p, month: Number(e.target.value) }))}>
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Year</label>
              <input type="number" value={newTarget.year} onChange={e => setNewTarget(p => ({ ...p, year: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label-xs">Target Tons Crushed</label>
              <input type="number" value={newTarget.targetTonsCrushed} onChange={e => setNewTarget(p => ({ ...p, targetTonsCrushed: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label-xs">Target Tons Milled</label>
              <input type="number" value={newTarget.targetTonsMilled} onChange={e => setNewTarget(p => ({ ...p, targetTonsMilled: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label-xs">Target Recovery (%)</label>
              <input type="number" step="0.1" value={newTarget.targetRecovery} onChange={e => setNewTarget(p => ({ ...p, targetRecovery: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveNew} className="btn btn-primary"><Save size={14} /> Save</button>
            <button onClick={() => setShowAdd(false)} className="btn btn-secondary"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--slate-400)]">Loading targets...</div>
        ) : targets.length === 0 ? (
          <div className="p-8 text-center text-[var(--slate-400)]">No targets found for the selected filters</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Section</th><th>Month</th><th>Tons Crushed</th><th>Tons Milled</th>
                <th>Recovery %</th><th>Grade</th><th>Truckloads</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map(t => (
                <tr key={t.id}>
                  {editId === t.id ? (
                    <>
                      <td><span className="text-[var(--gold-400)]">{SECTIONS.find(s => s.id === t.sectionId)?.name}</span></td>
                      <td>{MONTHS[(t.month ?? 1) - 1]}</td>
                      <td><input type="number" value={editValues.targetTonsCrushed ?? t.targetTonsCrushed} onChange={e => setEditValues(p => ({ ...p, targetTonsCrushed: Number(e.target.value) }))} style={{ padding: '4px 8px' }} /></td>
                      <td><input type="number" value={editValues.targetTonsMilled ?? t.targetTonsMilled} onChange={e => setEditValues(p => ({ ...p, targetTonsMilled: Number(e.target.value) }))} style={{ padding: '4px 8px' }} /></td>
                      <td><input type="number" step="0.1" value={editValues.targetRecovery ?? t.targetRecovery} onChange={e => setEditValues(p => ({ ...p, targetRecovery: Number(e.target.value) }))} style={{ padding: '4px 8px' }} /></td>
                      <td><input type="number" step="0.01" value={editValues.targetGrade ?? t.targetGrade} onChange={e => setEditValues(p => ({ ...p, targetGrade: Number(e.target.value) }))} style={{ padding: '4px 8px' }} /></td>
                      <td><input type="number" value={editValues.targetTruckloads ?? t.targetTruckloads} onChange={e => setEditValues(p => ({ ...p, targetTruckloads: Number(e.target.value) }))} style={{ padding: '4px 8px' }} /></td>
                      <td>
                        <button onClick={saveEdit} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }}><Save size={12} /></button>
                        <button onClick={cancelEdit} className="btn btn-secondary ml-1" style={{ padding: '4px 10px', fontSize: 12 }}><X size={12} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="text-[var(--gold-400)] font-medium">{SECTIONS.find(s => s.id === t.sectionId)?.name}</td>
                      <td>{MONTHS[(t.month ?? 1) - 1]}</td>
                      <td className="font-mono">{t.targetTonsCrushed.toLocaleString()}</td>
                      <td className="font-mono">{t.targetTonsMilled.toLocaleString()}</td>
                      <td className="font-mono">{t.targetRecovery}%</td>
                      <td className="font-mono">{t.targetGrade}</td>
                      <td className="font-mono">{t.targetTruckloads}</td>
                      <td>
                        <button onClick={() => startEdit(t)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}><Edit3 size={12} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
