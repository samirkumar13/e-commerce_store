
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

const LOCAL_CART_KEY = 'guest_cart';

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

  // Helper to get local cart
  const getLocalCart = (): Cart => {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { id: 'local-guest', items: [] };
  };

  // Helper to save local cart
  const saveLocalCart = (newCart: Cart) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(newCart));
    setCart(newCart);
  };

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
      // Load from local storage for guest
      setCart(getLocalCart());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      const updatedCart = await apiService.addItemToCart(productId, quantity);
      setCart(updatedCart);
    } else {
      // Guest Mode
      const currentCart = getLocalCart();
      const existingItemIndex = currentCart.items.findIndex(item => item.product.id === productId);

      if (existingItemIndex > -1) {
        currentCart.items[existingItemIndex].quantity += quantity;
      } else {
        try {
          const product = await apiService.fetchProductById(productId);
          const newItem: CartItem = {
            id: `local-item-${Date.now()}`,
            quantity: quantity,
            product: product
          };
          currentCart.items.push(newItem);
        } catch (err) {
          console.error("Failed to fetch product for guest cart", err);
          return; // Abort if product fetch fails
        }
      }
      saveLocalCart(currentCart);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (isAuthenticated) {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      const updatedCart = await apiService.updateCartItem(cartItemId, quantity);
      setCart(updatedCart);
    } else {
      // Guest Mode
      const currentCart = getLocalCart();
      if (quantity <= 0) {
        currentCart.items = currentCart.items.filter(item => item.id !== cartItemId);
      } else {
        const item = currentCart.items.find(item => item.id === cartItemId);
        if (item) item.quantity = quantity;
      }
      saveLocalCart(currentCart);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (isAuthenticated) {
      const updatedCart = await apiService.removeCartItem(cartItemId);
      setCart(updatedCart);
    } else {
      // Guest Mode
      const currentCart = getLocalCart();
      currentCart.items = currentCart.items.filter(item => item.id !== cartItemId);
      saveLocalCart(currentCart);
    }
  };

  const applyCoupon = async (couponCode: string) => {
    if (isAuthenticated) {
      const updatedCart = await apiService.applyCoupon(couponCode);
      setCart(updatedCart);
    } else {
      console.warn("Coupons not supported for gueest yet");
      // Could implement client-side coupon check if we expose coupons API publicly
    }
  };

  const checkout = async (shippingDetails: any) => {
    if (!isAuthenticated) {
      // Redirect to Login if trying to checkout as guest (Simple flow)
      window.location.hash = '#/login';
      return;
    }

    try {
      const { redirectUrl } = await apiService.initiatePhonePeCheckout(shippingDetails);
      window.location.href = redirectUrl;
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
