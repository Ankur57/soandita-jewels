const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const userRoutes = require("./routes/userRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");

connectDB();

const app = express();

// ── Allowed origins: read from env (comma-separated) + always allow localhost ──
const prodOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...prodOrigins,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight for all routes
app.options("*", cors());

app.use(express.json());
// Images are now served from Cloudinary CDN — no local uploads folder needed

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/shipments", shipmentRoutes);

const multer = require("multer");

const PORT = process.env.PORT || 5000;

// ── Global Error Handler (catches Multer + general errors) ──
app.use((err, req, res, next) => {
  // Multer-specific errors (file too large, wrong format, etc.)
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File is too large. Maximum allowed size is 10 MB.",
      LIMIT_FILE_COUNT: "Too many files. Maximum 5 files allowed.",
      LIMIT_UNEXPECTED_FILE: err.message || "Unsupported file type.",
    };
    return res.status(400).json({
      message: messages[err.code] || `Upload error: ${err.message}`,
    });
  }

  // CORS errors
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }

  // General errors (Cloudinary failures, network issues, etc.)
  console.error("Unhandled error:", err);
  return res.status(500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
