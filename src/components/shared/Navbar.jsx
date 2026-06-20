import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, LayoutDashboard, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const active = (path) =>
    location.pathname === path
      ? 'text-accent font-semibold'
      : 'text-ink-500 hover:text-ink-900';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-ink-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink-900 text-sm">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <circle cx="10" cy="9" r="3.5" stroke="white" strokeWidth="1.6"/>
              <path d="M10 12.5v4M8 14.5h4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          Lost&amp;Found
        </Link>

        {/* Nav links */}
        {user && (
          <nav className="hidden sm:flex items-center gap-5 text-sm">
            <Link to="/" className={active('/')}>Browse</Link>
            <Link to="/report" className={active('/report')}>Report</Link>
            <Link to="/my-items" className={active('/my-items')}>My Items</Link>
            {isAdmin && (
              <Link to="/admin" className={`${active('/admin')} flex items-center gap-1`}>
                <LayoutDashboard size={14} />Admin
              </Link>
            )}
          </nav>
        )}

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-xs text-ink-400 max-w-[120px] truncate">
                {userProfile?.displayName || user.email}
              </span>
              <button onClick={handleLogout} className="btn-ghost px-2.5 py-2">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-xs">Sign in</Link>
              <Link to="/register" className="btn-primary text-xs">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {user && (
        <div className="sm:hidden border-t border-ink-100 flex">
          {[
            { to: '/', label: 'Browse' },
            { to: '/report', label: 'Report' },
            { to: '/my-items', label: 'Mine' },
            ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex-1 py-2.5 text-center text-xs font-medium border-b-2 transition-colors
                ${location.pathname === to
                  ? 'border-accent text-accent'
                  : 'border-transparent text-ink-400'}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
