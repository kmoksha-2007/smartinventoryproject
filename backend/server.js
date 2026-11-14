const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const { connectDB, getStatus } = require('./config/db');
const storageService = require('./services/storageService');
const errorHandler = require('./middleware/errorHandler');

// Route files
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Smart Inventory Management Backend',
    timestamp: new Date().toISOString(),
    database: getStatus(),
  });
});

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database & Start Server
const startServer = async () => {
  console.log('🚀 Starting Smart Inventory System Backend...');
  
  // Connect to DB (Mongoose with auto fallback)
  await connectDB();
  
  // Seed/Initialize storage
  await storageService.init();

  const server = app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Smart Inventory Backend is running on:`);
    console.log(`   👉 http://localhost:${PORT}`);
    console.log(`   👉 Health: http://localhost:${PORT}/api/health`);
    console.log(`   👉 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===================================================`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
