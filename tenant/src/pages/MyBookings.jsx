import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Loader2, HomeIcon, Building2, XCircle } from 'lucide-react';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { inquiryService } from '../api/inquiryService';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const fetchInquiries = async () => {
    try {
      const data = await inquiryService.getMyInquiries();
      setInquiries(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await inquiryService.cancel(id);
      toast.success('Booking cancelled');
      fetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-muted mt-1">Track and manage your property inquiries</p>
      </div>

      {error ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-light flex items-center justify-center">
            <HomeIcon className="w-8 h-8 text-danger" />
          </div>
          <p className="text-danger font-medium mb-2">Failed to load bookings</p>
          <p className="text-muted text-sm">{error}</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-light" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-muted mb-6">Start by browsing available rooms and sending an inquiry.</p>
          <Link
            to="/rooms"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const listing = inquiry.listing || {};
            return (
              <div
                key={inquiry._id}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-card transition-shadow"
              >                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <BookingStatusBadge status={inquiry.status} />
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {listing.description || 'Property Listing'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                        {listing.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {listing.location.city}, {listing.location.state}
                          </span>
                        )}
                        {listing.rent && (
                          <span className="font-medium text-primary-600">
                            ₹{listing.rent?.toLocaleString()}/mo
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(inquiry.moveInDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {['pending', 'seen'].includes(inquiry.status) && (
                        <button
                          onClick={() => handleCancel(inquiry._id)}
                          disabled={cancelling === inquiry._id}
                          className="flex items-center gap-1 text-sm text-danger hover:text-red-700 font-medium disabled:opacity-50"
                          aria-label="Cancel booking"
                        >
                          <XCircle className="w-4 h-4" />
                          {cancelling === inquiry._id ? '...' : 'Cancel'}
                        </button>
                      )}
                      <Link
                        to={`/rooms/${listing._id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>

                {/* Owner reply */}
                {inquiry.ownerReply && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted font-medium mb-1">Owner's reply:</p>
                    <p className="text-sm text-muted-dark">{inquiry.ownerReply}</p>
                  </div>
                )}

                {/* Message */}
                <div className="mt-3">
                  <p className="text-xs text-muted font-medium mb-0.5">Your message:</p>
                  <p className="text-sm text-muted">{inquiry.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
