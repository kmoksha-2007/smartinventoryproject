const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
  getLowStockAlerts,
  getRestockSuggestions,
  getCategories,
} = require('../controllers/productController');

// Specific endpoints first to avoid parameterized collisions
router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/restock-suggestions', getRestockSuggestions);
router.get('/categories', getCategories);

// CRUD
router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

router.post('/:id/restock', restockProduct);

module.exports = router;
