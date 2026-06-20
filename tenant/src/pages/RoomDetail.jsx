import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Maximize2, Home, Star, Wifi, Zap, Car,
  Droplets, Shield, ChevronUp, Users, Dog, Cigarette,
  Calendar, Loader2, ArrowLeft, Building2, Phone, Mail,
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import BookingStatusBadge from '../components/BookingStatusBadge';
import AiMessageDraft from '../components/rooms/AiMessageDraft';
import { useAuth } from '../context/AuthContext';
import { listingService, reviewService } from '../api/listingService';
import { inquiryService } from '../api/inquiryService';
import AiChatWidget from '../components/ai/AiChatWidget';

const amenityIcons = {
  wifi: Wifi,
  ac: Zap,
  parking: Car,
  water: Droplets,
  electricity: Zap,
  security: Shield,
  lift: ChevronUp,
  gym: Users,
};

const furnishingLabels = {
  unfurnished: 'Unfurnished',
  'semi-furnished': 'Semi-Furnished',
  'fully-furnished': 'Fully Furnished',
};

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          listingService.getById(id),
          reviewService.getListingReviews(id),
        ]);
        setListing(listingRes.data);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: `/rooms/${id}` } });
      return;
    }
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await inquiryService.create({
        listingId: id,
        message: inquiryMsg,
        moveInDate,
      });
      navigate('/booking/confirmation', {
        state: {
          booking: {
            _id: res.data?._id,
            listingDescription: listing.description,
            moveInDate,
          },
        },
      });
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-light" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Listing not found</h2>
        <p className="text-muted mb-6">{error || 'The property you\'re looking for doesn\'t exist.'}</p>
        <Link to="/rooms" className="text-primary-600 hover:text-primary-700 font-medium">
          &larr; Back to listings
        </Link>
      </div>
    );
  }

  const loc = listing.location || {};
  const amenities = listing.amenities || {};

  return (
   <>
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link to="/rooms" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <ImageGallery images={listing.images} alt={listing.description} />

          {/* Title & basics */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                {listing.type === 'PG' ? 'Paying Guest' : listing.type}
              </span>
              <BookingStatusBadge status={listing.status === 'available' ? 'confirmed' : 'pending'} />
              {listing.averageRating > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="font-medium text-muted-dark">{listing.averageRating.toFixed(1)}</span>
                  <span className="text-muted">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {listing.description?.slice(0, 100)}
            </h1>
            <div className="flex items-center gap-1.5 text-muted">
              <MapPin className="w-4 h-4" />
              <span>{loc.address}, {loc.city}, {loc.state} - {loc.pincode}</span>
            </div>
          </div>

          {/* Key details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Maximize2, label: 'Area', value: `${listing.sqft} sqft` },
              { icon: Home, label: 'Floor', value: `${listing.floor}/${listing.totalFloors}` },
              { icon: Building2, label: 'Furnishing', value: furnishingLabels[listing.furnishing] || listing.furnishing },
              { icon: Shield, label: 'Deposit', value: `₹${listing.deposit?.toLocaleString()}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-surface-secondary border border-border">
                <item.icon className="w-5 h-5 text-primary-600 shrink-0" />
                <div>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-muted leading-relaxed">{listing.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(amenities).map(([key, val]) => {
                const Icon = amenityIcons[key] || Building2;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                      val ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-surface-secondary border-border text-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium capitalize">{key}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rules */}
          {listing.rules && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">House Rules</h2>
              <div className="flex flex-wrap gap-3">
                {listing.rules.petsAllowed !== undefined && (
                  <span className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                    listing.rules.petsAllowed ? 'bg-success-light text-success border-success/20' : 'bg-surface-secondary text-muted border-border'
                  }`}>
                    <Dog className="w-4 h-4" />
                    Pets {listing.rules.petsAllowed ? 'Allowed' : 'Not Allowed'}
                  </span>
                )}
                {listing.rules.smokingAllowed !== undefined && (
                  <span className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                    listing.rules.smokingAllowed ? 'bg-warning-light text-warning border-warning/20' : 'bg-surface-secondary text-muted border-border'
                  }`}>
                    <Cigarette className="w-4 h-4" />
                    Smoking {listing.rules.smokingAllowed ? 'Allowed' : 'Not Allowed'}
                  </span>
                )}
                {listing.rules.genderPreference && (
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border bg-surface-secondary text-muted border-border capitalize">
                    <Users className="w-4 h-4" />
                    {listing.rules.genderPreference === 'any' ? 'All Genders' : `${listing.rules.genderPreference} Only`}
                  </span>
                )}
              </div>
              {listing.rules.otherRules?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {listing.rules.otherRules.map((rule, i) => (
                    <li key={i} className="text-sm text-muted flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-light" />
                      {rule}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-muted text-sm">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
                        {review.tenant?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.tenant?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-warning text-warning' : 'text-border-dark'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: Booking panel (sticky) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Price card */}
            <div className="bg-white rounded-xl border border-border p-6 shadow-card">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{listing.rent?.toLocaleString()}</span>
                <span className="text-muted">/month</span>
              </div>

              {/* Owner info */}
              {listing.owner && (
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center font-semibold">
                    {listing.owner.name?.charAt(0)?.toUpperCase() || 'O'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{listing.owner.name}</p>
                    <p className="text-xs text-muted">Property Owner</p>
                  </div>
                </div>
              )}

              {submitStatus === 'success' ? (
                <div className="bg-success-light border border-success/30 rounded-lg p-4 text-center">
                  <p className="text-success font-semibold mb-1">Inquiry Sent!</p>
                  <p className="text-sm text-muted">The owner will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleBookNow} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-dark mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Move-in Date
                    </label>
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-muted-dark">Message</label>
                      <AiMessageDraft
                        listing={listing}
                        onUseDraft={(draft) => setInquiryMsg(draft)}
                      />
                    </div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell the owner about yourself..."
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isAuthenticated ? (
                      'Send Inquiry'
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Sign In to Book
                      </>
                    )}
                  </button>
                  {submitStatus === 'error' && (
                    <p className="text-danger text-sm text-center">Something went wrong. Please try again.</p>
                  )}
                </form>
              )}

              <p className="text-xs text-muted mt-4 text-center">
                You won't be charged yet. The owner will respond to your inquiry.
              </p>
            </div>

            {/* Location card */}
            {loc.coordinates?.coordinates && loc.coordinates.coordinates[0] !== 0 && (
              <div className="bg-white rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="aspect-video bg-surface-tertiary rounded-lg flex items-center justify-center text-muted text-sm">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{loc.city}, {loc.state}</p>
                    <p className="text-xs">{loc.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact card */}
            {listing.owner && (
              <div className="bg-white rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Owner</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted">
                    <Phone className="w-4 h-4" />
                    <span>{listing.owner.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Mail className="w-4 h-4" />
                    <span>{listing.owner.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <AiChatWidget listingId = {id}/>

   </>
  );
}
