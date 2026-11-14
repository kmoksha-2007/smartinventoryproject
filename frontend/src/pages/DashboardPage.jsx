import React from 'react';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  CircleDollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function DashboardPage({ 
  stats, 
  onNavigateToProducts, 
  onNavigateToRestock, 
  onNavigateToSales, 
  onQuickRestock 
}) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const lowStockCount = stats.lowStockCount || 0;
  const outOfStockCount = stats.outOfStockCount || 0;
  const inventoryRetailValue = stats.inventoryRetailValue || 0;
  const totalRevenue = stats.totalRevenue || 0;

  return (
    <div className="space-y-6">
      {/* Low Stock Warning Banner if any */}
      {lowStockCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-700 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Action Needed: {lowStockCount} Product{lowStockCount > 1 ? 's' : ''} Running Low on Stock
              </h4>
              <p className="text-xs text-amber-700">
                {outOfStockCount > 0 && (
                  <span className="font-semibold text-rose-700 mr-1.5">
                    ({outOfStockCount} completely out of stock)
                  </span>
                )}
                Review smart restock suggestions to avoid sales disruption.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRestock}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0"
          >
            <span>Review Reorders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts || 0}
          subtitle="Distinct SKUs listed"
          icon={Package}
          colorScheme="indigo"
        />

        <StatCard
          title="Total Units in Stock"
          value={stats.totalStock?.toLocaleString() || 0}
          subtitle="Physical inventory units"
          icon={Boxes}
          colorScheme="emerald"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle={`${outOfStockCount} zero stock`}
          icon={AlertTriangle}
          trend={lowStockCount > 0 ? 'Reorder Needed' : 'Healthy'}
          colorScheme={lowStockCount > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Inventory Value"
          value={`₹${inventoryRetailValue.toLocaleString()}`}
          subtitle={`Cost: ₹${(stats.inventoryCostValue || 0).toLocaleString()}`}
          icon={CircleDollarSign}
          colorScheme="violet"
        />
      </div>

      {/* Secondary Row: Revenue & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">Sales Summary</h4>
              <button
                onClick={onNavigateToSales}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <span className="text-xs text-slate-500 font-medium">Total Recorded Revenue</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Processed <strong className="text-slate-800">{stats.totalSalesCount || 0}</strong> transaction{stats.totalSalesCount === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToSales}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open Sales Register</span>
          </button>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800">Inventory by Category</h4>
            <span className="text-xs text-slate-500">
              {stats.categoryBreakdown?.length || 0} categories
            </span>
          </div>

          <div className="space-y-3">
            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              stats.categoryBreakdown.map((item, idx) => {
                const percentage = stats.totalProducts > 0 
                  ? Math.round((item.count / stats.totalProducts) * 100) 
                  : 0;

                const colors = [
                  'bg-indigo-600',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-rose-500',
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{item.category}</span>
                      <span className="text-slate-500 font-mono">
                        {item.count} items ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No categories registered yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Third Row: Recent Alerts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-800">Critical Stock Watchlist</h4>
            </div>
            <button
              onClick={onNavigateToRestock}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Smart Suggestions &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recentLowStockAlerts && stats.recentLowStockAlerts.length > 0 ? (
              stats.recentLowStockAlerts.map((prod) => (
                <div
                  key={prod._id || prod.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      SKU: {prod.sku} • Min Threshold: {prod.minThreshold}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        prod.quantity === 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {prod.quantity === 0 ? 'Out of Stock' : `${prod.quantity} Left`}
                    </span>
                    <button
                      onClick={() => onQuickRestock(prod)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-emerald-600 font-medium">
                🎉 All products have healthy stock levels above minimum thresholds!
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales Feed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-800">Recent Sales Activity</h4>
            </div>
            <button
              onClick={onNavigateToSales}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Full History &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recentSales && stats.recentSales.length > 0 ? (
              stats.recentSales.map((sale) => (
                <div
                  key={sale._id || sale.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">{sale.saleNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold">
                        {sale.paymentMethod || 'Cash'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {sale.customerName || 'Walk-in'} • {sale.items?.length || 0} item(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-emerald-600">
                      +₹{Number(sale.totalAmount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No sales recorded yet. Click "Record Sale" in the navbar to create the first invoice!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
