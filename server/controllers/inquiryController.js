import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";

export const createInquiry = async (req, res) => {
  try {
    const { listingId, message, moveInDate } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    const inquiry = await Inquiry.create({
      listing: listingId,
      tenant: req.tenant.id,
      message,
      moveInDate
    });

    res.status(201).json({ success: true, message: "Inquiry sent to owner", data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get inquiries sent by a logged-in Tenant
export const getTenantInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ tenant: req.tenant.id }).populate("listing", "description location rent");
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get inquiries received by an Owner for their properties
export const getOwnerInquiries = async (req, res) => {
  try {
    // Find listings owned by this user
    const listings = await Listing.find({ owner: req.owner.id }).select("_id");
    const listingIds = listings.map(l => l._id);

    const inquiries = await Inquiry.find({ listing: { $in: listingIds } })
      .populate("tenant", "name email phone")
      .populate("listing", "description address city");

    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Tenant cancels their own inquiry
 * @route   PATCH /api/inquiry/:id/cancel
 * @access  Private (Tenant Only)
 */
export const cancelInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    // Ensure only the tenant who created the inquiry can cancel it
    if (inquiry.tenant.toString() !== req.tenant.id) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this inquiry" });
    }

    // Only allow cancel if status is pending or seen
    if (!['pending', 'seen'].includes(inquiry.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel an inquiry that has already been responded to" });
    }

    inquiry.status = 'cancelled';
    await inquiry.save();

    res.status(200).json({ success: true, message: "Inquiry cancelled successfully", data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Owner answers an inquiry
export const replyToInquiry = async (req, res) => {
  try {
    const { status, ownerReply } = req.body; // status can be: 'accepted', 'rejected', 'seen', 'confirmed', 'completed'
    
    const validTransitions = ['pending', 'seen', 'accepted', 'confirmed', 'rejected', 'completed'];
    if (status && !validTransitions.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const inquiry = await Inquiry.findById(req.params.id).populate("listing");
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    // Validate that the landlord updating this inquiry is the actual owner of the listing
    if (inquiry.listing.owner.toString() !== req.owner.id) {
      return res.status(403).json({ success: false, message: "Unauthorized operation" });
    }

    // Enforce valid status transitions:
    // pending/seen → accepted, rejected
    // accepted → confirmed
    // confirmed → completed
    const validFrom = {
      accepted: ['pending', 'seen'],
      rejected: ['pending', 'seen'],
      confirmed: ['accepted'],
      completed: ['confirmed'],
    };

    if (status && validFrom[status] && !validFrom[status].includes(inquiry.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${inquiry.status}' to '${status}'. Expected previous status: ${validFrom[status].join(' or ')}`
      });
    }

    inquiry.status = status || inquiry.status;
    if (ownerReply) inquiry.ownerReply = ownerReply;
    inquiry.repliedAt = Date.now();

    await inquiry.save();
    res.status(200).json({ success: true, message: "Reply submitted", data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};