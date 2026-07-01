import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { actionsApi } from '@/api/client';
import { ChevronLeft, Send, AlertTriangle, Calendar, User, Tag } from 'lucide-react';
import type { ActionItem, ActionComment } from '@/types';

const priorityColor = (p: string) =>
    p === 'Critical' ? 'var(--red)' : p === 'High' ? 'var(--amber)' : p === 'Medium' ? 'var(--gold-400)' : 'var(--slate-400)';

const statusBadgeClass = (s: string) =>
    s === 'Open' ? 'status-down' : s === 'InProgress' ? 'status-warning' : 'status-operational';

export function ActionDetail() {
    const { id } = useParams<{ id: string }>();
    const [action, setAction] = useState<ActionItem | null>(null);
    const [comments, setComments] = useState<ActionComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await actionsApi.getById(Number(id));
            setAction(res.data);
        } catch { /* empty */ } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !id) return;
        setSubmitting(true);
        try {
            const res = await actionsApi.addComment(Number(id), newComment);
            setComments(prev => [...prev, res.data]);
            setNewComment('');
        } catch {
            alert('Failed to add comment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)}
        </div>
    );

    if (!action) return (
        <div className="glass-card p-8 text-center text-[var(--slate-400)]">Action not found.</div>
    );

    const isOverdue = new Date(action.dueDate) < new Date() && action.status !== 'Closed';

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link to="/actions" className="flex items-center gap-1 text-[var(--slate-400)] hover:text-[var(--gold-400)] transition-colors">
                    <ChevronLeft size={16} /> Action List
                </Link>
                <span className="text-[var(--slate-600)]">/</span>
                <span className="text-[var(--white)]">{action.title}</span>
            </div>

            {/* Header */}
            <div className="glass-card p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${priorityColor(action.priority)}15` }}>
                            <AlertTriangle size={20} style={{ color: priorityColor(action.priority) }} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-[var(--white)]">{action.title}</h2>
                                <span className="status-badge text-xs" style={{ background: `${priorityColor(action.priority)}15`, color: priorityColor(action.priority) }}>
                                    {action.priority}
                                </span>
                                <span className={`status-badge ${statusBadgeClass(action.status)}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {action.status === 'InProgress' ? 'In Progress' : action.status}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--slate-300)]">{action.description}</p>
                        </div>
                    </div>
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[var(--slate-600)]/40">
                    <div className="flex items-center gap-3">
                        <User size={16} className="text-[var(--slate-500)]" />
                        <div>
                            <p className="text-xs text-[var(--slate-400)]">Assigned To</p>
                            <p className="text-sm font-medium text-[var(--white)]">{action.assignedTo?.fullName ?? 'Unassigned'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tag size={16} className="text-[var(--slate-500)]" />
                        <div>
                            <p className="text-xs text-[var(--slate-400)]">Source</p>
                            <p className="text-sm font-medium text-[var(--white)]">{action.source}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-[var(--slate-500)]" />
                        <div>
                            <p className="text-xs text-[var(--slate-400)]">Due Date</p>
                            <p className={`text-sm font-medium font-mono ${isOverdue ? 'text-[var(--red)]' : 'text-[var(--white)]'}`}>
                                {new Date(action.dueDate).toLocaleDateString()}
                                {isOverdue && ' (Overdue)'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-[var(--slate-500)]" />
                        <div>
                            <p className="text-xs text-[var(--slate-400)]">Created</p>
                            <p className="text-sm font-medium text-[var(--white)]">{new Date(action.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-[var(--white)] flex items-center gap-2 mb-4">
                    Comments ({comments.length})
                </h3>

                {comments.length === 0 ? (
                    <p className="text-sm text-[var(--slate-500)] text-center py-6">No comments yet</p>
                ) : (
                    <div className="space-y-3 mb-4">
                        {comments.map(c => (
                            <div key={c.id} className="p-3 rounded-lg bg-[var(--navy-700)]/50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-[var(--gold-400)]">
                                        {c.user?.fullName ?? 'User'}
                                    </span>
                                    <span className="text-[10px] text-[var(--slate-500)]">
                                        {new Date(c.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--slate-300)]">{c.comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add comment */}
                <div className="flex gap-3">
                    <textarea
                        id="action-comment"
                        rows={2}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={submitting || !newComment.trim()}
                        className="btn btn-primary self-end"
                    >
                        {submitting ? (
                            <span className="w-4 h-4 border-2 border-[var(--navy-900)]/30 border-t-[var(--navy-900)] rounded-full animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}