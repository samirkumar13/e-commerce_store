import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/api';
import { Order, OrderItem } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { formatOrderId } from '../utils/formatters';
import AddressBook from './AddressBook';
import ProfileSettings from './ProfileSettings';

type Tab = 'orders' | 'profile' | 'addresses';

const AccountView: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const userOrders = await apiService.getMyOrders();
          setOrders(userOrders);
        } catch (err: any) {
          setError('Failed to fetch orders.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Please Log In</h1>
        <p className="mt-2 text-slate-600">You need to be logged in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">My Account</h1>
      <p className="text-slate-600 mb-8">Welcome back, {user?.name}!</p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'addresses' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Address Book
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === 'orders' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">Order History</h2>
              {loading ? (
                <div className="text-center py-20">Loading your orders...</div>
              ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
              ) : orders.length > 0 ? (
                orders.map((order: Order) => (
                  <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-4">
                      <div>
                        <h2 className="font-semibold text-lg">Order <span className="font-mono text-sm text-slate-600">{order.trackingNumber || formatOrderId(order.id)}</span></h2>
                        <p className="text-sm text-slate-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-lg">₹{order.totalAmount.toFixed(2)}</p>
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">{order.status}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-center">
                          <img src={getImageUrl(item.product.imageUrl)} alt={item.product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                          <div className="flex-grow">
                            <p className="font-semibold">{item.product.name}</p>
                            <p className="text-sm text-slate-500">Qty: {item.quantity} @ ₹{item.price.toFixed(2)}</p>
                          </div>
                          <p className="font-semibold text-slate-700">₹{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg bg-slate-50">
                  <h2 className="text-xl font-bold text-slate-800">No Orders Found</h2>
                  <p className="mt-2 text-slate-600">You haven't placed any orders yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'addresses' && <AddressBook />}
        </div>
      </div>
    </div>
  );
};

export default AccountView;