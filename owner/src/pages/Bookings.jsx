import { useState, useEffect } from 'react';
import { Loader2, Eye, Filter } from 'lucide-react';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { inquiryService } from '../api/inquiryService';
import toast from 'react-hot-toast';

export default function Bookings() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [responding, setResponding] = useState(null);
  const [replyText, setReplyText] = useState({});

  const fetchInquiries = async () => {
    try {
      const data = await inquiryService.getOwnerInquiries();
      setInquiries(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleReply = async (id, status) => {
    setResponding(id);
    try {
      await inquiryService.replyToInquiry(id, {
        status,
        ownerReply: replyText[id] || '',
      });
      toast.success(`Booking ${status}`);
      setReplyText((prev) => ({ ...prev, [id]: '' }));
      fetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setResponding(null);
    }
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);

  const statusFilters = ['all', 'pending', 'seen', 'accepted', 'rejected'];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center py-16"><p className="text-danger font-medium">{error}</p></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-muted mt-1">{inquiries.length} total inquiries</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
              filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-muted-dark border-border hover:border-primary-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Eye className="w-12 h-12 mx-auto mb-3 text-muted-light" />
          <p className="text-muted">No {filter !== 'all' ? filter : ''} bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inq) => (
            <div key={inq._id} className="bg-white rounded-xl border border-border p-5 shadow-card">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookingStatusBadge status={inq.status} />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center text-sm font-semibold">
                      {inq.tenant?.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inq.tenant?.name || 'Tenant'}</p>
                      <p className="text-xs text-muted">{inq.tenant?.email} • {inq.tenant?.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted mb-1">
                    <span className="font-medium">Property:</span> {inq.listing?.description?.slice(0, 60) || 'N/A'}
                  </p>
                  <p className="text-sm text-muted mb-1">
                    <span className="font-medium">Move-in:</span> {new Date(inq.moveInDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted">
                    <span className="font-medium">Message:</span> {inq.message}
                  </p>
                  {inq.ownerReply && (
                    <div className="mt-3 p-3 bg-primary-50 border border-primary-100 rounded-lg">
                      <p className="text-xs font-medium text-primary-700 mb-1">Your reply:</p>
                      <p className="text-sm text-primary-800">{inq.ownerReply}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {inq.status === 'pending' || inq.status === 'seen' ? (
                  <div className="shrink-0 space-y-3 lg:w-64">
                    <textarea
                      rows={2}
                      placeholder="Reply to tenant..."
                      value={replyText[inq._id] || ''}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [inq._id]: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(inq._id, 'accepted')}
                        disabled={responding === inq._id}
                        className="flex-1 px-3 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {responding === inq._id ? '...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleReply(inq._id, 'rejected')}
                        disabled={responding === inq._id}
                        className="flex-1 px-3 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {responding === inq._id ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0">
                    <span className="text-xs text-muted">Already responded</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
