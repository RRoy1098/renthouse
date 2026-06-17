import Review from "../models/Review.js";
import Listing from "../models/Listing.js";

export const createReview = async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    // Ensure they don't review twice because of our schema tracking index
    const alreadyReviewed = await Review.findOne({ listing: listingId, tenant: req.tenant.id });
    if (alreadyReviewed) return res.status(400).json({ success: false, message: "You already reviewed this place" });

    const review = await Review.create({
      tenant: req.tenant.id,
      listing: listingId,
      rating,
      comment
    });

    res.status(201).json({ success: true, message: "Review added successfully", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId }).populate("tenant", "name avatar");
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};