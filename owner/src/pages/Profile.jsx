import { useState, useEffect } from 'react';
import { Loader2, User, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ownerService } from '../api/ownerService';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await ownerService.getProfile();
        const p = data.data || {};
        setForm({ name: p.name || '', phone: p.phone || '', email: p.email || '' });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ownerService.updateProfile({ name: form.name, phone: form.phone });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  const inputClass = "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-muted mt-1">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-card">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
            {form.name?.charAt(0)?.toUpperCase() || 'O'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{form.name || 'Owner'}</h2>
            <p className="text-sm text-muted">{form.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-dark mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={handleChange('name')} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-dark mb-1.5">Email</label>
            <input type="email" value={form.email} disabled className={`${inputClass} bg-surface-secondary text-muted cursor-not-allowed`} />
            <p className="text-xs text-muted mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-dark mb-1.5">Phone Number</label>
            <input type="tel" value={form.phone} onChange={handleChange('phone')} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
