import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import Button from './UIElements/Button';
import { CartItem } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { fetchActiveCoupons } from '../services/api';

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product } = item;

  return (
    <div className="flex items-center py-4 border-b border-slate-200">
      <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
      <div className="ml-4 flex-grow">
        <h3 className="font-semibold text-slate-800">{product.name}</h3>
        <p className="text-sm text-slate-500">₹{product.price.toFixed(2)}</p>
        <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
      </div>
      <div className="flex items-center border border-slate-300 rounded-md">
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded-l-md">-</button>
        <input type="text" value={item.quantity} readOnly className="w-10 text-center text-sm border-none focus:ring-0" />
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded-r-md">+</button>
      </div>
      <div className="ml-4 w-24 text-right font-semibold">
        ₹{(product.price * item.quantity).toFixed(2)}
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

const CartView: React.FC = () => {
  const { cart, cartItems, cartTotal, applyCoupon, discount, finalTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>([]);

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
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-slate-600">Looks like you haven't added anything to your cart yet.</p>
        <Button href="#/" variant="primary" size="lg" className="mt-6">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          {cartItems.map(item => <CartItemRow key={item.id} item={item} />)}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-bold border-b pb-4">Order Summary</h2>

            {activeCoupons.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Available Coupons</p>
                <div className="flex flex-col gap-2">
                  {activeCoupons.map(coupon => {
                    const eligible = coupon.minCartValue === null || cartTotal >= coupon.minCartValue;
                    const applied = cart?.coupon?.code === coupon.code;
                    return (
                      <button
                        key={coupon.code}
                        onClick={() => eligible && !applied && handleApplyCouponCode(coupon.code)}
                        disabled={!eligible || applied}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          applied
                            ? 'border-green-400 bg-green-50 text-green-700 cursor-default'
                            : eligible
                            ? 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer'
                            : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="font-bold">{coupon.code}</span>
                        <span className="ml-2 text-xs">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}% off`
                            : `₹${coupon.discountValue} off`}
                        </span>
                        {!eligible && coupon.minCartValue && (
                          <span className="block text-xs mt-0.5 text-slate-400">Min. ₹{coupon.minCartValue}</span>
                        )}
                        {applied && <span className="ml-2 text-xs font-medium">✓ Applied</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon Code"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <Button type="submit" variant="secondary" size="md">Apply</Button>
            </form>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <p>Subtotal</p>
                <p>₹{cartTotal.toFixed(2)}</p>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <p>Discount ({cart?.coupon?.code})</p>
                  <p>- ₹{discount.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <div className="flex justify-between mt-2 font-bold text-lg border-t pt-4">
                <p>Total</p>
                <p>₹{finalTotal.toFixed(2)}</p>
              </div>
            </div>

            <Button href="#/checkout" variant="primary" size="lg" className="w-full mt-6">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;