// A central place for all frontend type definitions

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images: string[];
  stock: number;
  category: Category;
  categoryId: string;
  sku?: string;
  specifications?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  salePrice?: number;
  saleEndsAt?: string;
  variants?: ProductVariant[];
}

export type StaffPermissions = {
  orders?: boolean;
  products?: boolean;
  categories?: boolean;
  users?: boolean;
  coupons?: boolean;
  settings?: boolean;
  blog?: boolean;
  slides?: boolean;
};

export interface User {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  role?: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  permissions?: StaffPermissions | null;
  walletBalance?: number;
  referralCode?: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  points: number;
  description: string;
  orderId?: string | null;
  createdAt: string;
}

export interface AdminUser extends User {
  createdAt: string;
}

export interface StaffUser {
  id: string;
  name: string | null;
  email: string;
  role: 'STAFF' | 'ADMIN';
  isAdmin: boolean;
  permissions: StaffPermissions | null;
  createdAt: string;
}

export interface Category {
  id:string;
  name: string;
  slug: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  metaTitle?: string;
  metaDescription?: string;
}

export interface HomeSlide {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  order: number;
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    expiryDate: string | null;
    usageLimit: number | null;
    perUserLimit: number | null;
    timesUsed: number;
    minCartValue: number | null;
    createdAt: string;
}

export interface Setting {
    id: string;
    key: string;
    value: string;
}

// Represents an item within a cart, matching the backend structure
export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
  variantId?: string | null;
  variantName?: string | null;
  variant?: ProductVariant | null;
}

// Represents the full cart object from the backend
export interface Cart {
  id: string;
  items: CartItem[];
  appliedCouponId?: string | null;
  coupon?: Coupon | null;
}

// Represents an item within an order
export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
  variantId?: string | null;
  variantName?: string | null;
}

// Represents a full order object from the backend
export interface Order {
  id: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  items: OrderItem[];
  user: {
      id: string;
      name: string | null;
      email: string;
  }
  trackingNumber?: string;
  discountAmount?: number;
  couponCode?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  walletDiscount?: number;
}

export interface Return {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  refundAmount: number | null;
  refundToWallet: boolean;
  adminNote: string | null;
  createdAt: string;
  order?: { id: string; totalAmount: number; createdAt: string };
  user?: { id: string; name: string | null; email: string };
}

// Fix: Add Endpoint type definition for use in API explorer components.
export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  isProtected: boolean;
  body?: string;
  routeCode: string;
  controllerCode: string;
  serviceCode: string;
  validationCode?: string;
}

// Fix: Add ApiCategory type definition for use in API explorer components.
export interface ApiCategory {
  name: string;
  basePath: string;
  endpoints: Endpoint[];
}

export interface BackendFile {
  path: string;
  code: string;
  language: 'typescript' | 'prisma' | 'json' | 'bash';
}

declare global {
  interface Window {
    // Razorpay is no longer used
  }
}
