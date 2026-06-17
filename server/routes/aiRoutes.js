import express from 'express';
import {
  parseSearch,
  generateDesc,
  suggestRent,
  getLocSummary,
  getRecommendations
} from '../controllers/aiController.js';

import { ownerAuth } from "../middleware/ownerAuth.js"
import { adminAuth } from "../middleware/adminAuth.js"
import { tenantAuth } from "../middleware/tenantAuth.js"

const router = express.Router();

router.post('/parse-search', tenantAuth, parseSearch);
router.post('/generate-description', ownerAuth, generateDesc);
router.post('/suggest-price', ownerAuth, suggestRent);
router.post('/location-summary', ownerAuth, getLocSummary);
router.get('/recommendations', tenantAuth, getRecommendations);

export default router;
