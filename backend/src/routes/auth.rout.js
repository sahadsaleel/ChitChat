import express from "express";
import { checkAuth, login, logout, signup, updateProfile, enable2FA, verify2FA, disable2FA, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


router.put("/update-profile", protectRoute, upload.single("profilePic"), updateProfile);

router.get("/check", protectRoute, checkAuth);

// 2FA Routes
router.post("/enable-2fa", protectRoute, enable2FA);
router.post("/verify-2fa", protectRoute, verify2FA);
router.post("/disable-2fa", protectRoute, disable2FA);

// Password Recovery Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
