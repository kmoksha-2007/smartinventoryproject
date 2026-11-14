import React from 'react';
import { 
  TrendingDown, 
  AlertTriangle, 
  ArrowUpCircle, 
  CheckCircle, 
  DollarSign, 
  Package, 
  Sparkles,
  Truck
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function RestockPage({ suggestions = [], onRestockSuggestion }) {
  const criticalCount = suggestions.filter((s) => s.urgency === 'CRITICAL').length;
  const highCount = suggestions.filter((s) => s.urgency === 'HIGH').length;
  const totalSuggestedItems = suggestions.reduce((sum, s) => sum + s.suggestedRestockQuantity, 0);
  const totalEstimatedCost = suggestions.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
            CRITICAL (Out of Stock)
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-700 border border-amber-200">
            HIGH (&le; 50% Threshold)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
            MEDIUM (Below Threshold)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Items Needing Reorder"
          value={suggestions.length}
          subtitle={`${criticalCount} critical stockouts`}
          icon={TrendingDown}
          colorScheme={criticalCount > 0 ? 'rose' : 'amber'}
        />

        <StatCard
          title="Critical Alerts"
          value={criticalCount}
          subtitle="Zero units on shelf"
          icon={AlertTriangle}
          colorScheme="rose"
        />

        <StatCard
          title="Total Reorder Units"
          value={totalSuggestedItems}
          subtitle="Recommended replenishment"
          icon={Package}
          colorScheme="indigo"
        />

        <StatCard
          title="Estimated Budget"
          value={`₹${totalEstimatedCost.toLocaleString()}`}
          subtitle="Based on wholesale cost"
          icon={DollarSign}
          colorScheme="emerald"
        />
      </div>

      {/* Smart Intelligence Algorithm Explanation Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Smart Restock Intelligence Engine</h4>
            <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
              Our automated recommendation algorithm evaluates each product's current inventory balance
              against its minimum safety threshold. It calculates the exact quantity needed to bring stock
              up to <strong>2× safety threshold</strong> to prevent supply-chain stockouts while optimizing working capital.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Priority Replenishment Queue</h3>
            <p className="text-xs text-slate-500">Sorted by urgency and stock deficit</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {suggestions.length} pending action
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-700">All Stock Levels are Optimal!</h4>
            <p className="text-xs text-slate-500 mt-1">
              None of your inventory items are currently below their minimum threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Urgency Level</th>
                  <th className="py-3 px-4 text-center">Current / Min</th>
                  <th className="py-3 px-4 text-center">Suggested Order</th>
                  <th className="py-3 px-4">Estimated Cost</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {suggestions.map((item) => {
                  const prod = item.product;
                  const id = prod._id || prod.id;

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{prod.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          SKU: {prod.sku} • {prod.category}
                        </p>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4">
                        {getUrgencyBadge(item.urgency)}
                      </td>

                      {/* Current / Min */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-rose-600 text-sm">
                          {item.currentQuantity}
                        </span>
                        <span className="text-slate-400 font-mono"> / {item.minThreshold}</span>
                      </td>

                      {/* Suggested Order */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl text-xs">
                          +{item.suggestedRestockQuantity} units
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          ₹{item.estimatedCost.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          @ ₹{prod.costPrice || Math.round(prod.price * 0.7)}/unit
                        </p>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[140px]">{item.supplier}</span>
                        </div>
                      </td>

                      {/* Instant Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onRestockSuggestion(prod, item.suggestedRestockQuantity)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>Accept & Restock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
