import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

export const getAllSlots = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM slots ORDER BY time_slot");
    successResponse(res, rows);
  } catch (err) {
    console.error("Get slots error:", err);
    errorResponse(res, "Ошибка при получении слотов");
  }
};
