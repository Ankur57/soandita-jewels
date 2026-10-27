const mongoose = require("mongoose");

const seasonTrendSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
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

module.exports = mongoose.model("SeasonTrend", seasonTrendSchema);
