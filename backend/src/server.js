const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");
const authRoutes = require("./routes/auth");
const interviewRoutes = require("./routes/interviewRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "AI Career Development Platform API is running!",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});