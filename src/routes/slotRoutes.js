import express from "express";
import { getAllSlots } from "../controllers/slotController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getAllSlots);

export default router;
