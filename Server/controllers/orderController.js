const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");
const { processRefund } = require("../services/refundService");
const { sendEmail } = require("../services/emailService");


// Generate order number
const generateOrderNumber = () => {
  return "SJ-" + Date.now();
};

exports.getAllReturnRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      "returnRequest.status": { $ne: "none" },
    };

    if (status) {
      filter["returnRequest.status"] = status;
    }

    const returns = await Order.find(filter)
      .populate("userId", "name email")
      .sort({ "returnRequest.requestedAt": -1 });

    res.status(200).json(returns);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDailySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { paymentStatus: "success" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    ]);

    res.status(200).json(sales);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { paymentStatus: "success" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.status(200).json(sales);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getYearlySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { paymentStatus: "success" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1 } },
    ]);

    res.status(200).json(sales);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSalesDashboard = async (req, res) => {
  try {
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "success" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      summary: totalRevenueAgg[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
      },
      statusBreakdown,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { orderStatus: status } : {};

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "success" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue =
      totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue : 0;

    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });

    const shippedOrders = await Order.countDocuments({
      orderStatus: "shipped",
    });

    res.status(200).json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processRefundAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("paymentId");

    if (!order || order.returnRequest.status !== "approved") {
      return res.status(400).json({ message: "Return not approved" });
    }

    const refund = await processRefund(
      order.paymentId.razorpayPaymentId,
      order.totalAmount
    );

    order.returnRequest.status = "refunded";
    order.returnRequest.refundedAt = new Date();
    order.orderStatus = "refunded";
    order.paymentStatus = "refunded";

    await order.save();
    await sendEmail(
      order.userId.email,
      "Refund Processed",
      `<p>Your refund for order ${order.orderNumber} has been processed.</p>`
    );


    res.status(200).json({
      message: "Refund processed",
      refund,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus !== "delivered")
      return res.status(400).json({
        message: "Return allowed only for delivered orders",
      });

    const allowedReasons = ["damaged", "defective", "wrong_item"];
    if (!allowedReasons.includes(reason))
      return res.status(400).json({
        message: "Invalid return reason",
      });

    if (!req.file)
      return res.status(400).json({
        message: "Image is required",
      });

    order.returnRequest = {
      reason,
      images: [`/uploads/${req.file.filename}`],
      requestedAt: new Date(),
      status: "requested",
    };

    order.orderStatus = "return_requested";

    await order.save();

    res.json({ message: "Return request submitted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order || order.returnRequest.status !== "requested") {
      return res.status(400).json({ message: "Invalid return request" });
    }

    order.returnRequest.status = "approved";
    order.orderStatus = "return_approved";

    await order.save();
    await sendEmail(
      order.userId.email,
      "Return Approved",
      `<p>Your return request for order ${order.orderNumber} has been approved.</p>`
    );


    res.status(200).json({ message: "Return approved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectReturn = async (req, res) => {
  try {
    const { comment } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order || order.returnRequest.status !== "requested") {
      return res.status(400).json({ message: "Invalid return request" });
    }

    order.returnRequest.status = "rejected";
    order.returnRequest.adminComment = comment;
    order.orderStatus = "return_rejected";

    await order.save();

    res.status(200).json({ message: "Return rejected" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Create Order (Checkout)
exports.createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const address = await Address.findById(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Check stock & reduce
    for (let item of cart.items) {
      const product = item.productId; // already populated

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }



    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user._id,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
      })),

      subtotal: cart.totalAmount,
      shippingCharges: 0,
      totalAmount: cart.totalAmount,
      addressSnapshot: {
        fullName: address.fullName,
        mobileNumber: address.mobileNumber,
        addressLine1: address.addressLine1,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
      },
    });

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Note: Professional confirmation email is sent after payment verification
    // in paymentController.js → verifyPayment()

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("orderNumber totalAmount orderStatus paymentStatus createdAt");

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    }).populate("paymentId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
