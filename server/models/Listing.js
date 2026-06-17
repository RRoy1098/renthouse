import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
      index: true // Faster queries when finding listings by a specific owner
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true
    },
    type: {
      type: String,
      enum: ['single', 'double', 'flat', 'PG'],
      required: [true, 'Please specify listing type']
    },
    rent: {
      type: Number,
      required: [true, 'Please specify rent amount'],
      min: [0, 'Rent cannot be negative']
    },
    deposit: {
      type: Number,
      required: [true, 'Please specify security deposit'],
      min: [0, 'Deposit cannot be negative']
    },
    sqft: {
      type: Number,
      required: [true, 'Please specify square footage'],
      min: [1, 'Square footage must be greater than 0']
    },
    floor: {
      type: Number,
      required: [true, 'Please specify floor number']
    },
    totalFloors: {
      type: Number,
      required: [true, 'Please specify total floors in building']
    },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      required: [true, 'Please specify furnishing status']
    },
    amenities: {
      wifi: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      water: { type: Boolean, default: false },
      electricity: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
      lift: { type: Boolean, default: false },
      gym: { type: Boolean, default: false }
    },
    rules: {
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      genderPreference: {
        type: String,
        enum: ['any', 'male', 'female'],
        default: 'any'
      },
      otherRules: [{ type: String, trim: true }]
    },
    location: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true, index: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      // Proper GeoJSON implementation for radius location tracking
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
      },
      nearbyPlaces: [{ type: String, trim: true }],
      locationSummary: { type: String, default: '', trim: true }
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true } // Standardized to underscore
      }
    ],
    status: {
      type: String,
      enum: ['available', 'occupied'],
      default: 'available',
      index: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      set: val => Math.round(val * 10) / 10 // Rounds to 1 decimal place (e.g., 4.3)
    },
  },
  { timestamps: true }
);

// Creating a 2dsphere index for location distance queries
ListingSchema.index({ "location.coordinates": "2dsphere" });

const Listing = mongoose.model('Listing', ListingSchema);
export default Listing;