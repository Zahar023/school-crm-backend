import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

export const getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    successResponse(res, rows);
  } catch (err) {
    console.error("Get users error:", err);
    errorResponse(res, "Ошибка при получении преподавателей");
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { email, active } = req.body;

    if (!email || active === undefined) {
      return errorResponse(res, "Email и active обязательны", 400);
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return errorResponse(res, "Пользователь не существует", 404);
    }

    await pool.query(`UPDATE users SET active = $1 WHERE email = $2`, [
      active,
      email,
    ]);

    successResponse(res, {}, "Статус обновлен");
  } catch (err) {
    console.error("Update status error:", err);
    errorResponse(res, "Ошибка сервера");
  }
};
