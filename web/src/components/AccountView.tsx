import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/api';
import { Order, OrderItem } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { formatOrderId } from '../utils/formatters';
import AddressBook from './AddressBook';
import ProfileSettings from './ProfileSettings';
import EmailVerificationBanner from './EmailVerificationBanner';

import StarRating from './StarRating';

type Tab = 'orders' | 'profile' | 'addresses' | 'reviews';


const AccountView: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); // Helper type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'orders') {
          const userOrders = await apiService.getMyOrders();
          setOrders(userOrders);
        } else if (activeTab === 'reviews') {
          const userReviews = await apiService.fetchMyReviews();
          setReviews(userReviews);
        }
      } catch (err: any) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <p className="text-slate-600 mb-4">Welcome back, {user?.name}!</p>
      {!user?.isVerified && <EmailVerificationBanner mode="banner" />}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {([
              { id: 'orders', label: 'My Orders' },
              { id: 'profile', label: 'Profile Settings' },
              { id: 'addresses', label: 'Address Book' },
              { id: 'reviews', label: 'Reviews & Ratings' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
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
                            {order.status === 'DELIVERED' && (
                              <a
                                href={`#/product/${item.product?.slug}#reviews`}
                                className="text-primary hover:text-primary-dark text-xs underline mt-1 inline-block"
                              >
                                Write Review
                              </a>
                            )}
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

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">My Reviews & Ratings</h2>
              {loading ? (
                <div className="text-center py-20">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <div className="grid gap-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <img src={getImageUrl(review.product.imageUrl)} alt={review.product.name} className="w-20 h-20 object-cover rounded-md border" />
                          <div>
                            <a href={`#/product/${review.product.slug}`} className="font-semibold text-lg text-slate-800 hover:text-primary hover:underline">{review.product.name}</a>
                            <div className="flex items-center mt-1">
                              <StarRating rating={review.rating} size={16} />
                              <span className="ml-2 text-sm text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`#/product/${review.product.slug}#reviews`} className="text-sm font-medium text-blue-600 hover:underline">Edit</a>
                        </div>
                      </div>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-md">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg bg-slate-50">
                  <h2 className="text-xl font-bold text-slate-800">No Reviews Yet</h2>
                  <p className="mt-2 text-slate-600">You haven't rated any products yet.</p>
                  <button onClick={() => setActiveTab('orders')} className="mt-4 text-primary font-medium hover:underline">Go to Orders</button>
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
