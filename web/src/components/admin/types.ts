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
  | 'brands';

export type Toast = { id: number; message: string; type: 'success' | 'error' };

export type Period = 'today' | 'week' | 'month' | 'all';
