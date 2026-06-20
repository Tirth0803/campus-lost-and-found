import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem, createClaim, getClaimsForItem } from '../utils/db';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';
import { MapPin, Calendar, User, Mail, Phone, ArrowLeft, Loader2, Tag } from 'lucide-react';
import emailjs from '@emailjs/browser';

const fmt = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ItemDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimMsg, setClaimMsg] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getItem(id);
      if (!data) { toast.error('Item not found'); navigate('/'); return; }
      setItem(data);

      if (user) {
        const claims = await getClaimsForItem(id);
        setHasClaimed(claims.some(c => c.userId === user.uid));
      }
      setLoading(false);
    })();
  }, [id, user]);

  const handleClaim = async () => {
    if (!claimMsg.trim()) return toast.error('Describe why this is yours');
    setClaiming(true);
    try {
      await createClaim(id, user.uid, claimMsg);

      await emailjs.send(
        'service_wo0ig9n',
        'template_4byofx8',
        {
          to_name: item.contactName || 'there',
          to_email: item.contactEmail,
          from_name: user.displayName || user.email,
          from_email: user.email,
          item_title: item.title,
          claim_message: claimMsg,
        },
        'pxSXSdrkLttEyKXDS'
      );

      setHasClaimed(true);
      toast.success('Claim submitted! The owner has been notified by email.');
    } catch {
      toast.error('Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={24} className="animate-spin text-ink-300" />
    </div>
  );

  const cat = CATEGORIES.find(c => c.value === item.category);
  const isOwner = user?.uid === item.userId;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-5 -ml-1 text-sm">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="aspect-square bg-ink-50 rounded-2xl overflow-hidden">
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-7xl">{cat?.icon ?? '📦'}</div>
          }
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>{item.type}</span>
              <span className={
                item.status === 'pending' ? 'badge-pending' :
                item.status === 'returned' ? 'badge-returned' : 'badge-approved'
              }>{item.status}</span>
            </div>
            <h1 className="text-xl font-semibold text-ink-900">{item.title}</h1>
            <p className="text-sm text-ink-500 mt-2 leading-relaxed">{item.description}</p>
          </div>

          <div className="space-y-2 text-sm text-ink-500">
            {item.location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-ink-300" />
                {item.location}
              </div>
            )}
            {item.category && (
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-ink-300" />
                {cat?.icon} {cat?.label}
              </div>
            )}
            {item.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-ink-300" />
                Posted {fmt(item.createdAt)}
              </div>
            )}
            {item.date && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-ink-300 opacity-50" />
                {item.type === 'lost' ? 'Lost' : 'Found'} on {item.date}
              </div>
            )}
          </div>

          {/* Contact */}
          {item.status === 'approved' && (
            <div className="card p-4 space-y-2">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Contact</p>
              {item.contactName && (
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <User size={13} /> {item.contactName}
                </div>
              )}
              {item.contactEmail && (
                <a href={`mailto:${item.contactEmail}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                  <Mail size={13} /> {item.contactEmail}
                </a>
              )}
              {item.contactPhone && (
                <a href={`tel:${item.contactPhone}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                  <Phone size={13} /> {item.contactPhone}
                </a>
              )}
            </div>
          )}

          {/* Claim */}
          {user && !isOwner && !isAdmin && item.status === 'approved' && item.type === 'found' && (
            <div className="card p-4 space-y-3">
              <p className="text-sm font-medium text-ink-700">Is this yours?</p>
              {hasClaimed ? (
                <p className="text-sm text-green-600">✓ Claim submitted. The owner has been notified by email.</p>
              ) : (
                <>
                  <textarea
                    className="input resize-none min-h-[70px] text-sm"
                    placeholder="Describe details only the owner would know…"
                    value={claimMsg}
                    onChange={e => setClaimMsg(e.target.value)}
                  />
                  <button onClick={handleClaim} disabled={claiming} className="btn-primary w-full text-sm">
                    {claiming ? <Loader2 size={14} className="animate-spin" /> : 'Submit claim'}
                  </button>
                </>
              )}
            </div>
          )}

          {item.status === 'pending' && !isAdmin && (
            <div className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              ⏳ This post is pending admin approval.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}