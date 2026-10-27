const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  getSeasonTrends,
  addSeasonTrend,
  updateSeasonTrend,
  deleteSeasonTrend,
} = require("../controllers/seasonTrendController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getSeasonTrends);

// Admin
router.post("/", protect, adminOnly, upload.single("image"), addSeasonTrend);
router.put("/:id", protect, adminOnly, upload.single("image"), updateSeasonTrend);
router.delete("/:id", protect, adminOnly, deleteSeasonTrend);

module.exports = router;
