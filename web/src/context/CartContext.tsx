
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as apiService from '../services/api';
import { useAuth } from './AuthContext';
import { Cart, CartItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  checkout: (shippingDetails: any) => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  finalTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [, setStoreName] = useState('Qurion Tech');
  const [, setStoreLogo] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await apiService.fetchSettings();
        if (settings.taxRate) setTaxRate(parseFloat(settings.taxRate));
        if (settings.storeName) setStoreName(settings.storeName);
        if (settings.storeLogo) setStoreLogo(settings.storeLogo);
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    loadSettings();
  }, []);

  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const cartData = await apiService.getCart();
        setCart(cartData);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCart(null);
      } finally {
        setLoading(false);
      }
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number) => {
    const updatedCart = await apiService.addItemToCart(productId, quantity);
    setCart(updatedCart);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    const updatedCart = await apiService.updateCartItem(cartItemId, quantity);
    setCart(updatedCart);
  };

  const removeFromCart = async (cartItemId: string) => {
    const updatedCart = await apiService.removeCartItem(cartItemId);
    setCart(updatedCart);
  };

  const applyCoupon = async (couponCode: string) => {
    const updatedCart = await apiService.applyCoupon(couponCode);
    setCart(updatedCart);
  };

  const checkout = async (shippingDetails: any) => {
    try {
      // 1. Call backend to initiate PhonePe payment AND Create Pending Order with Address
      const { redirectUrl } = await apiService.initiatePhonePeCheckout(shippingDetails);

      // 2. Redirect the user to the PhonePe payment page
      window.location.href = redirectUrl;

      // Note: The promise may not resolve if the redirect happens immediately.
    } catch (error: any) {
      console.error("Failed to initiate PhonePe checkout:", error);
      throw new Error(error.message || 'Could not start the payment process.');
    }
  };

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  let discount = 0;
  if (cart?.coupon) {
    if (cart.coupon.discountType === 'PERCENTAGE') {
      discount = (cartTotal * cart.coupon.discountValue) / 100;
    } else {
      discount = cart.coupon.discountValue;
    }
  }

  const subTotalAfterDiscount = Math.max(0, cartTotal - discount);
  const tax = (subTotalAfterDiscount * taxRate) / 100;
  const finalTotal = subTotalAfterDiscount + tax;

  const value = {
    cart,
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    checkout,
    refreshCart,
    cartCount,
    cartTotal,
    discount,
    tax,
    taxRate,
    finalTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
