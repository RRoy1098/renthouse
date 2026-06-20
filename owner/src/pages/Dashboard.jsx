import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Calendar, DollarSign, TrendingUp, Loader2, Eye } from 'lucide-react';
import StatCard from '../components/StatCard';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { listingService } from '../api/listingService';
import { inquiryService } from '../api/inquiryService';

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, inquiriesRes] = await Promise.all([
          listingService.getMyListings(),
          inquiryService.getOwnerInquiries(),
        ]);
        setListings(listingsRes.data || []);
        setInquiries(inquiriesRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-danger font-medium">{error}</p>
      </div>
    );
  }

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === 'available').length;
  const pendingBookings = inquiries.filter((i) => i.status === 'pending').length;
  const monthlyRevenue = listings.reduce((sum, l) => sum + (l.rent || 0), 0);
  const recentInquiries = inquiries.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted mt-1">Overview of your rental business</p>
        </div>
        <Link
          to="/listings/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + Add Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Building2}
          label="Total Listings"
          value={totalListings}
          subtext={`${activeListings} active`}
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="Pending Bookings"
          value={pendingBookings}
          subtext="Awaiting your response"
          color="warning"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Listings"
          value={activeListings}
          subtext={`${totalListings - activeListings} occupied`}
          color="success"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`₹${monthlyRevenue.toLocaleString()}`}
          subtext="If all units rented"
          color="accent"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-border shadow-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/bookings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        {recentInquiries.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Tenant</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3 hidden md:table-cell">Property</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentInquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-5 py-3 text-sm">
                      <div className="font-medium text-gray-900">{inq.tenant?.name || 'N/A'}</div>
                      <div className="text-xs text-muted">{inq.tenant?.email}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted hidden md:table-cell">
                      {inq.listing?.description?.slice(0, 40) || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <BookingStatusBadge status={inq.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-muted hidden md:table-cell">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
