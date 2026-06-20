import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import api from '../api/axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-muted">Verify owner registrations</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-4 shadow-card">
          {error && (
            <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-muted-dark mb-1.5">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@renthouse.com"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-muted-dark mb-1.5">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
