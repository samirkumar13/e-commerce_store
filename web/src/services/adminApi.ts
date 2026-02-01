// This file centralizes all communication with the backend ADMIN API.

// Auto-detect API URL: use env var if set, otherwise detect production
const getApiUrl = () => {
    if (process.env.REACT_APP_API_URL) {
        return `${process.env.REACT_APP_API_URL}/admin`;
    }
    // In production on Render, detect from hostname
    if (window.location.hostname.includes('onrender.com')) {
        return 'https://circuithub-api.onrender.com/api/admin';
    }
    return 'http://localhost:5000/api/admin';
};

const API_BASE_URL = getApiUrl();

// Re-usable helper function for authenticated API requests
async function adminApiFetch(endpoint: string, options: RequestInit = {}) {
    const token = window.localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        // If no token, we shouldn't even be trying to call admin routes
        throw new Error('Authentication token not found.');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred' }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    if (response.status === 204) return; // Handle No Content responses

    return response.json();
}

// --- Dashboard ---
export const getStats = (period: 'today' | 'week' | 'month' | 'all' = 'all') => adminApiFetch(`/stats?period=${period}`);
export const getLowStockProducts = (threshold: number) => adminApiFetch(`/products/low-stock?threshold=${threshold}`);

// --- Users ---
export const getUsers = () => adminApiFetch('/users');
export const updateUser = (userId: string, userData: any) => adminApiFetch(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
});
export const deleteUser = (userId: string) => adminApiFetch(`/users/${userId}`, { method: 'DELETE' });

// --- Products ---
export const getProducts = () => adminApiFetch('/products');
export const createProduct = (productData: any) => adminApiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
});
export const updateProduct = (productId: string, productData: any) => adminApiFetch(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
});
export const deleteProduct = (productId: string) => adminApiFetch(`/products/${productId}`, { method: 'DELETE' });

// --- Categories ---
export const getCategories = () => adminApiFetch('/categories');
export const createCategory = (categoryData: any) => adminApiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData)
});
export const updateCategory = (categoryId: string, categoryData: any) => adminApiFetch(`/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData)
});
export const deleteCategory = (categoryId: string) => adminApiFetch(`/categories/${categoryId}`, { method: 'DELETE' });


// --- Home Slides ---
export const getSlides = () => adminApiFetch('/slides');
export const createSlide = (slideData: any) => adminApiFetch('/slides', {
    method: 'POST',
    body: JSON.stringify(slideData)
});
export const updateSlide = (slideId: string, slideData: any) => adminApiFetch(`/slides/${slideId}`, {
    method: 'PUT',
    body: JSON.stringify(slideData)
});
export const deleteSlide = (slideId: string) => adminApiFetch(`/slides/${slideId}`, { method: 'DELETE' });

// --- Orders ---
export const getOrders = () => adminApiFetch('/orders');
export const updateOrder = (orderId: string, orderData: any) => adminApiFetch(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(orderData)
});

// --- Coupons ---
export const getCoupons = () => adminApiFetch('/coupons');
export const createCoupon = (couponData: any) => adminApiFetch('/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData)
});
export const updateCoupon = (couponId: string, couponData: any) => adminApiFetch(`/coupons/${couponId}`, {
    method: 'PUT',
    body: JSON.stringify(couponData)
});
export const deleteCoupon = (couponId: string) => adminApiFetch(`/coupons/${couponId}`, { method: 'DELETE' });

// --- Settings ---
export const getSettings = () => adminApiFetch('/settings');
export const updateSettings = (settingsData: any) => adminApiFetch('/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings: settingsData })
});