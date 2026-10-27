const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");
const { sendEmail } = require("../services/emailService");
const { orderConfirmationEmail } = require("../services/emailTemplates");

// Create Razorpay Order
// Verifies stock before initiating payment. Order is NOT created yet.
exports.createPaymentOrder = async (req, res) => {
  try {
    const { addressId, orderId } = req.body;

    // ── Flow 1: New Flow (addressId provided) ──
    // Order is created ONLY after payment succeeds
    if (addressId) {
      const address = await Address.findOne({
        _id: addressId,
        userId: req.user._id,
      });

      if (!address) {
        return res.status(404).json({ message: "Delivery address not found" });
      }

      const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }

      // Strict Pre-Payment Stock Verification:
      // Verify requested quantity <= available stock for every item
      for (const item of cart.items) {
        const product = item.productId;
        if (!product) {
          return res.status(400).json({
            message: "A product in your cart is no longer available",
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for "${product.name}". Available stock: ${product.stock}, requested: ${item.quantity}`,
          });
        }
      }

      // Compute total amount server-side from verified items
      const totalAmount = cart.items.reduce((sum, item) => {
        const price = item.productId.price || item.priceAtTime || 0;
        return sum + price * item.quantity;
      }, 0);

      if (totalAmount <= 0) {
        return res.status(400).json({ message: "Invalid order amount" });
      }

      const receipt = "SJ-REC-" + Date.now();
      const options = {
        amount: Math.round(totalAmount * 100), // in paise
        currency: "INR",
        receipt,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      // Save payment tracking record (orderId will be set upon successful verification)
      await Payment.create({
        userId: req.user._id,
        addressId: address._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        status: "created",
      });

      return res.json({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    // ── Flow 2: Legacy fallback (orderId provided) ──
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        userId: req.user._id,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.paymentStatus === "success") {
        return res.status(400).json({ message: "Order already paid" });
      }

      const options = {
        amount: Math.round(order.totalAmount * 100),
        currency: "INR",
        receipt: order.orderNumber,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const payment = await Payment.create({
        orderId: order._id,
        userId: req.user._id,
        addressId: order.addressSnapshot ? order.addressSnapshot._id || undefined : undefined,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        status: "created",
      });

      order.paymentId = payment._id;
      await order.save();

      return res.json({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    return res.status(400).json({ message: "addressId is required to initiate payment" });

  } catch (error) {
    console.error("createPaymentOrder error:", error);
    res.status(500).json({ message: error.message || "Failed to initiate payment" });
  }
};

// Verify Payment and create Order
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification parameters" });
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isSignatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(razorpay_signature, "utf8")
      );

    if (!isSignatureValid) {
      return res.status(400).json({ message: "Payment verification failed: Invalid signature" });
    }

    // 2. Find Payment Record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Idempotency: prevent double order creation if already processed
    if (payment.status === "success" && payment.orderId) {
      const existingOrder = await Order.findById(payment.orderId);
      if (existingOrder) {
        return res.status(200).json({
          message: "Payment verified successfully",
          order: existingOrder,
        });
      }
    }

    let finalOrder = null;

    // ── Flow 1: Order is created NOW (post-payment) ──
    if (!payment.orderId && !orderId) {
      const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const address = await Address.findById(payment.addressId);
      if (!address) {
        return res.status(404).json({ message: "Delivery address not found" });
      }

      // Check stock once again before deducting
      for (const item of cart.items) {
        const product = item.productId;
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            message: `Stock discrepancy for ${product?.name || "an item"}. Please contact support.`,
          });
        }
      }

      // Deduct stock
      for (const item of cart.items) {
        const product = item.productId;
        product.stock -= item.quantity;
        await product.save();
      }

      const generateOrderNumber = () => "SJ-" + Date.now();

      // Create Order in database with status paid / success
      finalOrder = await Order.create({
        orderNumber: generateOrderNumber(),
        userId: req.user._id,
        paymentId: payment._id,
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          name: item.productId.name,
          quantity: item.quantity,
          priceAtTime: item.productId.price || item.priceAtTime,
        })),
        subtotal: payment.amount,
        shippingCharges: 0,
        totalAmount: payment.amount,
        orderStatus: "paid",
        paymentStatus: "success",
        addressSnapshot: {
          fullName: address.fullName,
          mobileNumber: address.mobileNumber,
          addressLine1: address.addressLine1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
        },
      });

      // Update payment record
      payment.orderId = finalOrder._id;
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "success";
      await payment.save();

      // Clear the user's cart now that order is created
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    } else {
      // ── Flow 2: Legacy fallback where order was already in DB ──
      const targetOrderId = payment.orderId || orderId;
      finalOrder = await Order.findOne({
        _id: targetOrderId,
        userId: req.user._id,
      });

      if (!finalOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (payment.amount !== finalOrder.totalAmount) {
        return res.status(400).json({ message: "Amount mismatch" });
      }

      payment.orderId = finalOrder._id;
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "success";
      await payment.save();

      finalOrder.paymentStatus = "success";
      finalOrder.orderStatus = "paid";
      await finalOrder.save();
    }

    // Send confirmation email
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        const emailData = orderConfirmationEmail(user.name, finalOrder);
        await sendEmail(user.email, emailData.subject, emailData.html);
      }
    } catch (emailError) {
      console.error("Order confirmation email failed:", emailError.message);
    }

    res.status(200).json({
      message: "Payment verified successfully",
      order: finalOrder,
    });

  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
};
