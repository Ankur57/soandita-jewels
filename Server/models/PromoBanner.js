const mongoose = require("mongoose");

const promoBannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "Discover Now",
    },
    link: {
      type: String,
      default: "/shop",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoBanner", promoBannerSchema);
