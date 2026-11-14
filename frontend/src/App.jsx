import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProductModal from './components/ProductModal';
import RecordSaleModal from './components/RecordSaleModal';
import RestockModal from './components/RestockModal';
import ConfirmDialog from './components/ConfirmDialog';

import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import RestockPage from './pages/RestockPage';

import { productApi, salesApi, dashboardApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [restockSuggestions, setRestockSuggestions] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [restockingProduct, setRestockingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Show toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, salesRes, statsRes, suggestionsRes, categoriesRes] = await Promise.all([
        productApi.getAll(),
        salesApi.getAll(),
        dashboardApi.getStats(),
        productApi.getRestockSuggestions(),
        productApi.getCategories(),
      ]);

      if (productsRes.data?.success) setProducts(productsRes.data.data);
      if (salesRes.data?.success) setSales(salesRes.data.data);
      if (statsRes.data?.success) {
        setDashboardStats(statsRes.data.data);
        if (statsRes.data.data.system) {
          setSystemInfo(statsRes.data.data.system);
        }
      }
      if (suggestionsRes.data?.success) setRestockSuggestions(suggestionsRes.data.data);
      if (categoriesRes.data?.success) setCategories(categoriesRes.data.data);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      showToast('Could not reach backend API. Retrying...', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Product CRUD Handlers
  const handleSaveProduct = async (formData) => {
    if (editingProduct) {
      const id = editingProduct._id || editingProduct.id;
      const res = await productApi.update(id, formData);
      showToast(`Updated product "${res.data.data.name}"`);
    } else {
      const res = await productApi.create(formData);
      showToast(`Created new product "${res.data.data.name}"`);
    }
    await fetchData();
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setDeleteLoading(true);
      const id = deletingProduct._id || deletingProduct.id;
      await productApi.delete(id);
      showToast(`Deleted "${deletingProduct.name}"`, 'info');
      setDeletingProduct(null);
      await fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Restock Handlers
  const handleRestock = async (productId, quantity) => {
    const res = await productApi.restock(productId, quantity);
    showToast(res.data.message || `Added ${quantity} units to stock!`, 'success');
    await fetchData();
  };

  const handleAcceptSuggestion = async (product, quantity) => {
    try {
      const id = product._id || product.id;
      await productApi.restock(id, quantity);
      showToast(`Stock replenished: +${quantity} units for ${product.name}`, 'success');
      await fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  // Record Sale Handler
  const handleRecordSale = async (salePayload) => {
    const res = await salesApi.record(salePayload);
    showToast(
      `Sale recorded: Invoice ${res.data.data.saleNumber} (Stock updated)`,
      'success'
    );
    await fetchData();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Desktop/Tablet Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={dashboardStats?.lowStockCount || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          systemInfo={systemInfo}
          activeTab={activeTab}
          onRefresh={fetchData}
          onOpenAddProduct={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          onOpenRecordSale={() => setIsRecordSaleOpen(true)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {loading && !dashboardStats ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-semibold text-slate-500">Connecting to Smart Inventory...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  stats={dashboardStats}
                  onNavigateToProducts={() => setActiveTab('products')}
                  onNavigateToRestock={() => setActiveTab('restock')}
                  onNavigateToSales={() => setActiveTab('sales')}
                  onQuickRestock={(prod) => setRestockingProduct(prod)}
                />
              )}

              {activeTab === 'products' && (
                <ProductsPage
                  products={products}
                  categories={categories}
                  onOpenAdd={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  onOpenEdit={(prod) => {
                    setEditingProduct(prod);
                    setIsProductModalOpen(true);
                  }}
                  onOpenDelete={(prod) => setDeletingProduct(prod)}
                  onOpenRestock={(prod) => setRestockingProduct(prod)}
                />
              )}

              {activeTab === 'sales' && (
                <SalesPage
                  sales={sales}
                  onOpenRecordSale={() => setIsRecordSaleOpen(true)}
                />
              )}

              {activeTab === 'restock' && (
                <RestockPage
                  suggestions={restockSuggestions}
                  onRestockSuggestion={handleAcceptSuggestion}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        product={editingProduct}
        existingCategories={categories}
      />

      {/* Record Sale (POS) Modal */}
      <RecordSaleModal
        isOpen={isRecordSaleOpen}
        onClose={() => setIsRecordSaleOpen(false)}
        onSubmit={handleRecordSale}
        products={products}
      />

      {/* Restock Modal */}
      <RestockModal
        isOpen={!!restockingProduct}
        onClose={() => setRestockingProduct(null)}
        onRestock={handleRestock}
        product={restockingProduct}
      />

      {/* Delete Product Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
        title={`Delete Product?`}
        message={`Are you sure you want to permanently delete "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku})? This cannot be undone.`}
        confirmText="Yes, Delete Product"
      />
    </div>
  );
}
