import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Users, Clock, Shield, LogOut, Mail } from 'lucide-react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [pendingOwners, setPendingOwners] = useState([]);
  const [approvedOwners, setApprovedOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [notes, setNotes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        api.get('/admin/owners/pending'),
        api.get('/admin/owners/approved')
      ]);
      setPendingOwners(pendingRes.data.data || []);
      setApprovedOwners(approvedRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      setError('Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ownerId) => {
    setActionLoading(ownerId);
    try {
      const response = await api.post('/admin/owners/' + ownerId + '/verify', { adminNotes: notes[ownerId] || '' });
      const result = response.data;
      if (result.emailFailed) {
        window.alert('Owner approved but email sending failed. Generated password: ' + result.data.generatedPassword);
      }
      setNotes((prev) => { const n = { ...prev }; delete n[ownerId]; return n; });
      fetchOwners();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify owner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (ownerId) => {
    if (!window.confirm('Are you sure you want to reject this owner registration?')) return;
    setActionLoading(ownerId);
    try {
      await api.post('/admin/owners/' + ownerId + '/reject', { adminNotes: notes[ownerId] || '' });
      setNotes((prev) => { const n = { ...prev }; delete n[ownerId]; return n; });
      fetchOwners();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject owner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login', { replace: true });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-muted">Owner Registration Management</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger-light"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingOwners.length}</p>
                <p className="text-xs text-muted">Pending Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{approvedOwners.length}</p>
                <p className="text-xs text-muted">Approved Owners</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Brevo</p>
                <p className="text-xs text-muted">Email Notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg border border-border p-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ' + (activeTab === 'pending' ? 'bg-primary-50 text-primary-700' : 'text-muted hover:text-gray-900')}
          >
            Pending ({pendingOwners.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ' + (activeTab === 'approved' ? 'bg-primary-50 text-primary-700' : 'text-muted hover:text-gray-900')}
          >
            Approved ({approvedOwners.length})
          </button>
        </div>

        {/* Pending Owners */}
        {activeTab === 'pending' && (
          <>
            {pendingOwners.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center shadow-card">
                <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h3>
                <p className="text-muted text-sm">No pending owner registrations to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOwners.map((owner) => (
                  <div key={owner._id} className="bg-white rounded-xl border border-border p-6 shadow-card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{owner.name}</h3>
                        <p className="text-sm text-muted">{owner.email}</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted">Phone:</span>
                        <p className="text-gray-900 font-medium">{owner.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted">Business:</span>
                        <p className="text-gray-900 font-medium">{owner.businessName || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted">Registered:</span>
                        <p className="text-gray-900 font-medium">{formatDate(owner.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <textarea
                        placeholder="Add admin notes (optional)..."
                        value={notes[owner._id] || ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [owner._id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVerify(owner._id)}
                        disabled={actionLoading === owner._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {actionLoading === owner._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><CheckCircle2 className="w-4 h-4" /> Approve & Send Password</>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(owner._id)}
                        disabled={actionLoading === owner._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-danger text-white rounded-lg font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Approved Owners */}
        {activeTab === 'approved' && (
          <>
            {approvedOwners.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center shadow-card">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No approved owners yet</h3>
                <p className="text-muted text-sm">Approved owners will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Business</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {approvedOwners.map((owner) => (
                      <tr key={owner._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{owner.name}</td>
                        <td className="px-4 py-3 text-sm text-muted">{owner.email}</td>
                        <td className="px-4 py-3 text-sm text-muted">{owner.businessName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-muted">{formatDate(owner.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
