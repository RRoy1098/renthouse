import Listing from "../models/Listing.js";
import Tenant from "../models/Tenant.js";
import { uploadImageToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * @desc    Get Current Tenant Profile (Logged in user)
 * @route   GET /api/tenant/profile
 * @access  Private (Tenant Only)
 */
export const getTenantProfile = async (req, res) => {
  try {
    // req.tenant is already populated by your tenantAuth middleware
    const tenantDoc = req.tenant;

    if (!tenantDoc) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: tenantDoc._id, // Map _id to id so it matches login response format!
        name: tenantDoc.name,
        email: tenantDoc.email,
        phone: tenantDoc.phone,
        avatar: tenantDoc.avatar,
        isVerified: tenantDoc.isVerified,
        preferences: tenantDoc.preferences
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
/**
 * @desc    Update Tenant Profile Details (Excluding Avatar & Password)
 * @route   PUT /api/tenant/profile
 * @access  Private (Tenant Only)
 */
export const updateTenantProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const tenantId = req.tenant.id

    const updatedData = {};
    if (name) updatedData.name = name;
    if (phone) updatedData.phone = phone;

    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update / Upload Tenant Avatar
 * @route   PATCH /api/tenant/avatar
 * @access  Private (Tenant Only)
 */
export const updateTenantAvatar = async (req, res) => {
  try {
    // Check if Multer populated the file buffer
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image file" });
    }

    const tenant = await Tenant.findById(req.tenant.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // 1. If the tenant already has an existing avatar, delete it from Cloudinary first
    if (tenant.avatar && tenant.avatar.public_id) {
      await deleteFromCloudinary(tenant.avatar.public_id);
    }

    // 2. Upload the new file buffer to Cloudinary (targeting 'renthouse/avatars' folder)
    const folderPath = "renthouse/tenant/avatars";
    const uploadResult = await uploadImageToCloudinary(req.file.buffer, folderPath);

    // 3. Save the secure URL and public_id to the database
    tenant.avatar = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    };

    await tenant.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      avatar: tenant.avatar,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update Tenant Rental Preferences
 * @route   PUT /api/tenant/preferences
 * @access  Private (Tenant Only)
 */
export const updatePreferences = async (req, res) => {
  try {
    const { budgetMin, budgetMax, preferredLocations, roomType } = req.body;

    const tenant = await Tenant.findById(req.tenant.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // Safely update nested preference values
    if (budgetMin !== undefined) tenant.preferences.budgetMin = budgetMin;
    if (budgetMax !== undefined) tenant.preferences.budgetMax = budgetMax;
    if (preferredLocations !== undefined) tenant.preferences.preferredLocations = preferredLocations;
    if (roomType !== undefined) tenant.preferences.roomType = roomType;

    await tenant.save();

    res.status(200).json({
      success: true,
      message: "Rental preferences updated successfully",
      preferences: tenant.preferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete Tenant Account & Clean Up Cloudinary Assets
 * @route   DELETE /api/tenant/account
 * @access  Private (Tenant Only)
 */
export const deleteTenantAccount = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenant.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // Clean up stored avatar files on Cloudinary before erasing data records
    if (tenant.avatar && tenant.avatar.public_id) {
      await deleteFromCloudinary(tenant.avatar.public_id);
    }

    await Tenant.findByIdAndDelete(req.tenant.id);

    res.status(200).json({
      success: true,
      message: "Tenant account permanently deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};





/**
 * @desc    Search and filter active property listings
 * @route   GET /api/tenant/search
 * @access  Private/Public (Adapts if tenant is logged in)
 */

export const searchListings = async (req, res) => {
  try {
    const {
      search,
      city,
      type,
      furnishing,
      minPrice,
      maxPrice,
      amenities, // Comma-separated string from frontend, e.g., "wifi,ac,parking"
      petsAllowed,
      smokingAllowed,
      genderPreference,
    } = req.query;

    // Base query: Only show accommodations that are actively available
    let query = { status: "available" };

    // 1. Keyword Text Search (Description, Address, or Summary matching)
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { "location.locationSummary": { $regex: search, $options: "i" } }
      ];
    }

    // 2. Exact City Filter
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    // 3. Room Configuration Type (single, double, flat, PG)
    if (type) {
      query.type = type;
    }

    // 4. Furnishing Status (unfurnished, semi-furnished, fully-furnished)
    if (furnishing) {
      query.furnishing = furnishing;
    }

    // 5. Explicit Price Range Filtering (Rent)
    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = Number(minPrice);
      if (maxPrice) query.rent.$lte = Number(maxPrice);
    }

    // 6. Dynamic Amenities Mapping
    if (amenities) {
      // Split the comma-separated string into an array
      const amenitiesArray = amenities.split(",");
      amenitiesArray.forEach((amenity) => {
        const trimmedAmenity = amenity.trim();
        if (trimmedAmenity) {
          // Maps target sub-documents: { "amenities.wifi": true }
          query[`amenities.${trimmedAmenity}`] = true;
        }
      });
    }

    // 7. House Rules Filters
    if (petsAllowed !== undefined) {
      query["rules.petsAllowed"] = petsAllowed === "true";
    }
    if (smokingAllowed !== undefined) {
      query["rules.smokingAllowed"] = smokingAllowed === "true";
    }
    if (genderPreference && genderPreference !== "any") {
      query["rules.genderPreference"] = genderPreference;
    }

    // Execute query (Newest listings first)
    const listings = await Listing.find(query)
      .populate("owner", "name avatar phone")

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search operation failed",
      error: error.message,
    });
  }
};