
import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Button from './UIElements/Button';

interface CheckoutViewProps {
  onLoginRedirect: () => void;
  showNotification: (message: string) => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ onLoginRedirect, showNotification }) => {
  const { cartItems, finalTotal, tax, taxRate, checkout } = useCart();
  const { isAuthenticated, user } = useAuth();
  
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
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && cartItems.length === 0) {
      window.location.hash = '#/cart';
    }
  }, [cartItems, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
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

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
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
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 object-cover rounded-md mr-3" />
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
