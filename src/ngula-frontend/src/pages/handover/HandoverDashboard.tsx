import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { handoverApi } from '@/api/client';
import { ArrowRightLeft, RefreshCw, AlertTriangle, CheckCircle2, Wrench, ClipboardList } from 'lucide-react';

interface HandoverSummary {
    shiftReportId: number;
    date: string;
    shift: string;
    supervisorName: string;
    majorEvents: string;
    equipmentIssues: string;
    safetyConcerns: string;
    productionConcerns: string;
    outstandingActions: string;
    generalNotes: string;
    activeActions: { id: number; title: string; priority: string; status: string; dueDate: string }[];
    equipmentStatus: { id: number; name: string; status: string }[];
}

const SECTIONS = [
    { id: 1, name: 'Primary Crushing' },
    { id: 2, name: 'Secondary Crushing' },
    { id: 3, name: 'Milling' },
    { id: 4, name: 'Flotation' },
    { id: 5, name: 'Tailings' },
    { id: 6, name: 'Underground' },
];

const priorityColor = (p: string) =>
    p === 'Critical' ? 'var(--red)' : p === 'High' ? 'var(--amber)' : p === 'Medium' ? 'var(--gold-400)' : 'var(--slate-400)';

const statusColor = (s: string) =>
    s === 'Down' ? 'var(--red)' : s === 'Under Maintenance' ? 'var(--amber)' : 'var(--emerald)';

export function HandoverDashboard() {
    const [handover, setHandover] = useState<HandoverSummary | null>(null);
    const [history, setHistory] = useState<HandoverSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [sectionId, setSectionId] = useState(1);
    const [view, setView] = useState<'current' | 'history'>('current');

    const load = async () => {
        setLoading(true);
        try {
            const [currentRes, historyRes] = await Promise.all([
                handoverApi.getCurrent(sectionId),
                handoverApi.getHistory(sectionId),
            ]);
            setHandover(currentRes.data);
            setHistory(historyRes.data);
        } catch { /* empty */ } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [sectionId]);

    const downEquipment = handover?.equipmentStatus.filter(e => e.status !== 'Operational') ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--white)]">Shift Handover</h2>
                    <p className="text-sm text-[var(--slate-400)] mt-0.5">View shift handover summaries and history by section</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        id="handover-section"
                        value={sectionId}
                        onChange={e => setSectionId(Number(e.target.value))}
                        style={{ width: 'auto' }}
                    >
                        {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={load} disabled={loading} className="btn btn-secondary">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <Link to="/shifts/new" className="btn btn-primary">
                        <ClipboardList size={16} /> New Report
                    </Link>
                </div>
            </div>

            {/* View toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setView('current')}
                    className={`btn ${view === 'current' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    Current Handover
                </button>
                <button
                    onClick={() => setView('history')}
                    className={`btn ${view === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    History (7 days)
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-40 animate-pulse gold-accent" />)}
                </div>
            ) : view === 'current' && handover ? (
                <>
                    {/* Summary banner */}
                    <div className="glass-card p-5" style={{ borderLeft: '3px solid var(--gold-500)' }}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--gold-500)]/10 flex items-center justify-center">
                                    <ArrowRightLeft size={24} className="text-[var(--gold-400)]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--white)]">
                                        {SECTIONS.find(s => s.id === sectionId)?.name} — Handover
                                    </h3>
                                    <p className="text-sm text-[var(--slate-400)]">
                                        {new Date(handover.date).toLocaleDateString()} · {handover.shift} Shift · Supervisor: {handover.supervisorName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-4" style={{ borderLeft: '3px solid var(--red)' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle size={18} className="text-[var(--red)]" />
                                <span className="text-sm font-semibold text-[var(--white)]">Down Equipment</span>
                            </div>
                            <p className="text-2xl font-bold font-mono text-[var(--red)]">{downEquipment.length}</p>
                            {downEquipment.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {downEquipment.map(e => (
                                        <div key={e.id} className="text-xs text-[var(--slate-400)] flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: statusColor(e.status) }} />
                                            {e.name} — {e.status}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-4" style={{ borderLeft: '3px solid var(--amber)' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 size={18} className="text-[var(--amber)]" />
                                <span className="text-sm font-semibold text-[var(--white)]">Active Actions</span>
                            </div>
                            <p className="text-2xl font-bold font-mono text-[var(--amber)]">{handover.activeActions.length}</p>
                            {handover.activeActions.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {handover.activeActions.slice(0, 3).map(a => (
                                        <div key={a.id} className="text-xs text-[var(--slate-400)] truncate">
                                            <span className="w-1.5 h-1.5 inline-block rounded-full mr-1" style={{ background: priorityColor(a.priority) }} />
                                            {a.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-4" style={{ borderLeft: '3px solid var(--emerald)' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <Wrench size={18} className="text-[var(--emerald)]" />
                                <span className="text-sm font-semibold text-[var(--white)]">Total Equipment</span>
                            </div>
                            <p className="text-2xl font-bold font-mono text-[var(--emerald)]">{handover.equipmentStatus.length}</p>
                            <p className="text-xs text-[var(--slate-400)] mt-2">
                                {handover.equipmentStatus.filter(e => e.status === 'Operational').length} operational
                            </p>
                        </div>
                    </div>

                    {/* Handover notes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[
                            { label: 'Major Events', value: handover.majorEvents, color: 'var(--gold-400)' },
                            { label: 'Equipment Issues', value: handover.equipmentIssues, color: 'var(--red)' },
                            { label: 'Safety Concerns', value: handover.safetyConcerns, color: 'var(--amber)' },
                            { label: 'Production Concerns', value: handover.productionConcerns, color: 'var(--gold-500)' },
                            { label: 'Outstanding Actions', value: handover.outstandingActions, color: 'var(--slate-300)' },
                            { label: 'General Notes', value: handover.generalNotes, color: 'var(--slate-400)' },
                        ].filter(n => n.value).map(n => (
                            <div key={n.label} className="glass-card p-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: n.color }}>{n.label}</h4>
                                <p className="text-sm text-[var(--slate-300)] whitespace-pre-wrap">{n.value}</p>
                            </div>
                        ))}
                    </div>
                </>
            ) : view === 'history' ? (
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <div className="glass-card p-8 text-center text-[var(--slate-400)]">No handover history found for this section.</div>
                    ) : (
                        history.map(h => (
                            <div key={h.shiftReportId} className="glass-card p-5 hover:border-[var(--slate-500)]/40 transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--gold-500)]/10 flex items-center justify-center shrink-0">
                                            <ArrowRightLeft size={20} className="text-[var(--gold-400)]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-[var(--white)]">
                                                    {new Date(h.date).toLocaleDateString()} — {h.shift} Shift
                                                </span>
                                                <span className="text-xs text-[var(--slate-500)]">Supervisor: {h.supervisorName}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                                                {h.majorEvents && (
                                                    <p className="text-xs text-[var(--slate-400)]"><span className="text-[var(--gold-400)]">Events:</span> {h.majorEvents}</p>
                                                )}
                                                {h.equipmentIssues && (
                                                    <p className="text-xs text-[var(--slate-400)]"><span className="text-[var(--red)]">Equipment:</span> {h.equipmentIssues}</p>
                                                )}
                                                {h.safetyConcerns && (
                                                    <p className="text-xs text-[var(--slate-400)]"><span className="text-[var(--amber)]">Safety:</span> {h.safetyConcerns}</p>
                                                )}
                                                {h.outstandingActions && (
                                                    <p className="text-xs text-[var(--slate-400)]"><span className="text-[var(--slate-300)]">Actions:</span> {h.outstandingActions}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`status-badge text-xs ${h.activeActions?.length > 0 ? 'status-warning' : 'status-operational'}`}>
                                            {h.activeActions?.length ?? 0} actions
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="glass-card p-8 text-center text-[var(--slate-400)]">
                    No current handover found for this section.
                </div>
            )}
        </div>
    );
}