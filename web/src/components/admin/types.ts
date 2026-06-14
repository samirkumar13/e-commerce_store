export type AdminView =
  | 'dashboard'
  | 'slides'
  | 'categories'
  | 'products'
  | 'orders'
  | 'users'
  | 'coupons'
  | 'settings'
  | 'blogs'
  | 'videos'
  | 'brands'
  | 'faqs'
  | 'newsletter'
  | 'stock-notifications';

export type Toast = { id: number; message: string; type: 'success' | 'error' };

export type Period = 'today' | 'week' | 'month' | 'all';
