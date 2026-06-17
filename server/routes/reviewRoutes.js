import express from "express";
import tenantAuth from "../middleware/tenantAuth.js";
import { createReview, getListingReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", tenantAuth, createReview);
router.get("/listing/:listingId", getListingReviews);

export default router;