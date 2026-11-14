const storageService = require('../services/storageService');

// @desc    Get all products with search & category filtering
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, stockFilter } = req.query;
    const products = await storageService.getAllProducts({ search, category, stockFilter });
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await storageService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, price, quantity, minThreshold, costPrice, supplier, description } = req.body;

    if (!name || !sku || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, category, price, and quantity are required fields.',
      });
    }

    const newProduct = await storageService.createProduct({
      name,
      sku,
      category,
      price,
      costPrice,
      quantity,
      minThreshold,
      supplier,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const updated = await storageService.updateProduct(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    await storageService.deleteProduct(req.params.id);
    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick Restock Product
// @route   POST /api/products/:id/restock
exports.restockProduct = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid restock quantity is required' });
    }

    const updated = await storageService.restockProduct(req.params.id, quantity);
    res.json({
      success: true,
      message: `Stock successfully increased by ${quantity} units`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock alerts
// @route   GET /api/products/alerts/low-stock
exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const products = await storageService.getAllProducts({ stockFilter: 'low' });
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get intelligent restock suggestions
// @route   GET /api/products/restock-suggestions
exports.getRestockSuggestions = async (req, res, next) => {
  try {
    const suggestions = await storageService.getRestockSuggestions();
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct categories
// @route   GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await storageService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
