import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, User, LogOut, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
            <img src="/logo.png" alt="logo" className='w-25' />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/rooms" className="text-muted hover:text-primary-600 transition-colors font-medium">
              Browse Rooms
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="flex items-center gap-1.5 text-muted hover:text-primary-600 transition-colors font-medium">
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Link>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
                  <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-muted-dark hover:text-primary-600 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span>{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/sign-in"
                  className="text-sm font-medium text-muted-dark hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-dark hover:text-primary-600 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/rooms"
              className="block text-muted hover:text-primary-600 transition-colors font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Browse Rooms
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  className="block text-muted hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  className="block text-muted hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left text-muted hover:text-danger transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="block text-muted hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="block text-center bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
