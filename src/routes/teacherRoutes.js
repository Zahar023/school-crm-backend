import express from "express";
import {
  getAllTeachers,
  updateTeacherStatus,
} from "../controllers/teacherController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getAllTeachers);
router.patch(
  "/status",
  authenticateToken,
  authorizeRoles("admin"),
  updateTeacherStatus
);

export default router;
