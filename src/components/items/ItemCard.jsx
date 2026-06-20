import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

const fmt = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function ItemCard({ item }) {
  const cat = CATEGORIES.find(c => c.value === item.category);

  return (
    <Link to={`/item/${item.id}`} className="card block overflow-hidden group hover:shadow-card-hover transition-all duration-200 animate-fade-in">
      {/* Image */}
      <div className="aspect-[4/3] bg-ink-50 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {cat?.icon ?? '📦'}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-ink-900 text-sm leading-snug line-clamp-2 flex-1">
            {item.title}
          </h3>
          <span className={item.type === 'lost' ? 'badge-lost shrink-0' : 'badge-found shrink-0'}>
            {item.type}
          </span>
        </div>

        <p className="text-ink-400 text-xs line-clamp-2 mb-3">{item.description}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-400">
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {item.location}
            </span>
          )}
          {item.createdAt && (
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {fmt(item.createdAt)}
            </span>
          )}
        </div>

        {/* Status */}
        {item.status !== 'approved' && (
          <div className="mt-3 pt-3 border-t border-ink-100">
            <span className={
              item.status === 'pending' ? 'badge-pending' :
              item.status === 'returned' ? 'badge-returned' : 'badge-approved'
            }>
              {item.status}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
