import Product from '../models/Product.js';

// @desc    Register a new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      manufacturer,
      manufacturingDate,
      expiryDate,
      quantity,
      storageLocation,
      batchNumber,
    } = req.body;

    // Validation: all fields are required
    if (
      !name ||
      !category ||
      !manufacturer ||
      !manufacturingDate ||
      !expiryDate ||
      quantity === undefined ||
      !storageLocation ||
      !batchNumber
    ) {
      return res.status(400).json({
        message:
          'All fields are required: name, category, manufacturer, manufacturingDate, expiryDate, quantity, storageLocation, batchNumber',
      });
    }

    // Validation: expiry must come AFTER manufacturing date, not before or on the same day
    // new Date(...) turns the text "2026-08-01" into a real Date
    // object so the two can be compared with < and >
    const madeOn = new Date(manufacturingDate);
    const expiresOn = new Date(expiryDate);

    if (expiresOn <= madeOn) {
      return res.status(400).json({
        message: 'Expiry date must be later than the manufacturing date',
      });
    }

    // check existing product by name, manufacturer, and batch number to prevent duplicates
    const existingProduct = await Product.findOne({
      name,
      manufacturer,
      batchNumber,
    });

    if (existingProduct) {
      return res.status(409).json({
        message: 'This product batch already exists',
      });
    }

    const product = await Product.create({
      name,
      category,
      manufacturer,
      manufacturingDate,
      expiryDate,
      quantity,
      storageLocation,
      batchNumber,
      createdBy: req.user._id, // The logged-in admin, from protect
    });

    const totalProducts = await Product.countDocuments();

    res.status(201).json({
      message: 'Product created successfully',
      totalProducts,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (optionally filtered by category)
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res, next) => {
  try {
    // Start with an empty filter, meaning "match everything"
    const filter = {};

    // If the URL looks like /api/products?category=Food and Beverages
    // then req.query.category exists, and we narrow the search
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Soonest-expiring products first, the most urgent ones on top
    const products = await Product.find(filter).sort({ expiryDate: 1 });

    res.status(200).json({
      total: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get one product by its ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // For each field: if the request included it, use the new value.
    // If not, keep what the product already had.
    product.name = req.body.name ?? product.name;
    product.category = req.body.category ?? product.category;
    product.manufacturer = req.body.manufacturer ?? product.manufacturer;
    product.manufacturingDate = req.body.manufacturingDate ?? product.manufacturingDate;
    product.expiryDate = req.body.expiryDate ?? product.expiryDate;
    product.quantity = req.body.quantity ?? product.quantity;
    product.storageLocation = req.body.storageLocation ?? product.storageLocation;
    product.batchNumber = req.body.batchNumber ?? product.batchNumber;
    // Re-check the date rule, because either date may have changed
    if (new Date(product.expiryDate) <= new Date(product.manufacturingDate)) {
      return res.status(400).json({
        message: 'Expiry date must be later than the manufacturing date',
      });
    }

    const duplicateProduct = await Product.findOne({
      name: product.name,
      manufacturer: product.manufacturer,
      batchNumber: product.batchNumber,
      _id: { $ne: product._id },
    });

    if (duplicateProduct) {
      return res.status(409).json({
        message: 'Another product with this name, manufacturer or batch number already exists',
      });
    }

    const updatedProduct = await product.save();
    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
