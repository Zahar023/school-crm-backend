import express from "express";
import pool from "./db.js";

const app = express();
app.use(express.json());

app.get("/api/slots", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM slots");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
