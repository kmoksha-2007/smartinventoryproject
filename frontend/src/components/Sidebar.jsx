import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  TrendingDown, 
  BarChart3, 
  Store,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, lowStockCount = 0 }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: 'Products & Stock',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'sales',
      label: 'Sales & Receipts',
      icon: ShoppingCart,
    },
    {
      id: 'restock',
      label: 'Restock Suggestions',
      icon: TrendingDown,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">SmartStock</h2>
          <p className="text-xs text-indigo-400 font-medium">Small Business POS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Summary Pill at bottom of sidebar */}
      <div className="p-4 border-t border-slate-800 m-3 bg-slate-800/50 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-300">
          <Store className="w-4 h-4 text-emerald-400" />
          <span>Active Outlet</span>
        </div>
        <p className="text-xs text-slate-400 font-light">Main Retail Store</p>
        <div className="mt-3 text-[11px] text-slate-400 flex justify-between">
          <span>College Major Project</span>
          <span className="text-indigo-400 font-semibold">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
