const express = require('express');
const router = express.Router();
const { recordSale, getAllSales } = require('../controllers/saleController');

router.route('/')
  .get(getAllSales)
  .post(recordSale);

module.exports = router;
