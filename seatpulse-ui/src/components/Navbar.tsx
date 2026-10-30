import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket, LogIn, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sage-light/30 bg-cream/90 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center font-display text-3xl font-black tracking-tight text-burgundy transition-transform hover:scale-[1.02]"
        >
          Seat<span className="italic text-sage-dark ml-1">Pulse</span>
        </Link>

        {/* Desktop Navigation */}
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
                <Ticket size={18} />
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

        {/* Mobile Menu Icon (Simplified for now) */}
        <div className="md:hidden flex items-center">
          {isAuthenticated ? (
            <Link to="/profile" className="text-burgundy p-2"><User size={24} /></Link>
          ) : (
            <Link to="/login" className="text-burgundy p-2"><LogIn size={24} /></Link>
          )}
        </div>
      </div>
    </header>
  );
}