const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { createOrder,getMyOrders,getOrderById,getDailySales,getMonthlySales,getYearlySales,getSalesDashboard,
    getAllOrders,getAdminDashboard,updateOrderStatus,requestReturn,approveReturn,rejectReturn,processRefundAdmin,
    getAllReturnRequests
 } = require("../controllers/orderController");
const { protect,adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/admin/returns",protect,adminOnly,getAllReturnRequests);
//Analysis Routes
router.get("/admin/sales/daily", protect, adminOnly, getDailySales);
router.get("/admin/sales/monthly", protect, adminOnly, getMonthlySales);
router.get("/admin/sales/yearly", protect, adminOnly, getYearlySales);
router.get("/admin/sales/dashboard", protect, adminOnly, getSalesDashboard);
//Order Status Routes
router.get("/admin/orders", protect, adminOnly, getAllOrders);
router.get("/admin/dashboard", protect, adminOnly, getAdminDashboard);
router.put("/admin/orders/:orderId/status", protect, adminOnly, updateOrderStatus);
router.post("/:id/return",protect,upload.single("image"),requestReturn);

router.put("/admin/orders/:orderId/approve-return",protect,adminOnly,approveReturn);
router.put("/admin/orders/:orderId/reject-return",protect,adminOnly,rejectReturn);
router.put("/admin/orders/:orderId/process-refund",protect,adminOnly,processRefundAdmin);

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:orderId", protect, getOrderById);

module.exports = router;
