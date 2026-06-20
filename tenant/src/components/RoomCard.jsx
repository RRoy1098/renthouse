import { Link } from 'react-router-dom';
import { MapPin, Home, Maximize2, Star, ImageOff } from 'lucide-react';

const typeLabels = {
  single: 'Single Room',
  double: 'Double Room',
  flat: 'Flat / Apartment',
  PG: 'Paying Guest',
};

export default function RoomCard({ listing }) {
  const primaryImage = listing.images?.[0]?.url || null;
  const rating = listing.averageRating || 0;

  return (
    <Link
      to={`/rooms/${listing._id}`}
      className="group bg-white rounded-xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-surface-tertiary">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={listing.description?.slice(0, 60) || 'Room'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-muted-light" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-semibold text-muted-dark">
            {typeLabels[listing.type] || listing.type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
            listing.status === 'available'
              ? 'bg-success-light text-success'
              : 'bg-warning-light text-warning'
          }`}>
            {listing.status === 'available' ? 'Available' : 'Occupied'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {listing.description?.slice(0, 50) || 'Room'}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 text-sm shrink-0">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium text-muted-dark">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">
            {listing.location?.city}, {listing.location?.state}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted mb-3">
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{listing.sqft} sqft</span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Floor {listing.floor}/{listing.totalFloors}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 pt-3 border-t border-border">
          <span className="text-xl font-bold text-primary-600">₹{listing.rent?.toLocaleString()}</span>
          <span className="text-sm text-muted">/month</span>
        </div>

        {/* Amenities chips */}
        {listing.amenities && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(listing.amenities)
              .filter(([, val]) => val)
              .slice(0, 4)
              .map(([key]) => (
                <span key={key} className="px-2 py-0.5 bg-surface-secondary text-xs text-muted rounded-md capitalize">
                  {key}
                </span>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}
