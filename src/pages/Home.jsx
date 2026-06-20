import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../utils/db';
import { CATEGORIES } from '../utils/constants';
import ItemCard from '../components/items/ItemCard';
import { Search, SlidersHorizontal, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getItems({ status: 'approved' });
      setItems(data);
      setFiltered(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...items];
    if (type) result = result.filter(i => i.type === type);
    if (category) result = result.filter(i => i.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, type, category, items]);

  const stats = {
    lost: items.filter(i => i.type === 'lost').length,
    found: items.filter(i => i.type === 'found').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink-900 mb-1">
          Campus Lost &amp; Found
        </h1>
        <p className="text-ink-400 text-sm">
          {stats.lost} lost · {stats.found} found · reconnecting campus
        </p>
      </div>

      {/* Search + filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search items, locations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="input w-auto min-w-[110px] text-sm"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="">All types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select
            className="input w-auto min-w-[130px] text-sm"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
          {(type || category || search) && (
            <button
              onClick={() => { setType(''); setCategory(''); setSearch(''); }}
              className="btn-ghost text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* CTA if not logged in */}
      {!user && (
        <div className="mb-6 p-4 bg-accent-50 border border-accent-100 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-accent-800">Lost something? Found something?</p>
            <p className="text-xs text-accent-600 mt-0.5">Sign in to report and claim items.</p>
          </div>
          <Link to="/register" className="btn-primary text-xs shrink-0">Get started</Link>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-300">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-ink-500 font-medium">No items found</p>
          <p className="text-ink-400 text-sm mt-1">
            {search || type || category ? 'Try adjusting your filters' : 'Be the first to report an item'}
          </p>
          {user && (
            <Link to="/report" className="btn-primary mt-4 inline-flex">
              <Plus size={15} /> Report item
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-400 mb-4">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* FAB */}
      {user && (
        <Link
          to="/report"
          className="fixed bottom-6 right-6 btn-primary rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl"
          title="Report item"
        >
          <Plus size={20} />
        </Link>
      )}
    </div>
  );
}
