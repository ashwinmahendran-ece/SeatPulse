import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/seatPulseApi';

const getInitials = (name?: string) => {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } finally {
      logout();
      sessionStorage.removeItem('seatpulse_jwt');
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sage-light/30 bg-cream/90 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 sm:h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-12">

        <Link
          to="/"
          className="flex shrink-0 items-center font-display text-2xl sm:text-3xl font-black tracking-tight text-burgundy transition-transform hover:scale-[1.02]"
        >
          Seat<span className="italic text-sage-dark ml-1">Pulse</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium text-sage-dark">
          <Link
            to="/explore"
            className={`transition-colors hover:text-burgundy ${location.pathname === '/explore' ? 'text-burgundy font-bold' : ''}`}
          >
            Explore Events
          </Link>

          <div className="h-4 w-[1px] bg-sage-light/50"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-burgundy hover:text-burgundy-light transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy text-xs font-bold text-cream-light">
                  {getInitials(user?.username)}
                </span>
                My Tickets
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-sage hover:text-burgundy transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-burgundy px-6 py-2.5 text-sm font-semibold text-cream-light transition-all hover:bg-burgundy-light hover:shadow-md"
            >
              <LogIn size={16} />
              Log In
            </Link>
          )}
        </nav>

        <div className="md:hidden flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <Link to="/profile" className="p-1" aria-label="Profile">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-xs font-bold text-cream-light">
                {getInitials(user?.username)}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="text-burgundy p-2"><LogIn size={22} /></Link>
          )}
        </div>
      </div>
    </header>
  );
}