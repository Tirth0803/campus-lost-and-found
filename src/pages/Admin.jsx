import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItems, updateItem, deleteItem } from '../utils/db';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';
import {
  CheckCircle, Trash2, RotateCcw, Loader2,
  Package, AlertCircle, CheckSquare, Archive, Clock
} from 'lucide-react';

const fmt = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

export default function Admin() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    const all = await getItems({});
    setItems(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!isAdmin) return (
    <div className="flex items-center justify-center min-h-[60vh] text-ink-400">
      Access denied.
    </div>
  );

  const counts = {
    pending: items.filter(i => i.status === 'pending').length,
    approved: items.filter(i => i.status === 'approved').length,
    returned: items.filter(i => i.status === 'returned').length,
  };

  const displayed = items.filter(i => i.status === tab);

  const act = async (fn, id) => {
    setActing(id);
    try { await fn(); await load(); }
    finally { setActing(null); }
  };

  const approve = (item) =>
    act(() => { toast.success('Approved'); return updateItem(item.id, { status: 'approved' }); }, item.id);

  const markReturned = (item) =>
    act(() => { toast.success('Marked returned'); return updateItem(item.id, { status: 'returned' }); }, item.id);

  const remove = (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    act(async () => {
      await deleteItem(item.id, item.imagePath);
      toast.success('Deleted');
    }, item.id);
  };

  const cat = (val) => CATEGORIES.find(c => c.value === val);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Admin Dashboard</h1>
        <p className="text-sm text-ink-400 mt-0.5">Review, approve, and manage all reported items.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Pending', count: counts.pending, icon: Clock, color: 'text-amber-500 bg-amber-50' },
          { label: 'Approved', count: counts.approved, icon: CheckSquare, color: 'text-accent bg-accent-50' },
          { label: 'Returned', count: counts.returned, icon: Archive, color: 'text-ink-400 bg-ink-100' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-lg font-semibold text-ink-900 leading-none">{count}</p>
              <p className="text-xs text-ink-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-ink-100 rounded-xl p-1 w-fit">
        {['pending', 'approved', 'returned'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all
              ${tab === t ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400 hover:text-ink-700'}`}
          >
            {t} {counts[t] > 0 && <span className="ml-1 text-xs opacity-60">({counts[t]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="animate-spin text-ink-300" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <p className="text-3xl mb-2">✓</p>
          <p className="text-sm">No {tab} items</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {displayed.map(item => (
                <tr key={item.id} className="hover:bg-ink-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-ink-100 overflow-hidden shrink-0 flex items-center justify-center text-lg">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          : cat(item.category)?.icon ?? '📦'}
                      </div>
                      <div>
                        <Link to={`/item/${item.id}`} className="font-medium text-ink-800 hover:text-accent line-clamp-1">
                          {item.title}
                        </Link>
                        <p className="text-xs text-ink-400">{item.userDisplayName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>{item.type}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink-500 text-xs">{item.location}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink-400 text-xs">{fmt(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {acting === item.id
                        ? <Loader2 size={14} className="animate-spin text-ink-300" />
                        : <>
                          {item.status === 'pending' && (
                            <button onClick={() => approve(item)} title="Approve"
                              className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {item.status === 'approved' && (
                            <button onClick={() => markReturned(item)} title="Mark returned"
                              className="p-1.5 rounded-lg text-accent hover:bg-accent-50 transition-colors">
                              <RotateCcw size={16} />
                            </button>
                          )}
                          <button onClick={() => remove(item)} title="Delete"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
