import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Calendar, User, LogOut,
  Menu, X, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/listings', icon: Building2, label: 'My Listings' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
            R
          </div>
          <span className="text-lg font-bold text-gray-900">RentHouse</span>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Owner</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.to)
                ? 'bg-primary-50 text-primary-700'
                : 'text-muted hover:bg-surface-secondary hover:text-muted-dark'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'O'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Owner'}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs">R</div>
          <span className="font-bold text-gray-900">RentHouse</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-muted hover:text-gray-900"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full bg-white shadow-modal">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-border">
        {navContent}
      </aside>
    </>
  );
}
