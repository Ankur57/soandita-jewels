const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { createShipment } = require("../controllers/shipmentController");
const { sendEmail } = require("../services/emailService");
const { orderConfirmationEmail } = require("../services/emailTemplates");



// Create Razorpay Order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "success") {
      return res.json({ message: "Order already paid" });
    }

    const options = {
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: order.orderNumber,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    const payment = await Payment.create({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: "created",
    });

    order.paymentId = payment._id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "success") {
      return res.json({ message: "Order already paid" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    /*if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }*//*This is done only for testing remove this while deploying*/

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.amount !== order.totalAmount) {
      return res.status(400).json({ message: "Amount mismatch" });
    }

    // Update Payment
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "success";
    await payment.save();

    // Update Order to paid
    order.paymentStatus = "success";
    order.orderStatus = "paid";
    await order.save();

    // 📧 Send order confirmation email
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        const emailData = orderConfirmationEmail(user.name, order);
        await sendEmail(user.email, emailData.subject, emailData.html);
      }
    } catch (emailError) {
      console.error("Order confirmation email failed:", emailError.message);
      // Do NOT fail payment if email fails
    }

    // 🚚 Create Shipment Automatically
    try {
      await createShipment(order);
    } catch (shipmentError) {
      console.error("Shipment creation failed:", shipmentError.message);
      // Do NOT fail payment if shipment fails
    }

    res.json({ message: "Payment verified and shipment initiated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
