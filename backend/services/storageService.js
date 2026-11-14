const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Category = require('../models/Category');
const { isMongoConnected } = require('../config/db');
const { initialProducts } = require('../data/seedData');

const DB_FILE_PATH = path.join(__dirname, '../data/inventory_db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate MongoDB-like 24-char hex ID
const generateId = () => crypto.randomBytes(12).toString('hex');

// Read JSON store
const readLocalDB = () => {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const seeded = {
        products: initialProducts.map((p, idx) => ({
          _id: generateId(),
          ...p,
          createdAt: new Date(Date.now() - (idx * 3600000)).toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        sales: [],
        categories: ['Electronics', 'Stationery', 'Beverages', 'Packaging', 'Furniture'],
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(seeded, null, 2), 'utf-8');
      return seeded;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return { products: [], sales: [], categories: [] };
  }
};

// Write JSON store
const writeLocalDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local JSON db:', err);
  }
};

// Seed MongoDB if empty
const seedMongoIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 [MongoDB] Seeding initial sample products into MongoDB...');
      await Product.insertMany(initialProducts);
      console.log(`✅ [MongoDB] Seeded ${initialProducts.length} sample products.`);
    }
  } catch (err) {
    console.error('MongoDB seed error:', err.message);
  }
};

// Storage Service API
const storageService = {
  // Initialize and check seed
  init: async () => {
    if (isMongoConnected()) {
      await seedMongoIfEmpty();
    } else {
      readLocalDB(); // Ensures file is generated
    }
  },

  // ---------------- PRODUCTS ----------------
  getAllProducts: async (filters = {}) => {
    const { search = '', category = '', stockFilter = '' } = filters;

    if (isMongoConnected()) {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { supplier: { $regex: search, $options: 'i' } },
        ];
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (stockFilter === 'low') {
        query.$expr = { $lte: ['$quantity', '$minThreshold'] };
      } else if (stockFilter === 'out') {
        query.quantity = { $lte: 0 };
      } else if (stockFilter === 'in') {
        query.$expr = { $gt: ['$quantity', '$minThreshold'] };
      }

      const products = await Product.find(query).sort({ updatedAt: -1 });
      return products.map((p) => p.toJSON ? p.toJSON() : p);
    }

    // Local JSON Fallback
    const db = readLocalDB();
    let result = [...db.products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.supplier && p.supplier.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (stockFilter === 'low') {
      result = result.filter((p) => p.quantity <= p.minThreshold);
    } else if (stockFilter === 'out') {
      result = result.filter((p) => p.quantity <= 0);
    } else if (stockFilter === 'in') {
      result = result.filter((p) => p.quantity > p.minThreshold);
    }

    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getProductById: async (id) => {
    if (isMongoConnected()) {
      return await Product.findById(id);
    }
    const db = readLocalDB();
    return db.products.find((p) => p._id === id || p.id === id) || null;
  },

  createProduct: async (productData) => {
    if (isMongoConnected()) {
      const product = new Product(productData);
      return await product.save();
    }

    const db = readLocalDB();
    // Validate SKU uniqueness
    const exists = db.products.some(
      (p) => p.sku.toUpperCase() === productData.sku.toUpperCase()
    );
    if (exists) {
      const err = new Error(`Product with SKU "${productData.sku}" already exists.`);
      err.status = 400;
      throw err;
    }

    const newProduct = {
      _id: generateId(),
      name: productData.name.trim(),
      sku: productData.sku.trim().toUpperCase(),
      category: productData.category.trim(),
      price: Number(productData.price),
      costPrice: Number(productData.costPrice || 0),
      quantity: Number(productData.quantity || 0),
      minThreshold: Number(productData.minThreshold || 5),
      supplier: productData.supplier ? productData.supplier.trim() : 'General Distributor',
      description: productData.description ? productData.description.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    if (!db.categories.includes(newProduct.category)) {
      db.categories.push(newProduct.category);
    }
    writeLocalDB(db);
    return newProduct;
  },

  updateProduct: async (id, updateData) => {
    if (isMongoConnected()) {
      return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    const db = readLocalDB();
    const idx = db.products.findIndex((p) => p._id === id || p.id === id);
    if (idx === -1) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    // Check SKU collision if SKU changed
    if (updateData.sku && updateData.sku.toUpperCase() !== db.products[idx].sku) {
      const exists = db.products.some(
        (p, i) => i !== idx && p.sku.toUpperCase() === updateData.sku.toUpperCase()
      );
      if (exists) {
        const err = new Error(`Product with SKU "${updateData.sku}" already exists.`);
        err.status = 400;
        throw err;
      }
    }

    const updated = {
      ...db.products[idx],
      ...updateData,
      price: updateData.price !== undefined ? Number(updateData.price) : db.products[idx].price,
      costPrice: updateData.costPrice !== undefined ? Number(updateData.costPrice) : db.products[idx].costPrice,
      quantity: updateData.quantity !== undefined ? Number(updateData.quantity) : db.products[idx].quantity,
      minThreshold: updateData.minThreshold !== undefined ? Number(updateData.minThreshold) : db.products[idx].minThreshold,
      sku: updateData.sku ? updateData.sku.toUpperCase().trim() : db.products[idx].sku,
      updatedAt: new Date().toISOString(),
    };

    db.products[idx] = updated;
    if (updated.category && !db.categories.includes(updated.category)) {
      db.categories.push(updated.category);
    }
    writeLocalDB(db);
    return updated;
  },

  deleteProduct: async (id) => {
    if (isMongoConnected()) {
      return await Product.findByIdAndDelete(id);
    }

    const db = readLocalDB();
    const initialLen = db.products.length;
    db.products = db.products.filter((p) => p._id !== id && p.id !== id);
    if (db.products.length === initialLen) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    writeLocalDB(db);
    return { success: true, message: 'Product deleted successfully' };
  },

  // ---------------- SALES & STOCK MANAGEMENT ----------------
  recordSale: async (salePayload) => {
    const { items, customerName = 'Walk-in Customer', paymentMethod = 'Cash', notes = '' } = salePayload;

    if (!items || !items.length) {
      const err = new Error('A sale must include at least one item');
      err.status = 400;
      throw err;
    }

    const saleNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    if (isMongoConnected()) {
      // Validate inventory and prepare items
      const processedItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        const requestedQty = Number(item.quantity);
        if (product.quantity < requestedQty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${requestedQty}`
          );
        }

        const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : product.price;
        const lineTotal = unitPrice * requestedQty;
        totalAmount += lineTotal;

        // Decrement stock
        product.quantity -= requestedQty;
        await product.save();

        processedItems.push({
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          quantity: requestedQty,
          unitPrice,
          total: lineTotal,
        });
      }

      const sale = new Sale({
        saleNumber,
        items: processedItems,
        totalAmount,
        customerName,
        paymentMethod,
        notes,
        saleDate: new Date(),
      });

      return await sale.save();
    }

    // Local JSON Fallback
    const db = readLocalDB();
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const productIndex = db.products.findIndex(
        (p) => p._id === item.productId || p.id === item.productId
      );
      if (productIndex === -1) {
        const err = new Error(`Product with ID "${item.productId}" not found.`);
        err.status = 404;
        throw err;
      }

      const product = db.products[productIndex];
      const requestedQty = Number(item.quantity);

      if (product.quantity < requestedQty) {
        const err = new Error(
          `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${requestedQty}`
        );
        err.status = 400;
        throw err;
      }

      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : product.price;
      const lineTotal = unitPrice * requestedQty;
      totalAmount += lineTotal;

      // Atomic stock reduction
      db.products[productIndex].quantity -= requestedQty;
      db.products[productIndex].updatedAt = new Date().toISOString();

      processedItems.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: requestedQty,
        unitPrice,
        total: lineTotal,
      });
    }

    const newSale = {
      _id: generateId(),
      saleNumber,
      items: processedItems,
      totalAmount,
      customerName,
      paymentMethod,
      notes,
      saleDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.sales.unshift(newSale);
    writeLocalDB(db);
    return newSale;
  },

  getAllSales: async () => {
    if (isMongoConnected()) {
      return await Sale.find().sort({ saleDate: -1 });
    }
    const db = readLocalDB();
    return db.sales.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
  },

  // ---------------- RESTOCK & ALERTS ----------------
  restockProduct: async (id, addQuantity) => {
    const qty = Number(addQuantity);
    if (isNaN(qty) || qty <= 0) {
      const err = new Error('Restock quantity must be a positive number');
      err.status = 400;
      throw err;
    }

    if (isMongoConnected()) {
      const product = await Product.findById(id);
      if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
      }
      product.quantity += qty;
      return await product.save();
    }

    const db = readLocalDB();
    const idx = db.products.findIndex((p) => p._id === id || p.id === id);
    if (idx === -1) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    db.products[idx].quantity += qty;
    db.products[idx].updatedAt = new Date().toISOString();
    writeLocalDB(db);
    return db.products[idx];
  },

  getRestockSuggestions: async () => {
    const products = await storageService.getAllProducts();

    return products
      .filter((p) => p.quantity <= p.minThreshold)
      .map((p) => {
        // Suggested reorder = safety buffer to bring up to double minThreshold + current deficit
        const deficit = Math.max(0, p.minThreshold - p.quantity);
        const suggestedQty = (p.minThreshold * 2) - p.quantity;
        const urgency = p.quantity === 0 ? 'CRITICAL' : p.quantity <= (p.minThreshold / 2) ? 'HIGH' : 'MEDIUM';
        const estimatedCost = (suggestedQty * (p.costPrice || p.price * 0.7));

        return {
          product: p,
          currentQuantity: p.quantity,
          minThreshold: p.minThreshold,
          suggestedRestockQuantity: Math.max(suggestedQty, 5),
          urgency,
          estimatedCost: Math.round(estimatedCost),
          supplier: p.supplier || 'Primary Supplier',
        };
      })
      .sort((a, b) => {
        // Critical first
        const order = { CRITICAL: 1, HIGH: 2, MEDIUM: 3 };
        return order[a.urgency] - order[b.urgency];
      });
  },

  // ---------------- DASHBOARD METRICS ----------------
  getDashboardStats: async () => {
    const products = await storageService.getAllProducts();
    const sales = await storageService.getAllSales();

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const lowStockProducts = products.filter((p) => p.quantity <= p.minThreshold);
    const lowStockCount = lowStockProducts.length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;

    // Inventory value based on selling price and cost price
    const inventoryRetailValue = products.reduce(
      (sum, p) => sum + ((Number(p.price) || 0) * (Number(p.quantity) || 0)),
      0
    );
    const inventoryCostValue = products.reduce(
      (sum, p) => sum + ((Number(p.costPrice) || 0) * (Number(p.quantity) || 0)),
      0
    );

    // Sales metrics
    const totalSalesCount = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

    // Category distribution
    const categoryCounts = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      totalProducts,
      totalStock,
      lowStockCount,
      outOfStockCount,
      inventoryRetailValue,
      inventoryCostValue,
      totalSalesCount,
      totalRevenue,
      categoryBreakdown,
      recentLowStockAlerts: lowStockProducts.slice(0, 5),
      recentSales: sales.slice(0, 5),
    };
  },

  getCategories: async () => {
    const products = await storageService.getAllProducts();
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats);
  },
};

module.exports = storageService;
