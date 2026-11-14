import React, { useState } from 'react';
import { X, ArrowUpCircle } from 'lucide-react';

export default function RestockModal({ isOpen, onClose, onRestock, product }) {
  const [quantity, setQuantity] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await onRestock(product._id || product.id, qty);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden animate-scale-up">
        <div className="px-5 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-800">Restock Product</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-800">{product.name}</p>
            <p className="text-xs text-slate-500 font-mono">SKU: {product.sku}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between text-xs">
            <span className="text-slate-600">Current Stock:</span>
            <span className="font-bold text-slate-900">{product.quantity} units</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Add Stock Quantity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="10"
              />
              <div className="flex gap-1">
                {[10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className="px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all disabled:opacity-60"
            >
              {submitting ? 'Updating...' : `Confirm +${quantity} Stock`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
