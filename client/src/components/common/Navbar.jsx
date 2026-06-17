import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Listings', path: '/listings' },
];

const Navbar = () => {
  // Destructure 'tenant' directly instead of a generic user object
  const { tenant, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const handleToggle = (event) => {
    event.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  const firstName = tenant?.name?.split(' ')[0] || 'Tenant';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold text-primary">
          RentHouse
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-muted hover:text-primary'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!tenant ? (
            <Link
              to="/auth"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-strong cursor-pointer"
            >
              Sign in
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={handleToggle}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background pl-4 pr-1 py-1 text-sm font-semibold text-text transition hover:border-primary cursor-pointer"
              >
                <span className="mr-1">{firstName}</span>
                {tenant.avatar?.url ? (
                  <img
                    src={tenant.avatar.url}
                    alt={tenant.name}
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white uppercase">
                    {firstName[0]}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-soft animate-fade-in"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="space-y-3">
                    <div className="px-1">
                      <p className="text-sm font-semibold text-text truncate">{tenant.name}</p>
                      <p className="text-sm text-muted truncate">{tenant.email}</p>
                    </div>
                    
                    <div className="rounded-3xl bg-background p-3 text-sm text-muted">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Tenant Account</p>
                      <p className="mt-2 text-xs leading-relaxed">
                        Manage saved homes, update rental preferences, and review active property inquiry histories.
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="block text-center rounded-3xl border border-border bg-background px-4 py-3 text-sm font-medium text-text transition hover:border-primary cursor-pointer"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Account settings
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;