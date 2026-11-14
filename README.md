# Smart Inventory System for Small Businesses

A production-ready Full-Stack College Project built with **React**, **Node.js + Express**, and **MongoDB**. Designed specifically to help small businesses track inventory, monitor low stock thresholds, record sales at checkout, automatically decrement stock, and receive intelligent restock suggestions.

---

## 🌟 Key Features

1. **Interactive Real-Time Dashboard**:
   - Total Listed Products
   - Total Physical Units in Stock
   - Critical & Low Stock Item Counter
   - Total Inventory Valuation (Retail Value & Cost Value)
   - Visual Inventory Breakdown across Categories
   - Critical Stock Watchlist & Live Sales Feed
2. **Product Catalog Management (Full CRUD)**:
   - Add new products with automatic SKU generation
   - Edit pricing, stock levels, suppliers, and safety thresholds
   - Delete products with safe confirmation modal
   - Live Search by Name, SKU, or Supplier
   - Category filtering and Stock Level filtering (*All*, *Low Stock*, *Out of Stock*, *Healthy Stock*)
3. **Point of Sale (POS) & Sales Recording**:
   - Multi-item checkout basket
   - Real-time stock validation (prevents overselling beyond current stock)
   - Instant automated stock decrement upon transaction confirmation
   - Invoice slip generation and print preview
4. **Smart Restock Intelligence Engine**:
   - Automated reorder algorithm calculating:
     $$\text{Suggested Reorder} = (2 \times \text{Min Threshold}) - \text{Current Stock}$$
   - Urgency categorization: `CRITICAL` (stockout), `HIGH` (≤50% threshold), `MEDIUM` (below threshold)
   - Replenishment budget estimate based on wholesale cost price
   - One-click instant stock replenishment
5. **Resilient Dual Storage Architecture**:
   - Supports **MongoDB** via Mongoose models when MongoDB is available (locally or via MongoDB Atlas).
   - Automatically activates embedded JSON persistence if MongoDB service is not started, ensuring the system **never crashes** and is immediately testable out-of-the-box!

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, Mongoose, Morgan, CORS, Dotenv
- **Database**: MongoDB (Mongoose Schema & Models: `Product`, `Sale`, `Category`) with automatic JSON fallback

```
smartinventoryproject/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection & status checker
│   ├── controllers/
│   │   ├── productController.js  # Product CRUD & restock logic
│   │   ├── saleController.js     # Sales & stock deduction logic
│   │   └── dashboardController.js# Aggregated statistics
│   ├── models/
│   │   ├── Product.js            # Mongoose Product Schema
│   │   ├── Sale.js               # Mongoose Sale & Invoice Schema
│   │   └── Category.js           # Category Schema
│   ├── routes/
│   │   ├── productRoutes.js      # /api/products
│   │   ├── saleRoutes.js         # /api/sales
│   │   └── dashboardRoutes.js    # /api/dashboard
│   ├── services/
│   │   └── storageService.js     # Dual-layer storage controller
│   ├── data/
│   │   └── seedData.js           # Sample realistic products
│   ├── server.js                 # Main Express server entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, StatCard, Modals, Toast
│   │   ├── pages/                # Dashboard, Products, Sales, Restock
│   │   ├── services/api.js       # Axios API client
│   │   ├── App.jsx               # Application root
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                  # Root scripts
├── start-app.bat                 # Windows 1-click launcher
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure MongoDB (Optional)
By default, the backend connects to `mongodb://127.0.0.1:27017/smart_inventory`.
To connect to **MongoDB Atlas (Cloud)**, open `backend/.env` and set:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_inventory?retryWrites=true&w=majority
```
*(If MongoDB is not installed locally, the backend will automatically run in persistent local store mode so you can demo without installing MongoDB)*.

### 3. Run the Project
**Option A — Windows 1-Click**:
Double-click `start-app.bat` in the root folder.

**Option B — Terminal**:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access URLs
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/dashboard/stats](http://localhost:5000/api/dashboard/stats)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Overall dashboard metrics & category breakdown |
| `GET` | `/api/products` | Retrieve all products (supports `?search=`, `?category=`, `?stockFilter=`) |
| `POST` | `/api/products` | Add a new product |
| `GET` | `/api/products/:id` | Get single product details |
| `PUT` | `/api/products/:id` | Update product information |
| `DELETE` | `/api/products/:id` | Delete product from catalog |
| `POST` | `/api/products/:id/restock` | Replenish stock quantity |
| `GET` | `/api/products/restock-suggestions`| Algorithmic restock recommendations |
| `POST` | `/api/sales` | Record new sale & decrease stock atomically |
| `GET` | `/api/sales` | Retrieve transaction & billing history |

---

## 🎓 College Viva & Interview Q&A

**Q1: How does the system handle stock decrement during sales?**
> In `saleController.js` and `storageService.js`, when a sale is submitted, each item is validated against existing product inventory. If the requested quantity exceeds available stock, the request is rejected with a 400 Bad Request. When validated, the stock quantity is atomically decreased before saving the transaction.

**Q2: How does the Restock Suggestion algorithm work?**
> Each item has a `minThreshold` safety level. The system calculates the deficit:
> $$\text{Deficit} = \max(0, \text{Threshold} - \text{Quantity})$$
> And recommends ordering $(2 \times \text{Threshold}) - \text{Quantity}$ units to achieve buffer security without holding excessive inventory.

**Q3: How are CORS and Cross-Origin requests handled?**
> The backend employs the `cors` middleware configured for API requests, and the Vite frontend features a development proxy configured in `vite.config.js`.
