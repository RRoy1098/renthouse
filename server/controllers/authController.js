import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant.js';
import Owner from '../models/Owner.js';
import dotenv from 'dotenv';
dotenv.config();

// Helper function to generate JWT
const generateToken = (id, role, dynamicPayload = {}) => {
  return jwt.sign(
    { id, role, ...dynamicPayload },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '30d' }
  );
};

// ==========================================
// ADMIN AUTH HANDLERS
// ==========================================

/**
 * @desc    Login admin (Credentials loaded from system environment)
 * @route   POST /api/auth/admin/login
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Direct string match against environment variables
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken('admin_root', 'admin', { key: process.env.ADMIN_LOGIN_KEY });

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ==========================================
// TENANT AUTH HANDLERS
// ==========================================

/**
 * @desc    Register a new tenant
 * @route   POST /api/auth/tenant/register
 */
export const registerTenant = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const tenantExists = await Tenant.findOne({ email });
    if (tenantExists) {
      return res.status(400).json({ message: 'Tenant already exists with this email' });
    }

    const tenant = await Tenant.create({ name, email, password, phone });

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      token: generateToken(tenant._id, 'tenant'),
      data: {
        id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Login tenant
 * @route   POST /api/auth/tenant/login
 */
export const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Explicitly select password since it's set to select: false in schema
    const tenant = await Tenant.findOne({ email }).select('+password');
    
    if (!tenant || !(await tenant.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(tenant._id, 'tenant'),
      data: {
        id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        isVerified: tenant.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// ==========================================
// OWNER AUTH HANDLERS
// ==========================================

/**
 * @desc    Register a new owner (no password required, status = pending)
 * @route   POST /api/auth/owner/register
 */
export const registerOwner = async (req, res) => {
  try {
    const { name, email, phone, businessName } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Please enter all required fields (name, email, phone)' });
    }

    const ownerExists = await Owner.findOne({ email });
    if (ownerExists) {
      return res.status(400).json({ message: 'Owner already exists with this email' });
    }

    const owner = await Owner.create({ name, email, phone, businessName, status: 'pending' });

    res.status(201).json({
      success: true,
      message: 'Owner registered successfully. Your account is pending admin verification. You will receive an email with login credentials once approved.',
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
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Login owner (only allowed if status is 'approved')
 * @route   POST /api/auth/owner/login
 */
export const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const owner = await Owner.findOne({ email }).select('+password');

    if (!owner) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (owner.status !== 'approved') {
      return res.status(403).json({
        message: owner.status === 'pending'
          ? 'Your account is pending admin verification. You will receive an email once approved.'
          : 'Your account has been rejected. Please contact support.'
      });
    }

    if (!(await owner.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(owner._id, 'owner'),
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        status: owner.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
