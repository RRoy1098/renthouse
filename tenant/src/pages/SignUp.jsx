import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignUp() {
  const { register: formRegister, handleSubmit: formSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await register(data);
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 mb-6">
            <Building2 className="w-8 h-8" />
            <span className="text-xl font-bold">RentHouse</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-muted">Start your journey to finding the perfect home</p>
        </div>

        <form onSubmit={formSubmit(onSubmit)} className="bg-white rounded-xl border border-border p-6 space-y-4 shadow-card">
          {error && (
            <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-dark mb-1.5">Full Name</label>
            <input
              id="name"
              type="text"
              {...formRegister('name')}
              placeholder="John Doe"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.name ? 'border-danger' : 'border-border'}`}
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

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
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-muted-dark mb-1.5">Phone Number</label>
            <input
              id="phone"
              type="tel"
              {...formRegister('phone')}
              placeholder="+1 (555) 000-0000"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.phone ? 'border-danger' : 'border-border'}`}
              autoComplete="tel"
            />
            {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-dark mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...formRegister('password')}
                placeholder="At least 6 characters"
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.password ? 'border-danger' : 'border-border'}`}
                autoComplete="new-password"
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
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
