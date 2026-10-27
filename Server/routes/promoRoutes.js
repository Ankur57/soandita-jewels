const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  getPromos,
  addPromo,
  updatePromo,
  deletePromo,
} = require("../controllers/promoController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getPromos);

// Admin
router.post("/", protect, adminOnly, upload.single("image"), addPromo);
router.put("/:id", protect, adminOnly, upload.single("image"), updatePromo);
router.delete("/:id", protect, adminOnly, deletePromo);

module.exports = router;
