import express from "express";
import {
  getAllUsers,
  updateUserStatus,
  getUserStats,
} from "../controllers/userController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getAllUsers);
router.get("/:id/stats", authenticateToken, getUserStats);
router.patch(
  "/status",
  authenticateToken,
  authorizeRoles("admin"),
  updateUserStatus
);

export default router;
