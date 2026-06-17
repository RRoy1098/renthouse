import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleModeToggle = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    // Clear form state completely when switching between login and registration panels
    setForm({ name: '', email: '', password: '', phone: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = mode === 'login'
        ? await login(form.email, form.password)
        : await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });

      if (!response.success) {
        setError(response.message);
      } else {
        navigate('/listings');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-8 animate-fade-in">
      <div className="rounded-[32px] border border-border bg-surface p-8 shadow-soft">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-primary">
              {mode === 'login' ? 'Welcome back' : 'Create your tenant account'}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {mode === 'login'
                ? 'Sign in to access your saved homes and rental inquiries.'
                : 'Register as a tenant to discover curated rentals and manage your target preferences.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleModeToggle}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary cursor-pointer"
          >
            {mode === 'login' ? 'Create an account' : 'Already have an account?'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 transition-all">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-muted">
                Name
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required={mode === 'register'}
                  autoComplete="name"
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                  placeholder="John Doe"
                />
              </label>
              <label className="block text-sm text-muted">
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required={mode === 'register'}
                  autoComplete="tel"
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                  placeholder="1234567890"
                />
              </label>
            </div>
          )}
          
          <label className="block text-sm text-muted">
            Email Address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
              placeholder="tenant@example.com"
            />
          </label>
          
          <label className="block text-sm text-muted">
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
              placeholder="••••••••"
            />
          </label>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Register now'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Auth;