const storageService = require('../services/storageService');

// @desc    Record a new sale & reduce stock
// @route   POST /api/sales
exports.recordSale = async (req, res, next) => {
  try {
    const { items, customerName, paymentMethod, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product item is required to record a sale.',
      });
    }

    const sale = await storageService.recordSale({
      items,
      customerName,
      paymentMethod,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully and inventory stock updated.',
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales history
// @route   GET /api/sales
exports.getAllSales = async (req, res, next) => {
  try {
    const sales = await storageService.getAllSales();
    res.json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};
