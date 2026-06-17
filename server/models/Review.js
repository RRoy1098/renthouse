import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// Prevent a single user from leaving multiple reviews on the exact same property listing
ReviewSchema.index({ listing: 1, tenant: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.getAverageRating = async function (listingId) {
  const obj = await this.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: '$listing',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Listing').findByIdAndUpdate(listingId, {
        averageRating: obj[0].averageRating
      });
    } else {
      await mongoose.model('Listing').findByIdAndUpdate(listingId, {
        averageRating: 0
      });
    }
  } catch (err) {
    console.error('Error auto-updating average rating:', err);
  }
};

// Calculate average rating after a new review is saved
ReviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.listing);
});

// Calculate average rating before a review is removed
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.getAverageRating(this.listing);
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;