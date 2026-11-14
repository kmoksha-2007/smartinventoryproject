import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUpCircle, 
  Package, 
  AlertCircle,
  Tag
} from 'lucide-react';

export default function ProductsPage({
  products,
  categories,
  onOpenAdd,
  onOpenEdit,
  onOpenDelete,
  onOpenRestock,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatus, setStockStatus] = useState('all'); // all | low | out | in

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.supplier && p.supplier.toLowerCase().includes(q));

      // Category
      const matchesCategory =
        selectedCategory === 'All' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      // Stock status
      let matchesStock = true;
      if (stockStatus === 'low') {
        matchesStock = p.quantity <= p.minThreshold;
      } else if (stockStatus === 'out') {
        matchesStock = p.quantity <= 0;
      } else if (stockStatus === 'in') {
        matchesStock = p.quantity > p.minThreshold;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, selectedCategory, stockStatus]);

  const getStatusBadge = (quantity, threshold) => {
    if (quantity <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          Out of Stock
        </span>
      );
    }
    if (quantity <= threshold) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        In Stock
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stock Filter Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Stock:
        </span>
        {[
          { id: 'all', label: `All (${products.length})` },
          { id: 'low', label: `Low Stock (${products.filter((p) => p.quantity <= p.minThreshold).length})` },
          { id: 'out', label: `Out of Stock (${products.filter((p) => p.quantity <= 0).length})` },
          { id: 'in', label: `Healthy Stock (${products.filter((p) => p.quantity > p.minThreshold).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStockStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              stockStatus === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Product & Category</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Price / Cost</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No products found matching criteria</p>
                    <p className="text-[11px] mt-0.5">Try clearing filters or add a new product</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const id = prod._id || prod.id;
                  const isLow = prod.quantity <= prod.minThreshold;
                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{prod.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
                            <Tag className="w-3 h-3" /> {prod.category}
                          </span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-xs">
                        {prod.sku}
                      </td>

                      {/* Price / Cost */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">₹{Number(prod.price).toLocaleString()}</p>
                        {prod.costPrice ? (
                          <p className="text-[11px] text-slate-400">
                            Cost: ₹{Number(prod.costPrice).toLocaleString()}
                          </p>
                        ) : null}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-sm font-extrabold ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {prod.quantity}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Min: {prod.minThreshold}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(prod.quantity, prod.minThreshold)}
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                        {prod.supplier || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenRestock(prod)}
                            title="Quick Restock"
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenEdit(prod)}
                            title="Edit Product"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenDelete(prod)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-800">{products.length}</strong> products
          </span>
          <span className="font-medium text-slate-600">
            Smart Inventory Manager v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
