import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import Button from './UIElements/Button';
import { CartItem } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { fetchActiveCoupons } from '../services/api';
import { Route } from '../App';
import { Trash2, Tag, ChevronRight } from 'lucide-react';

const CartItemRow: React.FC<{ item: CartItem; onNavigate: (route: Route) => void }> = ({ item, onNavigate }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product } = item;
  const unitPrice = item.variantId && item.variant ? item.variant.price : product.price;
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
      {/* Image */}
      <div
        className="w-24 h-24 flex-shrink-0 bg-white rounded-xl overflow-hidden border border-slate-100 cursor-pointer"
        onClick={() => onNavigate({ page: 'product', slug: product.slug })}
      >
        <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3
            className="font-semibold text-slate-800 text-sm leading-snug cursor-pointer hover:text-primary transition-colors line-clamp-2"
            onClick={() => onNavigate({ page: 'product', slug: product.slug })}
          >
            {product.name}
          </h3>
          {item.variantName && (
            <span className="inline-block mt-1 text-[10px] font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{item.variantName}</span>
          )}
          <p className="mt-1 text-xs text-slate-400">₹{unitPrice.toFixed(2)} each</p>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity stepper */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-lg leading-none"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-lg leading-none"
            >
              +
            </button>
          </div>

          {/* Line total + remove */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">₹{lineTotal.toFixed(2)}</span>
            <button
              onClick={() => removeFromCart(item.id)}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


interface ActiveCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  minCartValue: number | null;
  expiryDate: string | null;
}

const CartView: React.FC<{ onNavigate: (route: Route) => void }> = ({ onNavigate }) => {
  const { cart, cartItems, cartTotal, applyCoupon, removeCoupon, discount, finalTotal, walletBalance, pointsToRedeem, setPointsToRedeem, walletDiscount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>([]);
  const [couponsExpanded, setCouponsExpanded] = useState(false);

  useEffect(() => {
    fetchActiveCoupons()
      .then((data: ActiveCoupon[]) => setActiveCoupons(data))
      .catch(() => {});
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      await applyCoupon(couponCode);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApplyCouponCode = async (code: string) => {
    try {
      await applyCoupon(code);
      setCouponCode(code);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-slate-800">Your cart is empty</h1>
        <p className="mt-2 text-slate-500 text-sm">Looks like you haven't added anything yet.</p>
        <Button href="#/" variant="primary" size="lg" className="mt-6">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <h1 className="text-2xl font-bold mb-6 text-slate-900">
        Your Cart <span className="text-slate-400 font-normal text-base ml-1">({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cartItems.map(item => <CartItemRow key={item.id} item={item} onNavigate={onNavigate} />)}

          <button
            onClick={() => onNavigate({ page: 'products' })}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline self-start"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Continue Shopping
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-h-[calc(100vh-7rem)]">

            <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
            </div>

            {/* Scrollable middle section */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0">

              {/* Applied coupon pill */}
              {cart?.coupon && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-bold text-green-700">{cart.coupon.code}</span>
                    <span className="text-[10px] text-green-600">
                      {cart.coupon.discountType === 'PERCENTAGE' ? `${cart.coupon.discountValue}% off` : `₹${cart.coupon.discountValue} off`}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Available coupons — collapsible if more than 2 */}
              {activeCoupons.filter(c => c.code !== cart?.coupon?.code).length > 0 && (
                <div>
                  <button
                    onClick={() => setCouponsExpanded(p => !p)}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 w-full"
                  >
                    <Tag className="w-3 h-3" />
                    {cart?.coupon ? 'Other Coupons' : 'Available Coupons'}
                    <span className="ml-auto text-primary">{couponsExpanded ? '▲ Hide' : '▼ Show'}</span>
                  </button>

                  {couponsExpanded && (
                    <div className="flex flex-col gap-1.5">
                      {activeCoupons.filter(c => c.code !== cart?.coupon?.code).map(coupon => {
                        const eligible = coupon.minCartValue === null || cartTotal >= coupon.minCartValue;
                        return (
                          <button
                            key={coupon.code}
                            onClick={() => eligible && handleApplyCouponCode(coupon.code)}
                            disabled={!eligible}
                            className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                              eligible
                                ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer'
                                : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold tracking-wide">{coupon.code}</span>
                              <span>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}</span>
                            </div>
                            {!eligible && coupon.minCartValue && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Min. cart ₹{coupon.minCartValue}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Coupon input — only show if no coupon applied */}
              {!cart?.coupon && (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 min-w-0 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </form>
              )}
              {error && <p className="text-red-500 text-xs -mt-2">{error}</p>}

              {/* Wallet Points */}
              {walletBalance > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-800">🪙 Wallet Points</span>
                    <span className="text-xs font-bold text-amber-700">{walletBalance} pts = ₹{walletBalance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={walletBalance}
                      value={pointsToRedeem}
                      onChange={e => setPointsToRedeem(Math.max(0, Math.min(walletBalance, parseInt(e.target.value) || 0)))}
                      className="w-24 px-2 py-1.5 text-xs border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-400 focus:outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setPointsToRedeem(pointsToRedeem > 0 ? 0 : Math.min(walletBalance, Math.floor((cartTotal - discount) * 0.5)))}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors font-medium"
                    >
                      {pointsToRedeem > 0 ? 'Remove' : 'Use Max'}
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-600 mt-1.5">Max 50% of order value redeemable</p>
                </div>
              )}

              {/* Price breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Coupon ({cart?.coupon?.code})</span>
                    <span>− ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {walletDiscount > 0 && (
                  <div className="flex justify-between text-sm text-amber-600 font-medium">
                    <span>Wallet ({pointsToRedeem} pts)</span>
                    <span>− ₹{walletDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-black text-slate-900">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Sticky checkout button at bottom */}
            <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
              <Button href="#/checkout" variant="primary" size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartView;
