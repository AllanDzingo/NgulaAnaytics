import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { actionsApi } from '@/api/client';
import { Search, Plus, AlertTriangle, CheckCircle2, Clock, ArrowUpCircle } from 'lucide-react';
import type { ActionItem } from '@/types';

const priorityColor = (p: string) =>
    p === 'Critical' ? 'var(--red)' : p === 'High' ? 'var(--amber)' : p === 'Medium' ? 'var(--gold-400)' : 'var(--slate-400)';

const statusBadgeClass = (s: string) =>
    s === 'Open' ? 'status-down' : s === 'InProgress' ? 'status-warning' : 'status-operational';

export function ActionList() {
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter) params.status = statusFilter;
            if (priorityFilter) params.priority = priorityFilter;
            const res = await actionsApi.getAll(params);
            setActions(res.data);
        } catch { /* empty */ } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [statusFilter, priorityFilter]);

    const filtered = actions.filter(a => {
        if (!search) return true;
        const q = search.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
    });

    const counts = {
        total: actions.length,
        open: actions.filter(a => a.status === 'Open').length,
        inProgress: actions.filter(a => a.status === 'InProgress').length,
        closed: actions.filter(a => a.status === 'Closed').length,
        critical: actions.filter(a => a.priority === 'Critical' && a.status !== 'Closed').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--white)]">Action Tracker</h2>
                    <p className="text-sm text-[var(--slate-400)] mt-0.5">
                        Track and manage corrective and preventive actions
                    </p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={16} /> New Action
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Total Actions', value: counts.total, color: 'var(--gold-400)', icon: <CheckCircle2 size={18} /> },
                    { label: 'Open', value: counts.open, color: 'var(--red)', icon: <AlertTriangle size={18} /> },
                    { label: 'In Progress', value: counts.inProgress, color: 'var(--amber)', icon: <Clock size={18} /> },
                    { label: 'Closed', value: counts.closed, color: 'var(--emerald)', icon: <CheckCircle2 size={18} /> },
                    { label: 'Critical', value: counts.critical, color: 'var(--red)', icon: <ArrowUpCircle size={18} /> },
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
                <div className="relative flex-1 min-w-48">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
                    <input
                        id="action-search"
                        type="text"
                        placeholder="Search actions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select id="action-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Closed">Closed</option>
                    <option value="Overdue">Overdue</option>
                </select>
                <select id="action-priority-filter" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">All Priority</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-[var(--slate-400)]">Loading actions...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-[var(--slate-400)]">No actions found</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th><th>Source</th><th>Priority</th><th>Status</th>
                                <th>Assigned To</th><th>Due Date</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(a => (
                                <tr key={a.id}>
                                    <td>
                                        <p className="font-medium text-[var(--white)]">{a.title}</p>
                                        {a.description && (
                                            <p className="text-xs text-[var(--slate-500)] truncate max-w-xs">{a.description}</p>
                                        )}
                                    </td>
                                    <td>
                                        <span className="text-xs text-[var(--slate-400)]">{a.source}</span>
                                    </td>
                                    <td>
                                        <span className="status-badge text-xs" style={{
                                            background: `${priorityColor(a.priority)}15`,
                                            color: priorityColor(a.priority),
                                        }}>
                                            {a.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${statusBadgeClass(a.status)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {a.status === 'InProgress' ? 'In Progress' : a.status}
                                        </span>
                                    </td>
                                    <td className="text-[var(--slate-300)]">{a.assignedTo?.fullName ?? '—'}</td>
                                    <td className={`font-mono text-xs ${new Date(a.dueDate) < new Date() && a.status !== 'Closed' ? 'text-[var(--red)]' : 'text-[var(--slate-400)]'}`}>
                                        {new Date(a.dueDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <Link
                                            to={`/actions/${a.id}`}
                                            className="btn btn-secondary"
                                            style={{ padding: '4px 12px', fontSize: 12 }}
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}