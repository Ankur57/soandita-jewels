const Category = require("../models/Category");
const slugify = require("slugify");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const slug = slugify(name, { lower: true, strict: true });

    const category = await Category.create({
      name,
      slug,
    });

    res.status(201).json(category);

  } catch (error) {
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
