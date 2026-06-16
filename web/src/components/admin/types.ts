export type AdminView =
  | 'dashboard'
  | 'slides'
  | 'categories'
  | 'products'
  | 'orders'
  | 'users'
  | 'staff'
  | 'coupons'
  | 'settings'
  | 'blogs'
  | 'videos'
  | 'brands'
  | 'faqs'
  | 'newsletter'
  | 'stock-notifications'
  | 'flash-sales'
  | 'csv-import'
  | 'wallet'
  | 'returns';

export type Toast = { id: number; message: string; type: 'success' | 'error' };

export type Period = 'today' | 'week' | 'month' | 'all';
