import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createGroup,
    getGroups,
    addMember,
    removeMember,
    leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.post("/add-member", protectRoute, addMember);
router.post("/remove-member", protectRoute, removeMember);
router.post("/leave", protectRoute, leaveGroup);

export default router;
