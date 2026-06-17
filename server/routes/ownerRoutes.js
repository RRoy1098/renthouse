import express from "express";
import ownerAuth from "../middleware/ownerAuth.js";
import { getOwnerProfile, updateOwnerProfile, updateOwnerAvatar, uploadDocuments } from "../controllers/ownerController.js";
import { upload } from "../config/multer.js";
const router = express.Router();


router.get("/profile", ownerAuth, getOwnerProfile);
router.put("/profile", ownerAuth, updateOwnerProfile);
router.patch("/avatar", ownerAuth, upload.single("avatar"), updateOwnerAvatar);
router.post("/documents", ownerAuth, upload.array("documents", 5), uploadDocuments);

export default router;