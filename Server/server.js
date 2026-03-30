const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

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

app.use(cors());
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
