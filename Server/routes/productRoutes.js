const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/get", getProducts);
router.get("/get/:id", getProductById);

// Admin Routes
router.post(
  "/add",
  protect,
  adminOnly,
  upload.array("images", 5),
  addProduct
);
router.put("/update/:id", protect, adminOnly, updateProduct);
router.delete("/delete/:id", protect, adminOnly, deleteProduct);

module.exports = router;
