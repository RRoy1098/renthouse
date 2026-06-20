import React from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const registerOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  businessName: z.string().optional(),
});

export default function Register() {
  const { register: formRegister, handleSubmit: formSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerOwnerSchema),
  });
  const { register, loading, error } = useAuth();
  const [submitted, setSubmitted] = React.useState(false);

  const onSubmit = async (data) => {
    const result = await register(data);
    if (result.success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl border border-border p-8 shadow-card">
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
            <p className="text-muted mb-6">
              Your owner account is now pending admin verification. You will receive an email with login credentials once approved.
            </p>
            <Link
              to="/login"
              className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg">R</div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Register as Owner</h1>
          <p className="text-muted">List your properties and reach thousands of tenants</p>
        </div>

        <form onSubmit={formSubmit(onSubmit)} className="bg-white rounded-xl border border-border p-6 space-y-4 shadow-card">
          {error && (
            <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-dark mb-1.5">Full Name</label>
            <input
              id="name" type="text" {...formRegister('name')}
              placeholder="John Doe"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.name ? 'border-danger' : 'border-border'}`}
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-dark mb-1.5">Email</label>
            <input
              id="email" type="email" {...formRegister('email')}
              placeholder="owner@example.com"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.email ? 'border-danger' : 'border-border'}`}
              autoComplete="email"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-muted-dark mb-1.5">Phone Number</label>
            <input
              id="phone" type="tel" {...formRegister('phone')}
              placeholder="+1 (555) 000-0000"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${errors.phone ? 'border-danger' : 'border-border'}`}
              autoComplete="tel"
            />
            {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-muted-dark mb-1.5">Business Name <span className="text-muted-light">(optional)</span></label>
            <input
              id="businessName" type="text" {...formRegister('businessName')}
              placeholder="Your Property Management Co."
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">No password needed!</p>
            <p>After submitting, your account will be reviewed by our admin team. You will receive an email with login credentials once approved.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Review'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
