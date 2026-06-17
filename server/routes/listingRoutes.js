import express from "express";
import ownerAuth from "../middleware/ownerAuth.js";
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { upload } from "../config/multer.js";

const router = express.Router();


// Public discovery endpoints
router.get("/", getAllListings);
router.get("/:id", getListingById);

// Owner-protected management routes
router.post("/", ownerAuth, upload.array("images", 10), createListing);
router.put("/:id", ownerAuth, upload.array("images", 10), updateListing);
router.delete("/:id", ownerAuth, deleteListing);

export default router;