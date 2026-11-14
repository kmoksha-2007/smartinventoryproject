import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Receipt, 
  Calendar, 
  DollarSign, 
  User, 
  CreditCard,
  FileText,
  X,
  Printer
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function SalesPage({ sales, onOpenRecordSale }) {
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const avgOrderValue = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;

  const filteredSales = sales.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      s.saleNumber.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.paymentMethod && s.paymentMethod.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle="Cumulative sales recorded"
          icon={DollarSign}
          colorScheme="emerald"
        />
        <StatCard
          title="Invoices Issued"
          value={sales.length}
          subtitle="Completed transactions"
          icon={Receipt}
          colorScheme="indigo"
        />
        <StatCard
          title="Avg Transaction Value"
          value={`₹${avgOrderValue.toLocaleString()}`}
          subtitle="Revenue per customer order"
          icon={ShoppingCart}
          colorScheme="violet"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search invoice # or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <button
          onClick={onOpenRecordSale}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale (POS)</span>
        </button>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Items Sold</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No sales recorded yet</p>
                    <p className="text-[11px] mt-0.5">Click "Record New Sale" to process your first order</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const id = sale._id || sale.id;
                  const dateObj = new Date(sale.saleDate || sale.createdAt);

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice # */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                        {sale.saleNumber}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500">
                        <div>{dateObj.toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {sale.customerName || 'Walk-in Customer'}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {sale.paymentMethod || 'Cash'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[200px] truncate text-slate-600">
                          {sale.items && sale.items.length > 0 ? (
                            sale.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')
                          ) : (
                            '1 item'
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {sale.items?.length || 1} line item(s)
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-emerald-600 text-sm">
                          ₹{Number(sale.totalAmount).toLocaleString()}
                        </span>
                      </td>

                      {/* Receipt Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedSaleForReceipt(sale)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedSaleForReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-scale-up">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Sales Invoice Slip</h3>
              </div>
              <button
                onClick={() => setSelectedSaleForReceipt(null)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="text-center border-b border-dashed border-slate-200 pb-3">
                <h4 className="text-base font-extrabold text-slate-900">SMART RETAIL STORE</h4>
                <p className="text-[11px] text-slate-500">Inventory & Point of Sale System</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Invoice: {selectedSaleForReceipt.saleNumber}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(selectedSaleForReceipt.saleDate || selectedSaleForReceipt.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-between text-slate-600 text-xs">
                <span>Customer: <strong>{selectedSaleForReceipt.customerName || 'Walk-in'}</strong></span>
                <span>Payment: <strong>{selectedSaleForReceipt.paymentMethod}</strong></span>
              </div>

              {/* Items */}
              <div className="border-t border-b border-slate-200 py-3 space-y-2">
                {selectedSaleForReceipt.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.sku} • {item.quantity} × ₹{item.unitPrice}</p>
                    </div>
                    <span className="font-bold text-slate-800">₹{(item.total || item.quantity * item.unitPrice).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-1">
                <span>Grand Total:</span>
                <span className="text-emerald-600 text-base">₹{Number(selectedSaleForReceipt.totalAmount).toLocaleString()}</span>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-200">
                Thank you for your business! Auto-generated by Smart Inventory.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSaleForReceipt(null)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
