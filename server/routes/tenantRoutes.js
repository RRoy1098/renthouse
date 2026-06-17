import express from "express";
import multer from "multer";
import tenantAuth from "../middleware/tenantAuth.js";
import {
  getTenantProfile,
  updateTenantProfile,
  updateTenantAvatar,
  updatePreferences,
  deleteTenantAccount,
  searchListings,
} from "../controllers/tenantController.js";
import { upload } from "../config/multer.js";

const router = express.Router();



// All tenant management endpoints are guarded by tenantAuth middleware
router.get("/me", tenantAuth, getTenantProfile);
router.put("/profile", tenantAuth, updateTenantProfile);
router.put("/preferences", tenantAuth, updatePreferences);
router.delete("/account", tenantAuth, deleteTenantAccount);
router.get("/search", searchListings);

// Explicitly use upload.single('avatar') for parsing your multi-part form payloads
router.patch("/avatar", tenantAuth, upload.single("avatar"), updateTenantAvatar);

export default router;