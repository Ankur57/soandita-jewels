const PromoBanner = require("../models/PromoBanner");

// Get all active promotional banners (Public)
exports.getPromos = async (req, res) => {
  try {
    const promos = await PromoBanner.find({ isActive: true }).sort({ order: 1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new promotional banner (Admin)
exports.addPromo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { title, buttonText, link } = req.body;
    const imagePath = req.file.path || req.file.secure_url;

    // Set order after the last existing promo banner
    const lastPromo = await PromoBanner.findOne().sort({ order: -1 });
    const order = req.body.order !== undefined ? Number(req.body.order) : lastPromo ? lastPromo.order + 1 : 0;

    const promo = await PromoBanner.create({
      image: imagePath,
      title: title || "",
      buttonText: buttonText || "Discover Now",
      link: link || "/shop",
      order,
    });

    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a promotional banner (Admin)
exports.updatePromo = async (req, res) => {
  try {
    const promo = await PromoBanner.findById(req.params.id);

    if (!promo) {
      return res.status(404).json({ message: "Promotional banner not found" });
    }

    if (req.file) {
      promo.image = req.file.path || req.file.secure_url;
    }

    if (req.body.title !== undefined) {
      promo.title = req.body.title;
    }

    if (req.body.buttonText !== undefined) {
      promo.buttonText = req.body.buttonText;
    }

    if (req.body.link !== undefined) {
      promo.link = req.body.link;
    }

    if (req.body.order !== undefined) {
      promo.order = Number(req.body.order);
    }

    if (req.body.isActive !== undefined) {
      promo.isActive = req.body.isActive === true || req.body.isActive === "true";
    }

    await promo.save();
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a promotional banner (Admin)
exports.deletePromo = async (req, res) => {
  try {
    const promo = await PromoBanner.findByIdAndDelete(req.params.id);

    if (!promo) {
      return res.status(404).json({ message: "Promotional banner not found" });
    }

    res.json({ message: "Promotional banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
