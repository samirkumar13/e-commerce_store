// Build: 2026-02-01T12:55
// This file centralizes all communication with the backend API.

// Auto-detect API URL: use env var if set, otherwise detect production
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // For Local Development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // For Production (VPS, Render, etc.) - Use relative path!
  // This automatically handles HTTPS and domains correctly.
  return '/api';
};

const API_BASE_URL = getApiUrl();

// A helper function to handle all fetch requests, including headers and error handling.
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = window.localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred' }));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  // Handle responses that might not have a body (e.g., a 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return; // Return nothing for non-JSON responses
  }
}

// --- Product API ---
interface ProductsParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const fetchProducts = (params?: ProductsParams) => {
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  return apiFetch(`/products${queryString ? `?${queryString}` : ''}`);
};
export const fetchProductById = (id: string) => apiFetch(`/products/${id}`);
export const checkDeliveryServiceability = (pincode: string) =>
  apiFetch('/products/serviceability', {
    method: 'POST',
    body: JSON.stringify({ pincode })
  });

// --- Category API ---
export const fetchCategories = () => apiFetch('/categories');

// --- Slides API ---
export const fetchHomeSlides = () => apiFetch('/slides');


// --- Auth API ---
export const loginUser = (credentials: { email: string; password: string; }) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const registerUser = (userInfo: { name: string; email: string; password: string; }) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userInfo),
  });

export const getMe = () => apiFetch('/auth/me');

// --- Cart API ---
export const getCart = () => apiFetch('/cart');
export const addItemToCart = (productId: string, quantity: number) =>
  apiFetch('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
export const updateCartItem = (cartItemId: string, quantity: number) =>
  apiFetch(`/cart/update/${cartItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
export const removeCartItem = (cartItemId: string) =>
  apiFetch(`/cart/remove/${cartItemId}`, {
    method: 'DELETE',
  });
export const applyCoupon = (couponCode: string) =>
  apiFetch('/cart/apply-coupon', {
    method: 'POST',
    body: JSON.stringify({ couponCode }),
  });

// --- Wishlist API ---
export const getWishlist = () => apiFetch('/wishlist');
export const addToWishlist = (productId: string) =>
  apiFetch('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
export const removeFromWishlist = (productId: string) =>
  apiFetch(`/wishlist/remove/${productId}`, {
    method: 'DELETE',
  });


// --- Order API ---
export const initiatePhonePeCheckout = (shippingDetails: any) =>
  apiFetch('/orders/initiate-phonepe', {
    method: 'POST',
    body: JSON.stringify({ shippingDetails }),
  });

export const verifyPhonePePayment = (transactionId: string) =>
  apiFetch(`/orders/phonepe-status/${transactionId}`, {
    method: 'GET',
  });

// New function to get the current user's order history
// New function to get the current user's order history
export const getMyOrders = () => apiFetch('/orders');

// --- Address API ---
export const fetchAddresses = () => apiFetch('/addresses');
export const addAddress = (data: any) =>
  apiFetch('/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateAddress = (id: string, data: any) =>
  apiFetch(`/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
export const deleteAddress = (id: string) =>
  apiFetch(`/addresses/${id}`, {
    method: 'DELETE',
  });

// --- Profile API ---
export const updateProfile = (data: any) =>
  apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });

export const changePassword = (data: any) =>
  apiFetch('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(data)
  });

// --- Review API ---
export const fetchProductReviews = (productId: string) => apiFetch(`/reviews/${productId}`);
export const addReview = (data: { productId: string; rating: number; comment: string }) =>
  apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateReview = (id: string, data: { rating: number; comment: string }) =>
  apiFetch(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
export const deleteReview = (id: string) =>
  apiFetch(`/reviews/${id}`, {
    method: 'DELETE',
  });
export const checkReviewEligibility = (productId: string) => apiFetch(`/reviews/eligibility/${productId}`);
export const fetchMyReviews = () => apiFetch('/reviews/my/all');

// --- Settings API ---
export const fetchSettings = () => apiFetch('/settings');
export const updateSetting = (key: string, value: string) =>
  apiFetch(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });

// Blog, Video, Brand
export const fetchBlogs = (limit?: number, type?: string) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (type) params.append('type', type);
  const qs = params.toString();
  return apiFetch(`/blogs${qs ? `?${qs}` : ''}`);
};
export const fetchVideos = (type?: string) => apiFetch(`/videos${type ? `?type=${type}` : ''}`);
export const fetchBrands = () => apiFetch('/brands');
