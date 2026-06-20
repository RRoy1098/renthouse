import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignIn() {
  const { register: formRegister, handleSubmit: formSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 mb-6">
            <Building2 className="w-8 h-8" />
            <span className="text-xl font-bold">RentHouse</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-muted">Sign in to your tenant account</p>
        </div>

        {/* Form */}
        <form onSubmit={formSubmit(onSubmit)} className="bg-white rounded-xl border border-border p-6 space-y-4 shadow-card">            {error && (
              <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                <span>{error}</span>
                <button onClick={clearError} className="text-danger hover:text-danger/80 ml-2" aria-label="Dismiss error">&times;</button>
              </div>
            )}
            {(errors.email || errors.password) && (
              <p className="text-danger text-sm">Please fix the errors above before submitting.</p>
            )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-dark mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              {...formRegister('email')}
              placeholder="you@example.com"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.email ? 'border-danger' : 'border-border'}`}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-dark mb-1.5">Password</label>
            <div className="relative">
              <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...formRegister('password')}
              placeholder="Enter your password"
              className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.password ? 'border-danger' : 'border-border'}`}
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
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>

        <p className="text-center text-xs text-muted mt-4">
          Are you a property owner?{' '}
          <a href="http://localhost:5001/login" className="text-primary-600 hover:text-primary-700 font-medium" target="_blank" rel="noopener noreferrer">
            Owner login
          </a>
        </p>
      </div>
    </div>
  );
}
