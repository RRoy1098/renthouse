import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Building2, ArrowRight } from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return <Navigate to="/" replace />;
  }

  const refNumber = booking._id?.slice(-8).toUpperCase() || 'N/A';

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inquiry Sent!</h1>
        <p className="text-muted">Your booking request has been submitted successfully.</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-card space-y-4 mb-8">
        <div className="text-center pb-4 border-b border-border">
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Reference Number</p>
          <p className="text-2xl font-bold text-primary-600 font-mono">{refNumber}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Property</span>
            <span className="font-medium text-gray-900 text-right">{booking.listingDescription || 'Property'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Move-in Date</span>
            <span className="font-medium text-gray-900">
              {booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-light text-warning">
              Pending
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted text-center">
          The property owner will review your inquiry and respond soon. You can track the status of your booking in your dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-bookings"
            className="flex-1 text-center bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            View My Bookings
          </Link>
          <Link
            to="/rooms"
            className="flex-1 text-center border border-border text-muted-dark px-6 py-3 rounded-xl font-medium hover:bg-surface-secondary transition-colors flex items-center justify-center gap-1"
          >
            Browse More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
