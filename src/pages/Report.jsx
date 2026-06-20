import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createItem } from '../utils/db';
import { CATEGORIES, LOCATIONS } from '../utils/constants';
import toast from 'react-hot-toast';
import { Upload, X, Loader2, Info } from 'lucide-react';

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    contactName: user?.displayName || '',
    contactEmail: user?.email || '',
    contactPhone: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.location)
      return toast.error('Fill in all required fields');
    setLoading(true);
    try {
      await createItem(
        {
          ...form,
          userId: user.uid,
          userDisplayName: user.displayName || user.email,
        },
        imageFile
      );
      toast.success('Item reported! Waiting for admin approval.');
      navigate('/my-items');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Report an Item</h1>
        <p className="text-sm text-ink-400 mt-1">Fill in the details. An admin will review and approve your post.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type toggle */}
        <div className="card p-1 flex gap-1 w-fit">
          {['lost', 'found'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(f => ({ ...f, type: t }))}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all
                ${form.type === t
                  ? t === 'lost'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-green-500 text-white shadow-sm'
                  : 'text-ink-400 hover:text-ink-700'
                }`}
            >
              {t === 'lost' ? '😔 I Lost it' : '🎉 I Found it'}
            </button>
          ))}
        </div>

        {/* Main details */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-ink-700">Item details</h2>

          <div>
            <label className="label">Title <span className="text-red-400">*</span></label>
            <input type="text" className="input" placeholder="e.g. Black iPhone 14 with cracked screen" value={form.title} onChange={set('title')} />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Any identifying details, brand, colour, marks…"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category <span className="text-red-400">*</span></label>
              <select className="input" value={form.category} onChange={set('category')}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Location <span className="text-red-400">*</span></label>
              <select className="input" value={form.location} onChange={set('location')}>
                <option value="">Select…</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Date {form.type === 'lost' ? 'lost' : 'found'}</label>
            <input type="date" className="input" value={form.date} onChange={set('date')} max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {/* Image upload */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink-700 mb-3">Photo (optional)</h2>
          {imagePreview ? (
            <div className="relative w-full aspect-video bg-ink-50 rounded-xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-white/90 rounded-lg p-1 hover:bg-white"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-ink-200 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-accent-400 hover:bg-accent-50 transition-all">
              <Upload size={20} className="text-ink-400" />
              <span className="text-sm text-ink-500">Click to upload photo</span>
              <span className="text-xs text-ink-300">PNG, JPG up to 5MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>

        {/* Contact */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-ink-700">Contact info</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input" value={form.contactName} onChange={set('contactName')} />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input type="tel" className="input" placeholder="9XXXXXXXXX" value={form.contactPhone} onChange={set('contactPhone')} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.contactEmail} onChange={set('contactEmail')} />
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-ink-400 bg-ink-50 rounded-xl p-3">
          <Info size={13} className="mt-0.5 shrink-0" />
          Your contact details are only visible after an admin approves your post.
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
            : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
