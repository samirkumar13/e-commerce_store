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

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'orders',
    label: 'My Orders',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    id: 'profile',
    label: 'Profile Settings',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    id: 'addresses',
    label: 'Address Book',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    id: 'reviews',
    label: 'Reviews & Ratings',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  },
];

const AccountView: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'orders') {
          setOrders(await apiService.getMyOrders());
        } else if (activeTab === 'reviews') {
          setReviews(await apiService.fetchMyReviews());
        }
      } catch {
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
    <div className="flex flex-1" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        {/* User info */}
        <div className="p-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-3">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          {user?.isVerified ? (
            <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 mt-2 text-xs text-amber-500 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Not verified
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              activeTab === item.id ? 'text-primary' : 'text-slate-400'
            }`}
          >
            {item.icon}
            {item.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
        <div className="flex-1 p-6 md:p-8 pb-20 md:pb-8">

          {/* Verification banner */}
          {!user?.isVerified && <EmailVerificationBanner mode="banner" />}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Order History</h2>
              {loading ? (
                <div className="text-center py-20 text-slate-400">Loading your orders…</div>
              ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: Order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-3">
                        <div>
                          <h3 className="font-semibold">Order <span className="font-mono text-sm text-slate-500">{order.trackingNumber || formatOrderId(order.id)}</span></h3>
                          <p className="text-xs text-slate-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-slate-800">₹{order.totalAmount.toFixed(2)}</span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700'
                            : order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700'
                            : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                          }`}>{order.status}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item: OrderItem) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <img src={getImageUrl(item.product.imageUrl)} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg border border-slate-100" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 truncate">{item.product.name}</p>
                              <p className="text-xs text-slate-400">Qty: {item.quantity} @ ₹{item.price.toFixed(2)}</p>
                              {order.status === 'DELIVERED' && (
                                <a href={`#/product/${item.product?.slug}#reviews`} className="text-primary text-xs hover:underline">Write Review</a>
                              )}
                            </div>
                            <p className="font-semibold text-slate-700 shrink-0">₹{(item.quantity * item.price).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-white">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <h3 className="text-lg font-bold text-slate-700">No orders yet</h3>
                  <p className="text-sm text-slate-400 mt-1">Your order history will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Reviews & Ratings</h2>
              {loading ? (
                <div className="text-center py-20 text-slate-400">Loading reviews…</div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex gap-4 mb-3">
                        <img src={getImageUrl(review.product.imageUrl)} alt={review.product.name} className="w-16 h-16 object-cover rounded-xl border border-slate-100" />
                        <div className="flex-1">
                          <a href={`#/product/${review.product.slug}`} className="font-semibold text-slate-800 hover:text-primary hover:underline">{review.product.name}</a>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} size={14} />
                            <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <a href={`#/product/${review.product.slug}#reviews`} className="text-xs text-primary hover:underline self-start">Edit</a>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-white">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  <h3 className="text-lg font-bold text-slate-700">No reviews yet</h3>
                  <p className="text-sm text-slate-400 mt-1">Reviews you write will appear here.</p>
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
