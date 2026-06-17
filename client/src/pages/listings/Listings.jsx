import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../../api/listing.js';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const res = await getListings({});
        setListings(res.data || []);
      } catch (err) {
        console.error('Failed to load listings', err);
        setError('Unable to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-border bg-surface/90 p-8 shadow-soft">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">Discover properties</p>
            <h1 className="mt-3 text-3xl font-semibold text-primary">Available rentals near you</h1>
          </div>
          <button className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
            Refine search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-soft text-center text-muted">Loading listings…</div>
      ) : error ? (
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div>
      ) : listings.length === 0 ? (
        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-soft text-center text-muted">No listings found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <article key={listing._id} className="rounded-[32px] border border-border bg-surface p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 h-52 overflow-hidden rounded-3xl bg-primary/5">
                <img src={listing.images?.[0]?.url || '/src/assets/images/1.jpg'} alt={listing.description} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{listing.type?.toUpperCase()}</span>
                  <span>₹ {listing.rent?.toLocaleString()}/mo</span>
                </div>
                <h2 className="text-xl font-semibold text-primary">{listing.location?.address || 'Stylish rental'}</h2>
                <p className="text-sm leading-7 text-muted">{listing.location?.locationSummary || listing.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {listing.amenities?.wifi && <span className="rounded-full border border-border px-3 py-1">WiFi</span>}
                  {listing.amenities?.ac && <span className="rounded-full border border-border px-3 py-1">AC</span>}
                  {listing.amenities?.parking && <span className="rounded-full border border-border px-3 py-1">Parking</span>}
                </div>
                <Link to={`/listing/${listing._id}`} className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-soft hover:text-text">
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Listings;
