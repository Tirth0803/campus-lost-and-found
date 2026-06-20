import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItems, deleteItem } from '../utils/db';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/items/ItemCard';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyItems() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const all = await getItems({});
      setItems(all.filter(i => i.userId === user.uid));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteItem(item.id, item.imagePath);
      toast.success('Item deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={24} className="animate-spin text-ink-300" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">My Reports</h1>
          <p className="text-sm text-ink-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} reported</p>
        </div>
        <Link to="/report" className="btn-primary text-sm">
          <Plus size={15} /> Report new
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-ink-500 font-medium">Nothing reported yet</p>
          <p className="text-ink-400 text-sm mt-1">Lost something or found an item? Let the campus know.</p>
          <Link to="/report" className="btn-primary mt-4 inline-flex">
            <Plus size={15} /> Report item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group">
              <ItemCard item={item} />
              <button
                onClick={() => handleDelete(item)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                           bg-white/90 rounded-lg p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 shadow-sm"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
