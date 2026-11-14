import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';

export default function RecordSaleModal({ isOpen, onClose, onSubmit, products = [] }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => (p._id || p.id) === selectedProductId);

  // Calculate current available stock taking into account what's already in the cart
  const alreadyInCartQty = cart
    .filter((item) => item.productId === selectedProductId)
    .reduce((sum, item) => sum + item.quantity, 0);

  const availableStock = selectedProduct ? selectedProduct.quantity - alreadyInCartQty : 0;

  const handleAddToCart = () => {
    setError('');
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }
    const qty = Number(itemQuantity);
    if (qty <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (qty > availableStock) {
      setError(`Cannot add ${qty} units. Only ${availableStock} units remaining in stock.`);
      return;
    }

    const existingCartIndex = cart.findIndex((item) => item.productId === selectedProductId);
    if (existingCartIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingCartIndex].quantity += qty;
      updatedCart[existingCartIndex].total =
        updatedCart[existingCartIndex].quantity * updatedCart[existingCartIndex].unitPrice;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct._id || selectedProduct.id,
          productName: selectedProduct.name,
          sku: selectedProduct.sku,
          unitPrice: selectedProduct.price,
          quantity: qty,
          total: selectedProduct.price * qty,
        },
      ]);
    }

    // Reset selection input
    setSelectedProductId('');
    setItemQuantity(1);
  };

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalBill = cart.reduce((sum, item) => sum + item.total, 0);

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Please add at least one item to the sale.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        items: cart,
        customerName: customerName.trim() || 'Walk-in Customer',
        paymentMethod,
        notes: notes.trim(),
      });
      // Reset state
      setCart([]);
      setCustomerName('Walk-in Customer');
      setPaymentMethod('Cash');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/30 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Record New Sale</h3>
              <p className="text-xs text-emerald-100">Automatically updates and decrements stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Item section */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Select Product & Quantity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setItemQuantity(1);
                    setError('');
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => {
                    const id = p._id || p.id;
                    const isOut = p.quantity <= 0;
                    return (
                      <option key={id} value={id} disabled={isOut}>
                        {p.name} ({p.sku}) - ₹{p.price} | Stock: {p.quantity} {isOut ? '[OUT OF STOCK]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, availableStock)}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                  className="w-16 px-2.5 py-2 text-xs border border-slate-300 rounded-lg outline-none text-center"
                  placeholder="Qty"
                />
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedProductId || availableStock <= 0}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {selectedProduct && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Unit Price: <strong className="text-slate-800">₹{selectedProduct.price}</strong></span>
                <span>
                  Remaining Available: <strong className={availableStock < 5 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>{availableStock}</strong> units
                </span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Invoice Items ({cart.length})
            </h4>
            {cart.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs">
                No items added yet. Select a product above to add to cart.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-slate-800 truncate">{item.productName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.sku} • {item.quantity} × ₹{item.unitPrice}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">₹{item.total.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Total & Action Bar */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Total Payable:</span>
              <p className="text-2xl font-extrabold text-emerald-600">₹{totalBill.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || cart.length === 0}
                onClick={handleSubmitSale}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                {submitting ? 'Processing...' : 'Complete Sale & Decrement Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
