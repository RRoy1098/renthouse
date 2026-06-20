import Owner from "../models/Owner.js";
import Listing from "../models/Listing.js";
import { uploadImageToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

export const getOwnerProfile = async (req, res) => {
  try {
    const owner = await Owner.findById(req.owner.id);
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });
    res.status(200).json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateOwnerProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updatedData = {};
    if (name) updatedData.name = name;
    if (phone) updatedData.phone = phone;

    const owner = await Owner.findByIdAndUpdate(req.owner.id, { $set: updatedData }, { new: true });
    res.status(200).json({ success: true, message: "Profile updated", data: owner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateOwnerAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Upload an image" });
    const owner = await Owner.findById(req.owner.id);
    
    if (owner.avatar?.public_id) await deleteFromCloudinary(owner.avatar.public_id);

    const uploadResult = await uploadImageToCloudinary(req.file.buffer, "renthouse/owners/avatars");
    owner.avatar = { url: uploadResult.url, public_id: uploadResult.public_id };
    await owner.save();

    res.status(200).json({ success: true, avatar: owner.avatar });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all listings belonging to the logged-in owner
 * @route   GET /api/owner/listings
 * @access  Private (Owner Only)
 */
export const getOwnerListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.owner.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload document files" });
    }

    const owner = await Owner.findById(req.owner.id);
    const uploadedDocs = [];

    for (const file of req.files) {
      const result = await uploadImageToCloudinary(file.buffer, "renthouse/owners/documents");
      uploadedDocs.push({ url: result.url, public_id: result.public_id });
    }

    owner.documents = [...owner.documents, ...uploadedDocs];
    await owner.save();

    res.status(200).json({ success: true, message: "Documents uploaded successfully", documents: owner.documents });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};