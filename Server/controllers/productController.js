const Product = require("../models/Product");
const Category = require("../models/Category");
const redis = require("../config/redis");


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
    res.status(500).json({ message: error.message });
  }
};

// Get All Products (Public)
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const cacheKey = `products:${page}:${limit}:${search}`;
    const cacheData = await redis.get(cacheKey);
    //Here we got data in redis cache and we then send this data cacheData
    if (cacheData) {
      console.log("Redis Cache Hit");
      return res.json(cacheData);
    }

    console.log("Redis Cache Miss");
    const skip = (page - 1) * limit;

    // Build search conditions
    const orConditions = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];

    if (!isNaN(search) && search !== "") {
      orConditions.push({ price: Number(search) });
    }

    // Also match by category name
    if (search) {
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: "i" },
        isActive: true,
      }).select("_id");

      if (matchingCategories.length > 0) {
        const categoryIds = matchingCategories.map((c) => c._id);
        orConditions.push({ categoryId: { $in: categoryIds } });
      }
    }

    const query = {
      $and: [
        { isActive: true },
        { $or: orConditions },
      ],
    };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("categoryId", "name")
      .skip(skip)
      .limit(limit);
    
    const response = {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
    await redis.set(cacheKey, response, { ex: 60 });
    res.json(response);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    const cached = await redis.get(cacheKey);
    if(cached){
      console.log("Redis Cache Hit");
      return res.json(cached);
    }
    console.log("Redis Cache Miss");
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await redis.set(cacheKey, product, { ex: 120 });

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
    await redis.del(`product:${req.params.id}`);

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
    await redis.del(`product:${req.params.id}`);
    res.json({ message: "Product deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
