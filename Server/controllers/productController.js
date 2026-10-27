const Product = require("../models/Product");
const Category = require("../models/Category");
const redis = require("../config/redis");
const mongoose = require("mongoose");


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

    if (price === undefined || Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be less than 0",
      });
    }

    // Generate unique slug (append short suffix to allow duplicate names)
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
    });
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    // Generate SKU
    const sku = `SJ-${Date.now()}`;

    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(
        (file) => file.path
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
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get All Products (Public)
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search ? req.query.search.trim() : "";
    const category = req.query.category || req.query.categoryId || "";
    const minPrice = req.query.minPrice !== undefined && req.query.minPrice !== "" ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice !== undefined && req.query.maxPrice !== "" ? Number(req.query.maxPrice) : null;
    const availability = req.query.availability || "";
    const sortBy = req.query.sortBy || req.query.sort || "newest";

    const skip = (page - 1) * limit;

    const andConditions = [{ isActive: true }];

    // 1. Search conditions
    if (search) {
      const orConditions = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];

      if (!isNaN(search)) {
        orConditions.push({ price: Number(search) });
      }

      // Also match by category name
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: "i" },
        isActive: true,
      }).select("_id");

      if (matchingCategories.length > 0) {
        const categoryIds = matchingCategories.map((c) => c._id);
        orConditions.push({ categoryId: { $in: categoryIds } });
      }

      andConditions.push({ $or: orConditions });
    }

    // 2. Category filter
    if (category && category !== "all") {
      if (mongoose.Types.ObjectId.isValid(category)) {
        andConditions.push({ categoryId: category });
      } else {
        const foundCategory = await Category.findOne({
          $or: [{ slug: category }, { name: category }],
          isActive: true,
        });
        if (foundCategory) {
          andConditions.push({ categoryId: foundCategory._id });
        } else {
          andConditions.push({ categoryId: null });
        }
      }
    }

    // 3. Price Range filter
    const priceFilter = {};
    if (minPrice !== null && !isNaN(minPrice)) {
      priceFilter.$gte = minPrice;
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      priceFilter.$lte = maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      andConditions.push({ price: priceFilter });
    }

    // 4. Availability filter
    if (availability === "inStock") {
      andConditions.push({ stock: { $gt: 0 } });
    } else if (availability === "outOfStock") {
      andConditions.push({ stock: 0 });
    }

    // 5. Sorting
    let sortObj = { createdAt: -1 };
    switch (sortBy) {
      case "priceLow":
        sortObj = { price: 1 };
        break;
      case "priceHigh":
        sortObj = { price: -1 };
        break;
      case "nameAZ":
        sortObj = { name: 1 };
        break;
      case "nameZA":
        sortObj = { name: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("categoryId", "name")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const response = {
      products,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      totalProducts: total,
    };
    res.json(response);

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
    const { name, description, price, categoryId, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be less than 0",
      });
    }

    // Update basic fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.categoryId = categoryId || product.categoryId;
    product.stock = stock || product.stock;

    // Handle images: merge kept existing images with newly uploaded ones
    let updatedImages = [];

    // Parse existing images the admin chose to keep
    if (req.body.existingImages) {
      try {
        updatedImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        updatedImages = [];
      }
    } else {
      // If existingImages wasn't sent, keep all current images
      updatedImages = product.images || [];
    }

    // Append newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(
        (file) => file.path
      );
      updatedImages = [...updatedImages, ...newImagePaths];
    }

    product.images = updatedImages;

    await product.save();

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
