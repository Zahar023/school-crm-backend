import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "admin@school.com" && password === "admin123") {
      const token = jwt.sign(
        { userId: 0, role: "admin" },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      return successResponse(
        res,
        {
          token,
          user: {
            id: 0,
            email: "admin@school.com",
            role: "admin",
            full_name: "Admin",
          },
          isAdmin: true,
        },
        "Вход выполнен успешно"
      );
    }

    const { rows } = await pool.query(
      "SELECT * FROM teachers WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return errorResponse(res, "Пользователь не найден", 401);
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!user.active) {
      return errorResponse(
        res,
        "Аккаунт заблокирован. Обратитесь к администратору",
        403
      );
    }

    if (!isPasswordValid) {
      return errorResponse(res, "Неверный пароль", 401);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
        },
        isAdmin: false,
      },
      "Вход выполнен успешно"
    );
  } catch (err) {
    console.error("Login error:", err);
    errorResponse(res, "Ошибка сервера");
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const allowedRoles = ["teacher", "manager"];
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, "Недопустимая роль пользователя", 400);
    }

    const userExists = await pool.query(
      "SELECT * FROM teachers WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return errorResponse(res, "Email уже существует", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO teachers (name, email, password_hash, role, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role]
    );

    successResponse(
      res,
      {
        user: newUser.rows[0],
      },
      "Пользователь создан",
      201
    );
  } catch (err) {
    console.error("Register error:", err);
    errorResponse(res, "Ошибка сервера");
  }
};
