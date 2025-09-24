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

export const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const workedHours = await calculateWorkedHours(id);
    const activeSlots = await countActiveSlots(id);
    const userName = await pool.query("SELECT name FROM users WHERE id = $1", [
      id,
    ]);
    const stats = {
      hours: workedHours,
      slots: activeSlots,
      name: userName.rows[0].name,
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error("Get status error:", err);
    errorResponse(res, "Ошибка сервера");
  }
};

async function calculateWorkedHours(teacherId) {
  return 10; // Заглушка
}

async function countActiveSlots(teacherId) {
  return 2; // Заглушка
}
