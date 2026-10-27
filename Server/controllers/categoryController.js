const Category = require("../models/Category");
const slugify = require("slugify");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName, { lower: true, strict: true });

    // Check if category already exists with similar name or slug
    const existing = await Category.findOne({
      $or: [
        { slug },
        { name: { $regex: new RegExp(`^${trimmedName}$`, "i") } },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "A category with this name already exists" });
    }

    const categoryData = { name: trimmedName, slug };

    // If an image was uploaded via Cloudinary multer storage, save its URL
    if (req.file) {
      categoryData.image = req.file.path || req.file.secure_url;
    }

    const category = await Category.create(categoryData);

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A category with this name already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a category (Admin) — can update name and/or image
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (req.body.name && req.body.name.trim()) {
      const trimmedName = req.body.name.trim();
      const slug = slugify(trimmedName, { lower: true, strict: true });

      const existing = await Category.findOne({
        _id: { $ne: req.params.id },
        $or: [
          { slug },
          { name: { $regex: new RegExp(`^${trimmedName}$`, "i") } },
        ],
      });

      if (existing) {
        return res.status(400).json({ message: "A category with this name already exists" });
      }

      category.name = trimmedName;
      category.slug = slug;
    }

    if (req.file) {
      category.image = req.file.path || req.file.secure_url;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A category with this name already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete a category (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
