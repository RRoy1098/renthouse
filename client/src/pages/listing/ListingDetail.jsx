import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getListingById } from '../../api/listing.js';

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        const res = await getListingById(id);
        setListing(res.data || res);
      } catch (err) {
        console.error('Failed to load listing', err);
        setError('Unable to load listing details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadListing();
    }
  }, [id]);

  if (loading) {
    return <div className="rounded-[32px] border border-border bg-surface p-8 shadow-soft text-center text-muted">Loading listing details…</div>;
  }

  if (error) {
    return <div className="rounded-[32px] border border-border bg-red-50 p-8 text-center text-red-700">{error}</div>;
  }

  if (!listing) {
    return <div className="rounded-[32px] border border-border bg-surface p-8 text-center text-muted">Listing not found.</div>;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-border bg-surface p-8 shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 rounded-3xl bg-primary/5 p-4 sm:grid-cols-2">
              {(listing.images?.length ? listing.images : [{ url: '/src/assets/images/1.jpg' }]).slice(0, 4).map((img, index) => (
                <img key={index} src={img.url} alt={`House ${index + 1}`} className="h-40 w-full rounded-3xl object-cover" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{listing.type?.toUpperCase()}</span>
                <span>{listing.status === 'occupied' ? 'Occupied' : 'Available now'}</span>
              </div>
              <h1 className="text-3xl font-semibold text-primary">{listing.location?.address || 'Rental property'}</h1>
              <p className="max-w-2xl text-sm leading-7 text-muted">{listing.location?.locationSummary || listing.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-background p-6">
                <p className="text-sm text-muted">Monthly rent</p>
                <p className="mt-2 text-3xl font-semibold text-primary">₹ {listing.rent?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="rounded-3xl border border-border bg-background p-6">
                <p className="text-sm text-muted">Deposit</p>
                <p className="mt-2 text-3xl font-semibold text-primary">₹ {listing.deposit?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>
          <aside className="space-y-6 rounded-[32px] border border-border bg-surface p-6 shadow-soft">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-primary">Contact owner</h2>
              <p className="text-sm leading-7 text-muted">Send an inquiry directly to the owner for a fast response.</p>
            </div>
            <div className="rounded-3xl bg-background p-5 text-sm text-muted">
              <p><strong>Owner</strong></p>
              <p className="mt-2">{listing.owner?.name || 'Owner'}</p>
              <p className="mt-1">{listing.owner?.phone || 'Phone not available'}</p>
            </div>
            <button className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
              Send inquiry
            </button>
          </aside>
        </div>
      </div>
      <div className="rounded-[32px] border border-border bg-surface p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-primary">Property details</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            { label: 'Furnishing', value: listing.furnishing?.replace(/-/g, ' ') || 'N/A' },
            { label: 'Floor', value: `${listing.floor || 'N/A'} / ${listing.totalFloors || 'N/A'}` },
            { label: 'Area', value: `${listing.sqft || 'N/A'} sqft` },
            { label: 'Parking', value: listing.amenities?.parking ? 'Yes' : 'No' },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-border bg-background p-5">
              <p className="text-sm text-muted">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-primary">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListingDetail;
