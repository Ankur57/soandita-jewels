const Product = require("../models/Product");


// Add Product (Admin)
const slugify = require("slugify");

exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      stock
    } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    // Generate slug
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    // Generate SKU
    const sku = `SJ-${Date.now()}`;

    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    }

    const product = await Product.create({
      name,
      description,
      price,
      categoryId,
      stock,
      slug,
      sku,
      images: imagePaths,
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products (Public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("categoryId", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Product (Admin - Soft Delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
