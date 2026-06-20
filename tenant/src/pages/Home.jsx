import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Shield, Sparkles, HomeIcon, BadgeCheck, Building2, Star, ArrowRight } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import NaturalSearchBar from '../components/search/NaturalSearchBar';
import { listingService } from '../api/listingService';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await listingService.getAll();
        setFeatured((data.data || []).slice(0, 6));
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Your Perfect<br />
              <span className="text-primary-200">Rental Home</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-xl">
              Discover thousands of verified rental properties. AI-powered matching to find the home that's right for you.
            </p>

            {/* AI Natural Language Search */}
            <NaturalSearchBar
              onSearchResults={(filters, query, listings) => {
                const params = new URLSearchParams();
                if (filters.location) params.set('city', filters.location);
                if (filters.minPrice) params.set('minPrice', filters.minPrice);
                if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
                if (filters.roomType) params.set('type', filters.roomType);
                if (filters.amenities) params.set('amenities', filters.amenities.join(','));
                if (filters.search) params.set('search', filters.search);
                // Pass AI-matched listings through navigation state
                navigate(`/rooms?${params.toString()}`, {
                  state: { aiResults: listings.length > 0 ? listings : undefined },
                });
              }}
            />

            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-primary-200">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                <span>Verified listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">Find your ideal rental in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ icon: Search, title: 'Search', desc: 'Browse thousands of listings with smart filters for location, price, amenities, and more.', color: 'bg-primary-100 text-primary-600' },{ icon: HomeIcon, title: 'Visit & Compare', desc: 'View detailed photos, read reviews, and compare properties side by side.', color: 'bg-accent-100 text-accent-600' },
              {
                icon: Building2,
                title: 'Book & Move In',
                desc: 'Send an inquiry to the owner, get confirmed, and move into your new home.',
                color: 'bg-success/10 text-success',
              },
            ].map((step, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-surface-secondary border border-border hover:shadow-card-hover transition-shadow">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 md:py-20 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Listings</h2>
              <p className="text-muted">Hand-picked properties for you</p>
            </div>
            <Link to="/rooms" className="hidden sm:flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
                  <div className="h-48 bg-surface-tertiary" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-surface-tertiary rounded w-3/4" />
                    <div className="h-4 bg-surface-tertiary rounded w-1/2" />
                    <div className="h-8 bg-surface-tertiary rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing) => (
                <RoomCard key={listing._id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted">
              <HomeIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No listings available yet. Check back soon!</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/rooms" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
              View All Listings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose RentHouse?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure Platform', desc: 'End-to-end encrypted communication' },
              { icon: BadgeCheck, title: 'Verified Owners', desc: 'All property owners are verified' },
              { icon: Star, title: 'Real Reviews', desc: 'Genuine tenant reviews and ratings' },
              { icon: Sparkles, title: 'AI Matching', desc: 'Smart recommendations based on preferences' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-xl border border-border hover:shadow-card transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your New Home?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of happy tenants who found their perfect rental on RentHouse.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/rooms"
              className="bg-white text-primary-700 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              Browse Listings
            </Link>
            <Link
              to="/sign-up"
              className="border-2 border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
