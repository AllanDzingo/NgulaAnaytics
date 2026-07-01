import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { equipmentApi } from '@/api/client';
import { Search, Plus, Activity } from 'lucide-react';
import type { Equipment } from '@/types';

const statusClass = (s: string) => {
  if (s === 'Operational') return 'status-operational';
  if (s === 'Down') return 'status-down';
  return 'status-maintenance';
};

export function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    equipmentApi.getAll().then(res => {
      setEquipment(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = equipment.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === 'Operational').length,
    down: equipment.filter(e => e.status === 'Down').length,
    maintenance: equipment.filter(e => e.status === 'Under Maintenance').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--white)]">Equipment Registry</h2>
          <p className="text-sm text-[var(--slate-400)] mt-0.5">{counts.total} pieces of equipment across all sections</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Add Equipment</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Equipment', value: counts.total, color: 'var(--gold-400)' },
          { label: 'Operational', value: counts.operational, color: 'var(--emerald)' },
          { label: 'Down', value: counts.down, color: 'var(--red)' },
          { label: 'Maintenance', value: counts.maintenance, color: 'var(--amber)' },
        ].map(c => (
          <div key={c.label} className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${c.color}15` }}>
              <Activity size={20} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono" style={{ color: c.color }}>{c.value}</p>
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
            id="equip-search"
            type="text"
            placeholder="Search equipment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select id="equip-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Status</option>
          <option value="Operational">Operational</option>
          <option value="Down">Down</option>
          <option value="Under Maintenance">Under Maintenance</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--slate-400)]">Loading equipment...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[var(--slate-400)]">No equipment found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Manufacturer / Model</th><th>Status</th>
                <th>Operating Hours</th><th>Service Interval</th><th>Commission Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td>
                    <div>
                      <p className="font-medium text-[var(--white)]">{e.name}</p>
                    </div>
                  </td>
                  <td>
                    <span className="text-[var(--slate-300)]">{e.manufacturer}</span>
                    <span className="text-[var(--slate-500)] ml-1">· {e.model}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusClass(e.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {e.status}
                    </span>
                  </td>
                  <td className="font-mono text-[var(--slate-300)]">{e.currentOperatingHours.toLocaleString()} hrs</td>
                  <td className="font-mono text-[var(--slate-400)]">{e.serviceIntervalHours.toLocaleString()} hrs</td>
                  <td className="text-[var(--slate-400)]">{new Date(e.commissionDate).toLocaleDateString()}</td>
                  <td>
                    <Link
                      to={`/engineering/equipment/${e.id}`}
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
