import React from 'react';
import { Package, Plus, ShoppingCart, RefreshCw, Database } from 'lucide-react';

export default function Navbar({
  systemInfo,
  onOpenAddProduct,
  onOpenRecordSale,
  onRefresh,
  activeTab,
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Business Overview';
      case 'products':
        return 'Inventory Catalog';
      case 'sales':
        return 'Sales & Billing';
      case 'restock':
        return 'Smart Restock Suggestions';
      default:
        return 'Smart Inventory';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getTabTitle()}</h1>
          <p className="text-xs text-slate-500">
            Real-time stock tracking, sales recording & automated reorder intelligence
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Database mode badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>DB:</span>
            <span className={systemInfo?.connected ? 'text-emerald-600 font-semibold' : 'text-indigo-600 font-semibold'}>
              {systemInfo?.database || 'Local Store'}
            </span>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRecordSale}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Record Sale</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </header>
  );
}
