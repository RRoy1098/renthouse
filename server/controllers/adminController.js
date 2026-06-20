import Owner from '../models/Owner.js';
import { sendPasswordEmail } from '../config/email.js';
import crypto from 'crypto';

/**
 * @desc    Get all pending owner registrations
 * @route   GET /api/admin/owners/pending
 * @access  Private (Admin Only)
 */
export const getPendingOwners = async (req, res) => {
  try {
    const pendingOwners = await Owner.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingOwners.length,
      data: pendingOwners
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get all approved owners
 * @route   GET /api/admin/owners/approved
 * @access  Private (Admin Only)
 */
export const getApprovedOwners = async (req, res) => {
  try {
    const approvedOwners = await Owner.find({ status: 'approved' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: approvedOwners.length,
      data: approvedOwners
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Verify/approve an owner, generate password, send email
 * @route   POST /api/admin/owners/:id/verify
 * @access  Private (Admin Only)
 */
export const verifyOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const owner = await Owner.findById(id).select('+password');
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    if (owner.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Owner is already ' + owner.status
      });
    }

    // Generate a random password (12 chars, alphanumeric + special)
    const generatedPassword = Math.floor(100000 + Math.random()*99999)

    // Set password and update status
    owner.password = generatedPassword;
    owner.status = 'approved';
    if (adminNotes) owner.adminNotes = adminNotes;
    await owner.save();

    // Send password email
    try {
      await sendPasswordEmail({
        to: owner.email,
        name: owner.name,
        password: generatedPassword,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      // Still return success for the approval, but note the email failure
      return res.status(200).json({
        success: true,
        message: 'Owner approved but email notification failed. Please check your Brevo configuration.',
        data: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          status: owner.status,
          generatedPassword,
          emailFailed: true
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Owner approved successfully. Password has been sent to ' + owner.email,
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        businessName: owner.businessName,
        status: owner.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Reject an owner registration
 * @route   POST /api/admin/owners/:id/reject
 * @access  Private (Admin Only)
 */
export const rejectOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const owner = await Owner.findById(id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    owner.status = 'rejected';
    if (adminNotes) owner.adminNotes = adminNotes;
    await owner.save();

    res.status(200).json({
      success: true,
      message: 'Owner registration rejected.',
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        status: owner.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get owner details by ID (for admin review)
 * @route   GET /api/admin/owners/:id
 * @access  Private (Admin Only)
 */
export const getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).select('-password');
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    res.status(200).json({
      success: true,
      data: owner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
