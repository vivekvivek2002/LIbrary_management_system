require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes=require("./routes/authRoutes");
const protect=require("./middleware/authMiddleware");
const authorize=require("./middleware/roleMiddleware");
//
const bookRoutes=require("./routes/bookRoutes");
const copyRoutes=require("./routes/copyRoutes");

const loanRoutes=require("./routes/loanRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);

app.use("/api/books",bookRoutes);

app.use("/api/copies",copyRoutes);

 app.use("/api/loans", loanRoutes);

// 
app.get("/", (req, res) => {
  res.json({
    message: "Library Management API is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// test protected ROutes
app.get("/api/test-protected", protect, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// test librarian only routes

app.get(
  "/api/test-librarian",
  protect,
  authorize("librarian"),
  (req, res) => {
    res.json({
      message: "Librarian access granted",
    });
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});