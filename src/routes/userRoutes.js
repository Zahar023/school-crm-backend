import express from "express";
import {
  getAllUsers,
  updateUserStatus,
} from "../controllers/userController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getAllUsers);
router.patch(
  "/status",
  authenticateToken,
  authorizeRoles("admin"),
  updateUserStatus
);

export default router;
