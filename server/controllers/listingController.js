import Listing from "../models/Listing.js";
import { uploadImageToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * @desc    Create a new property listing
 * @route   POST /api/listings
 * @access  Private (Owner Only)
 */
export const createListing = async (req, res) => {
  try {
    // req.owner is attached by your ownerAuth middleware
    const {
      description, type, rent, deposit, sqft, floor, totalFloors,
      furnishing, amenities, rules, address, city, state, pincode,
      lat, lng, nearbyPlaces, locationSummary
    } = req.body;

    // 1. Handle file buffer uploads to Cloudinary if files exist
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImageToCloudinary(file.buffer, "renthouse/listings");
        imageUrls.push({
          url: uploadResult.url,
          public_id: uploadResult.public_id
        });
      }
    }

    // 2. Parse coordinates into GeoJSON format [longitude, latitude]
    const coordinates = [
      lng ? parseFloat(lng) : 0,
      lat ? parseFloat(lat) : 0
    ];

    // 3. Construct and save the listing object
    const newListing = await Listing.create({
      owner: req.owner.id,
      description,
      type,
      rent,
      deposit,
      sqft,
      floor,
      totalFloors,
      furnishing,
      amenities: typeof amenities === "string" ? JSON.parse(amenities) : amenities,
      rules: typeof rules === "string" ? JSON.parse(rules) : rules,
      location: {
        address,
        city,
        state,
        pincode,
        coordinates: {
          type: "Point",
          coordinates
        },
        nearbyPlaces: typeof nearbyPlaces === "string" ? JSON.parse(nearbyPlaces) : nearbyPlaces,
        locationSummary
      },
      images: imageUrls
    });

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: newListing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all listings with advanced filtering & geospatial search
 * @route   GET /api/listings
 * @access  Public
 */
export const getAllListings = async (req, res) => {
  try {
    const {
      city, type, furnishing, minRent, maxRent, 
      lat, lng, distanceInKm, search
    } = req.query;

    let query = { status: "available" }; // Only show available places

    // Text & exact match filters
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (type) query.type = type;
    if (furnishing) query.furnishing = furnishing;

    // Range filtering for Rent
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    // Simple keyword search across description or full address
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } }
      ];
    }

    // GEOSPATIAL SEARCH: Find listings near coordinates within an explicit radius
    if (lat && lng) {
      const radiusInMeters = (distanceInKm ? parseFloat(distanceInKm) : 5) * 1000; // default 5km
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)] // [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate("owner", "name email phone avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get a single listing by ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("owner", "name email phone avatar");
    
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update a property listing
 * @route   PUT /api/listings/:id
 * @access  Private (Owner Only)
 */
export const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Verify ownership security authorization
    if (listing.owner.toString() !== req.owner.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
    }

    const updateFields = { ...req.body };

    // Parse complex properties if sent as raw JSON strings via form-data
    if (updateFields.amenities && typeof updateFields.amenities === "string") updateFields.amenities = JSON.parse(updateFields.amenities);
    if (updateFields.rules && typeof updateFields.rules === "string") updateFields.rules = JSON.parse(updateFields.rules);

    // Handle structural layout updates for Location models if applicable
    if (req.body.address || req.body.city || req.body.lat || req.body.lng) {
      updateFields.location = {
        ...listing.location,
        address: req.body.address || listing.location.address,
        city: req.body.city || listing.location.city,
        state: req.body.state || listing.location.state,
        pincode: req.body.pincode || listing.location.pincode,
        locationSummary: req.body.locationSummary || listing.location.locationSummary,
      };

      if (req.body.lng || req.body.lat) {
        updateFields.location.coordinates = {
          type: "Point",
          coordinates: [
            req.body.lng ? parseFloat(req.body.lng) : listing.location.coordinates.coordinates[0],
            req.body.lat ? parseFloat(req.body.lat) : listing.location.coordinates.coordinates[1]
          ]
        };
      }
    }

    // Handle new images append strategy if additional files are provided
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadImageToCloudinary(file.buffer, "renthouse/listings");
        newImages.push({ url: result.url, public_id: result.public_id });
      }
      // Combine existing images with newly uploaded ones
      updateFields.images = [...listing.images, ...newImages];
    }

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Listing updated successfully", data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete a property listing and purge asset files from Cloudinary
 * @route   DELETE /api/listings/:id
 * @access  Private (Owner Only)
 */
/**
 * @desc    Update listing status (available/occupied)
 * @route   PATCH /api/listings/:id/status
 * @access  Private (Owner Only)
 */
export const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['available', 'occupied'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'available' or 'occupied'" });
    }

    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (listing.owner.toString() !== req.owner.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
    }

    listing.status = status;
    await listing.save();

    res.status(200).json({ success: true, message: `Listing marked as ${status}`, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete a specific image from a listing
 * @route   DELETE /api/listings/:id/images
 * @access  Private (Owner Only)
 */
export const deleteListingImage = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (listing.owner.toString() !== req.owner.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
    }

    const { publicId } = req.query;
    if (!publicId) {
      return res.status(400).json({ success: false, message: "publicId query parameter is required" });
    }
    const imageIndex = listing.images.findIndex(img => img.public_id === publicId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);

    // Remove from array
    listing.images.splice(imageIndex, 1);
    await listing.save();

    res.status(200).json({ success: true, message: "Image deleted successfully", data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Verify ownership security authorization
    if (listing.owner.toString() !== req.owner.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this listing" });
    }

    // Clean up asset items out of remote production spaces
    if (listing.images && listing.images.length > 0) {
      for (const img of listing.images) {
        await deleteFromCloudinary(img.public_id);
      }
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Listing and associated images successfully removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


