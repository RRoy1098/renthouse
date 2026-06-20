import express from "express";
import tenantAuth from "../middleware/tenantAuth.js";
import ownerAuth from "../middleware/ownerAuth.js";
import { createInquiry, getTenantInquiries, getOwnerInquiries, replyToInquiry, cancelInquiry } from "../controllers/inquiryController.js";

const router = express.Router();

router.post("/", tenantAuth, createInquiry);
router.get("/tenant", tenantAuth, getTenantInquiries);
router.get("/owner", ownerAuth, getOwnerInquiries);
router.put("/:id/reply", ownerAuth, replyToInquiry);
router.patch("/:id/cancel", tenantAuth, cancelInquiry);

export default router;