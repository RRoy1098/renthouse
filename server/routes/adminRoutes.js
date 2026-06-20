import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {
  getPendingOwners,
  getApprovedOwners,
  getOwnerById,
  verifyOwner,
  rejectOwner
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin authentication
router.get('/owners/pending', adminAuth, getPendingOwners);
router.get('/owners/approved', adminAuth, getApprovedOwners);
router.get('/owners/:id', adminAuth, getOwnerById);
router.post('/owners/:id/verify', adminAuth, verifyOwner);
router.post('/owners/:id/reject', adminAuth, rejectOwner);

export default router;
