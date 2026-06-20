import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Grid3X3, List, Loader2, HomeIcon } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import FilterBar from '../components/FilterBar';
import NaturalSearchBar from '../components/search/NaturalSearchBar';
import { listingService } from '../api/listingService';

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');


  // Build filters from URL params
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    filters[key] = value;
  }

  const handleFilterChange = (newFilters) => {
    setSearchParams(newFilters);
  };

  // AI-matched results from navigation state (from NaturalSearchBar)
  // Clears state after consumption so subsequent filter changes fetch from server
  useEffect(() => {
    const aiResults = location.state?.aiResults;
    if (aiResults && aiResults.length > 0) {
      setListings(aiResults);
      setLoading(false);
      setError(null);
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
      return;
    }
  }, [location.state?.aiResults]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (filters.city) params.city = filters.city;
        if (filters.type) params.type = filters.type;
        if (filters.furnishing) params.furnishing = filters.furnishing;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.search) params.search = filters.search;
        if (filters.amenities) params.amenities = filters.amenities;
        if (filters.genderPreference) params.genderPreference = filters.genderPreference;

        const data = await listingService.search(params);
        setListings(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [searchParams]);

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* AI Natural Search Bar */}
      <div className="mb-6">
        <NaturalSearchBar
          onSearchResults={(filters, query, listings) => {
            const params = new URLSearchParams();
            if (filters.location) params.set('city', filters.location);
            if (filters.minPrice) params.set('minPrice', filters.minPrice);
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
            if (filters.roomType) params.set('type', filters.roomType);
            if (filters.amenities) params.set('amenities', filters.amenities.join(','));
            if (filters.search) params.set('search', filters.search);
            navigate(`/rooms?${params.toString()}`, {
              state: { aiResults: listings.length > 0 ? listings : undefined },
            });
          }}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Available Rooms</h1>
          <p className="text-muted mt-1">
            {loading ? 'Searching...' : `${listings.length} ${listings.length === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-muted hover:text-muted-dark'}`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-muted hover:text-muted-dark'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 mb-6">
          {Object.entries(filters).map(([key, value]) => (
            value && (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
              >
                {key === 'minPrice' || key === 'maxPrice' ? `₹${value}` : value}
                <button
                  onClick={() => {
                    const updated = { ...filters };
                    delete updated[key];
                    setSearchParams(updated);
                  }}
                  className="hover:text-primary-900"
                  aria-label={`Remove ${key} filter`}
                >
                  &times;
                </button>
              </span>
            )
          ))}
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-muted hover:text-muted-dark underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-light flex items-center justify-center">
            <HomeIcon className="w-8 h-8 text-danger" />
          </div>
          <p className="text-danger font-medium mb-2">Failed to load listings</p>
          <p className="text-muted text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Try again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <HomeIcon className="w-16 h-16 mx-auto mb-4 text-muted-light" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
          <p className="text-muted mb-4">Try adjusting your filters or searching in a different city.</p>
          <button
            onClick={() => setSearchParams({})}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <RoomCard key={listing._id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing._id} className="flex flex-col sm:flex-row bg-white rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="sm:w-64 h-48 sm:h-auto bg-surface-tertiary shrink-0">
                {listing.images?.[0]?.url ? (
                  <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-light">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{listing.description?.slice(0, 60)}</h3>
                  <span className="text-lg font-bold text-primary-600 shrink-0">₹{listing.rent?.toLocaleString()}/mo</span>
                </div>
                <p className="text-sm text-muted mb-3">{listing.location?.city}, {listing.location?.state}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted mb-3">
                  <span>{listing.sqft} sqft</span>
                  <span>Floor {listing.floor}/{listing.totalFloors}</span>
                  <span className="capitalize">{listing.furnishing?.replace('-', ' ')}</span>
                </div>
                <a
                  href={`/rooms/${listing._id}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View Details &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
