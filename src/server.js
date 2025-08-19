import express from "express";
import cors from "cors";
import pool from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/slots", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM slots");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/teachers", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM teachers");
    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "admin@school.com" && password === "admin123") {
      const token = jwt.sign(
        { userId: 0, role: "admin" },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: 0,
          email: "admin@example.com",
          role: "admin",
          full_name: "Admin",
        },
        isAdmin: true,
      });
    }

    const { rows } = await pool.query(
      "SELECT * FROM teachers WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Пользователь не найден",
      });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Неверный пароль",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      isAdmin: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Ошибка сервера",
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const allowedRoles = ["teacher", "manager"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Недопустимая роль пользователя",
      });
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "email уже существует",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO teachers (name, email, password_hash, role, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, email, role`,
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      user: {
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
    });
  }
});

app.patch("/api/teachers/status", async (req, res) => {
  try {
    const { email, active } = req.body;

    if (!email || active === undefined) {
      return res.status(400).json({
        success: false,
        message: "Email и active обязательны",
      });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "email пользователя не существует",
      });
    }

    const newUser = await pool.query(
      `UPDATE teachers 
        SET active = $1 
        WHERE email = $2`,
      [active, email]
    );

    res.status(201).json({
      success: true,
      message: "Статус обновлен",
    });
  } catch {}
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
