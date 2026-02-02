// This file centralizes all communication with the backend ADMIN API.

// Auto-detect API URL: use env var if set, otherwise detect production
const getApiUrl = () => {
    if (process.env.REACT_APP_API_URL) {
        return `${process.env.REACT_APP_API_URL}/admin`;
    }
    // For Local Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api/admin';
    }
    // For Production (VPS, Render, etc.) - Use relative path!
    return '/api/admin';
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

// --- Image Upload ---
// Note: These functions use FormData, not JSON, so we need a different fetch approach

const getUploadUrl = () => {
    if (process.env.REACT_APP_API_URL) {
        return `${process.env.REACT_APP_API_URL}/admin/upload`;
    }
    // For Local Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api/admin/upload';
    }
    // For Production
    return '/api/admin/upload';
};

/**
 * Upload a single image file
 * @param file - The image file to upload
 * @param type - The subfolder type (products, slides, etc.)
 * @returns The URL of the uploaded image
 */
export const uploadImage = async (file: File, type: string = 'products'): Promise<string> => {
    const token = window.localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication token not found.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${getUploadUrl()}?type=${type}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Note: Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.url;
};

/**
 * Upload multiple image files
 * @param files - Array of image files to upload
 * @param type - The subfolder type (products, slides, etc.)
 * @returns Array of uploaded image URLs
 */
export const uploadMultipleImages = async (files: File[], type: string = 'products'): Promise<string[]> => {
    const token = window.localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication token not found.');
    }

    const formData = new FormData();
    files.forEach(file => {
        formData.append('images', file);
    });

    const response = await fetch(`${getUploadUrl()}/multiple?type=${type}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.urls;
};

/**
 * Delete an uploaded image
 * @param url - The URL of the image to delete
 */
export const deleteUploadedImage = async (url: string): Promise<void> => {
    const token = window.localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication token not found.');
    }

    const response = await fetch(getUploadUrl(), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(errorData.message || `Delete failed with status ${response.status}`);
    }
};