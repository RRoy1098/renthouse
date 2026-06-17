import express from 'express';
import { 
  registerTenant, loginTenant, 
  registerOwner, loginOwner, 
  loginAdmin 
} from '../controllers/authController.js';

const router = express.Router();

// Tenant Routes
router.post('/tenant/register', registerTenant);
router.post('/tenant/login', loginTenant);

// Owner Routes
router.post('/owner/register', registerOwner);
router.post('/owner/login', loginOwner);

// Admin Routes
router.post('/admin/login', loginAdmin);

export default router;