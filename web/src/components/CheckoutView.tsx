import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Button from './UIElements/Button';
import EmailVerificationBanner from './EmailVerificationBanner';
import { getImageUrl } from '../utils/imageUtils';
import * as apiService from '../services/api';

interface CheckoutViewProps {
  onLoginRedirect: () => void;
  showNotification: (message: string) => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ onLoginRedirect, showNotification }) => {
  const { cartItems, finalTotal, tax, taxRate, checkout } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name || '', email: user.email }));

      // Fetch addresses for authenticated users
      const loadAddresses = async () => {
        try {
          const savedAddresses = await apiService.fetchAddresses();
          setAddresses(savedAddresses);
          // Auto-select default if exists
          const defaultAddr = savedAddresses.find((a: any) => a.isDefault);
          if (defaultAddr) {
            selectAddress(defaultAddr);
          }
        } catch (e) {
          console.error("Failed to load addresses at checkout", e);
        }
      };
      loadAddresses();
    }
  }, [user]);

  const selectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFormData({
      name: addr.name || user?.name || '',
      address: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone
    });
  };

  useEffect(() => {
    if (isAuthenticated && cartItems.length === 0) {
      window.location.hash = '#/cart';
    }
  }, [cartItems, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // If user edits manually, clear selection
    if (selectedAddressId) setSelectedAddressId('');
  }

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation for Indian Mobile Numbers (Start with 6-9, 10 digits)
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      showNotification("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // Validation for 6-digit Pincode
    if (!/^\d{6}$/.test(formData.pincode)) {
      showNotification("Please enter a valid 6-digit Pincode.");
      return;
    }

    setIsProcessing(true);
    try {
      // Pass shipping details to the checkout function
      await checkout(formData);
    } catch (error: any) {
      showNotification(`Order failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Please Log In</h1>
        <p className="mt-2 text-slate-600">You need to be logged in to proceed to checkout.</p>
        <Button onClick={onLoginRedirect} variant="primary" size="lg" className="mt-6">
          Go to Login
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  if (!user?.isVerified) {
    return (
      <div className="py-20 max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
        <EmailVerificationBanner mode="block" />
        <p className="text-center text-sm text-slate-500">Once verified, come back here to complete your order. Your cart is saved.</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

          {/* Address Selection UI */}
          {addresses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Saved Addresses:</h3>
              <div className="grid grid-cols-1 gap-3">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => selectAddress(addr)}
                    className={`p-3 border rounded-md cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-slate-200 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{addr.type} <span className="font-normal text-slate-500">- {addr.name}</span></span>
                      {selectedAddressId === addr.id && <span className="text-xs font-bold text-primary">Selected</span>}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {addr.street}, {addr.city}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-50 px-2 text-slate-500">Or enter new address</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleProceedToPayment} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="House No, Street, Colony"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-slate-700">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  placeholder="e.g. 110001"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-sm border-r border-slate-300 pr-2 bg-slate-50 rounded-l-md">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    title="Ten digit mobile number"
                    className="block w-full pl-14 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full !mt-6" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
          <h2 className="text-xl font-semibold border-b pb-4 mb-4">Your Order</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <img src={getImageUrl(item.product.imageUrl)} alt={item.product.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                  <div>
                    <p className="font-medium text-slate-800">{item.product.name}</p>
                    <p className="text-slate-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-slate-600">₹{(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-4 space-y-2">
            {tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <p>Tax ({taxRate}%)</p>
                <p>₹{tax.toFixed(2)}</p>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-primary">
              <p>Total Payable</p>
              <p>₹{finalTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
