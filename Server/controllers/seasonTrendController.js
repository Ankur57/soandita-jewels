const SeasonTrend = require("../models/SeasonTrend");

// Get all active season trends (Public)
exports.getSeasonTrends = async (req, res) => {
  try {
    const trends = await SeasonTrend.find({ isActive: true }).sort({ order: 1 });
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new season trend (Admin)
exports.addSeasonTrend = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { label, link } = req.body;
    const imagePath = req.file.path || req.file.secure_url;

    const lastTrend = await SeasonTrend.findOne().sort({ order: -1 });
    const order = req.body.order !== undefined ? Number(req.body.order) : lastTrend ? lastTrend.order + 1 : 0;

    const trend = await SeasonTrend.create({
      image: imagePath,
      label: label || "Season Trend",
      link: link || "/shop",
      order,
    });

    res.status(201).json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a season trend (Admin)
exports.updateSeasonTrend = async (req, res) => {
  try {
    const trend = await SeasonTrend.findById(req.params.id);

    if (!trend) {
      return res.status(404).json({ message: "Season trend not found" });
    }

    if (req.file) {
      trend.image = req.file.path || req.file.secure_url;
    }

    if (req.body.label !== undefined) {
      trend.label = req.body.label;
    }

    if (req.body.link !== undefined) {
      trend.link = req.body.link;
    }

    if (req.body.order !== undefined) {
      trend.order = Number(req.body.order);
    }

    if (req.body.isActive !== undefined) {
      trend.isActive = req.body.isActive === true || req.body.isActive === "true";
    }

    await trend.save();
    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a season trend (Admin)
exports.deleteSeasonTrend = async (req, res) => {
  try {
    const trend = await SeasonTrend.findByIdAndDelete(req.params.id);

    if (!trend) {
      return res.status(404).json({ message: "Season trend not found" });
    }

    res.json({ message: "Season trend deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
