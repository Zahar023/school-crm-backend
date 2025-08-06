import express from "express";
import cors from "cors";
import pool from "./db.js";

const jwt = require("jsonwebtoken");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.post("api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
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

    //const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    const user = rows[0];
    if (password != user.password_hash) {
      return res.status(401).json({
        success: false,
        error: "Неверный пароль",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "your-secret-key",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Ошибка сервера",
    });
  }
});

router.get("/users", authenticateAdmin, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, role, full_name, is_active FROM users"
  );
  res.json(rows);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//
