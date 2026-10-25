import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Create Event', path: '/admin/events/new', icon: CalendarPlus },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F6F2]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-[#DCD8D2] bg-white">
        <div className="flex h-16 items-center border-b border-[#DCD8D2] px-6">
          <span className="font-display text-xl font-bold tracking-tight text-[#242224]">
            seatpulse<span className="text-[#6735E8]">*</span> admin
          </span>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#6735E8]/10 text-[#6735E8]'
                    : 'text-[#726E75] hover:bg-[#F8F6F2] hover:text-[#242224]'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#DCD8D2] p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* This Outlet renders your Dashboard, Event Form, or Seating Builder */}
        <Outlet />
      </main>
    </div>
  );
}