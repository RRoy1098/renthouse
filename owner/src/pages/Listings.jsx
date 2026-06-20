import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, ToggleLeft, ToggleRight, Trash2, Loader2, Building2 } from 'lucide-react';
import { listingService } from '../api/listingService';
import toast from 'react-hot-toast';

const typeLabels = {
  single: 'Single',
  double: 'Double',
  flat: 'Flat',
  PG: 'PG',
};

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    try {
      const data = await listingService.getMyListings();
      setListings(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleToggleStatus = async (listing) => {
    try {
      const newStatus = listing.status === 'available' ? 'occupied' : 'available';
      await listingService.updateStatus(listing._id, newStatus);
      toast.success(`Listing marked as ${newStatus}`);
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (listing) => {
    if (!window.confirm(`Are you sure you want to delete "${listing.description?.slice(0, 50)}"? This action cannot be undone.`)) return;
    try {
      await listingService.delete(listing._id);
      toast.success('Listing deleted');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-muted mt-1">{listings.length} {listings.length === 1 ? 'property' : 'properties'}</p>
        </div>
        <Link
          to="/listings/new"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-light" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-muted mb-6">Create your first property listing to start receiving inquiries.</p>
          <Link
            to="/listings/new"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Property</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3 hidden md:table-cell">Rent</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surface-tertiary overflow-hidden shrink-0">
                          {listing.images?.[0]?.url ? (
                            <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-light text-xs">No img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {listing.description?.slice(0, 50) || 'Untitled'}
                          </p>
                          <p className="text-xs text-muted">{listing.location?.city}, {listing.location?.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted hidden md:table-cell capitalize">
                      {typeLabels[listing.type] || listing.type}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 hidden md:table-cell">
                      ₹{listing.rent?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        listing.status === 'available'
                          ? 'bg-success-light text-success'
                          : 'bg-warning-light text-warning'
                      }`}>
                        {listing.status === 'available' ? 'Available' : 'Occupied'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(listing)}
                          className="p-2 text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title={listing.status === 'available' ? 'Mark as occupied' : 'Mark as available'}
                          aria-label={`Toggle status to ${listing.status === 'available' ? 'occupied' : 'available'}`}
                        >
                          {listing.status === 'available' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                        </button>
                        <Link                            to={`/listings/${listing._id}/edit`}
                          className="p-2 text-muted hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                          aria-label="Edit listing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(listing)}
                          className="p-2 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                          aria-label="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
