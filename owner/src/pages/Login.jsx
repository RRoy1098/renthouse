import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg">R</div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Owner Login</h1>
          <p className="text-muted">Sign in to manage your properties</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-4 shadow-card">
          {error && (
            <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-danger hover:text-danger/80 ml-2">&times;</button>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-dark mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-dark mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light hover:text-muted"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an owner account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Register
          </Link>
        </p>

        <p className="text-center text-xs text-muted mt-4">
          <a href="http://localhost:5000" className="text-primary-600 hover:text-primary-700 font-medium" target="_blank" rel="noopener noreferrer">
            &larr; Back to RentHouse
          </a>
        </p>
      </div>
    </div>
  );
}
