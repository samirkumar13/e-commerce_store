
import React, { useState, useEffect, useCallback } from 'react';
import { Product, AdminUser, Category, HomeSlide, Order, Coupon, Setting } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from './UIElements/Button';
import ImageUploader from './ImageUploader';
import * as adminApi from '../services/adminApi';
import { getImageUrl } from '../utils/imageUtils';

// --- TYPES ---
type AdminView = 'dashboard' | 'slides' | 'categories' | 'products' | 'orders' | 'users' | 'coupons' | 'settings';
type Toast = { id: number; message: string; type: 'success' | 'error' };
type Period = 'today' | 'week' | 'month' | 'all';

// --- ICONS ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const SlidesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15h16" /></svg>;
const CategoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h-2M5 11H3" /></svg>;
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const OrderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2m8-2l2 2m-2-2v4a1 1 0 01-1 1h-2.586a1 1 0 01-.707-.293l-2-2.414a1 1 0 00-.707-.293H3.293a1 1 0 00-.707.293l-2.414 2.414A1 1 0 010 16.586V6a1 1 0 011-1h12a1 1 0 011 1v10z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.978 5.978 0 0112 13a5.979 5.979 0 013 1.003m-3-1.003A4.002 4.002 0 0112 4.354" /></svg>;
const CouponIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.978 5.978 0 0112 13a5.979 5.979 0 013 1.003m-3-1.003A4.002 4.002 0 0112 4.354" /></svg>;
const ProductsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2m8-2l2 2m-2-2v4a1 1 0 01-1 1h-2.586a1 1 0 01-.707-.293l-2-2.414a1 1 0 00-.707-.293H3.293a1 1 0 00-.707.293l-2.414 2.414A1 1 0 010 16.586V6a1 1 0 011-1h12a1 1 0 011 1v10z" /></svg>;
const CategoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h-2M5 11H3" /></svg>;


// --- ADMIN SUB-COMPONENTS (VIEWS) ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const LowStockWidget: React.FC<{ products: Product[]; onEdit: (p: Product) => void; threshold: number; onThresholdChange: (t: number) => void; }> = ({ products, onEdit, threshold, onThresholdChange }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto max-w-sm">
                <label htmlFor="stockThreshold" className="text-sm font-medium text-slate-600 whitespace-nowrap">Threshold: <span className="font-bold text-primary">{threshold}</span></label>
                <input
                    id="stockThreshold"
                    type="range"
                    min="0"
                    max="50"
                    value={threshold}
                    onChange={(e) => onThresholdChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

        {products.length > 0 ? (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
                {products.map(p => (
                    <li key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-50">
                        <div>
                            <p className="font-medium text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.category.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>{p.stock} left</span>
                            <button onClick={() => onEdit(p)} className="font-medium text-blue-600 hover:underline text-xs">Manage</button>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-500 text-center py-8">No products are below the selected threshold. Great job!</p>
        )}
    </div>
);

const DashboardView: React.FC<{
    stats: any;
    lowStockProducts: Product[];
    period: Period;
    setPeriod: (p: Period) => void;
    onEditProduct: (p: Product) => void;
    lowStockThreshold: number;
    onThresholdChange: (t: number) => void;
}> = ({ stats, lowStockProducts, period, setPeriod, onEditProduct, lowStockThreshold, onThresholdChange }) => (
    <div className="space-y-8">
        <div className="flex justify-end items-center gap-2">
            {(['today', 'week', 'month', 'all'] as Period[]).map(p => (
                <Button key={p} onClick={() => setPeriod(p)} variant={period === p ? 'primary' : 'secondary'} size="sm" className="capitalize">{p}</Button>
            ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.users} icon={<UsersIcon />} color="bg-blue-100 text-blue-600" />
            <StatCard title="Total Orders" value={stats.orders} icon={<OrdersIcon />} color="bg-green-100 text-green-600" />
            <StatCard title="Total Products" value={stats.products} icon={<ProductsIcon />} color="bg-yellow-100 text-yellow-600" />
            <StatCard title="Total Categories" value={stats.categories} icon={<CategoriesIcon />} color="bg-indigo-100 text-indigo-600" />
        </div>
        <LowStockWidget products={lowStockProducts} onEdit={onEditProduct} threshold={lowStockThreshold} onThresholdChange={onThresholdChange} />
    </div>
);

const SlidesView: React.FC<{ slides: HomeSlide[]; onAdd: () => void; onEdit: (s: HomeSlide) => void; onDelete: (id: string) => void; }> = ({ slides, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Home Slides Management</h2>
            <Button onClick={onAdd} variant="primary">Add New Slide</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 font-medium">Slide</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {slides.map(slide => (
                        <tr key={slide.id}>
                            <td className="px-4 py-3 flex items-center">
                                <img src={getImageUrl(slide.imageUrl)} alt={slide.title} className="w-24 h-12 object-cover rounded-md mr-3" />
                                <span className="font-medium text-slate-800">{slide.title}</span>
                            </td>
                            <td className="px-4 py-3">{slide.order}</td>
                            <td className="px-4 py-3">{slide.status}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(slide)} className="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                                <button onClick={() => onDelete(slide.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CategoriesView: React.FC<{ categories: Category[]; onAdd: () => void; onEdit: (c: Category) => void; onDelete: (id: string) => void; }> = ({ categories, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Category Management</h2>
            <Button onClick={onAdd} variant="primary">Add New Category</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 font-medium">Category Name</th>
                        <th className="px-4 py-3 font-medium">Slug</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {categories.map(cat => (
                        <tr key={cat.id}>
                            <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                            <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                            <td className="px-4 py-3">{cat.status}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(cat)} className="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                                <button onClick={() => onDelete(cat.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ProductsView: React.FC<{ products: Product[]; categories: Category[]; onAdd: () => void; onEdit: (p: Product) => void; onDelete: (id: string) => void; }> = ({ products, categories, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? product.categoryId === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold">Product Management</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="border p-2 rounded-md text-sm w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="border p-2 rounded-md text-sm w-full md:w-48"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Button onClick={onAdd} variant="primary" className="whitespace-nowrap">Add Product</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 font-medium">Product Name</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Price</th>
                            <th className="px-4 py-3 font-medium">Stock</th>
                            <th className="px-4 py-3 font-medium text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="px-4 py-3 flex items-center">
                                        <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                                        <span className="font-medium text-slate-800">{product.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{product.category?.name || 'N/A'}</td>
                                    <td className="px-4 py-3">₹{product.price.toFixed(2)}</td>
                                    <td className="px-4 py-3">{product.stock}</td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <button onClick={() => onEdit(product)} className="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                                        <button onClick={() => onDelete(product.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No products found matching your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrdersView: React.FC<{ orders: Order[], onEdit: (o: Order) => void, onViewInvoice: (o: Order) => void }> = ({ orders, onEdit, onViewInvoice }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-xl font-semibold mb-6">Order Management</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 font-medium">Order ID</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="px-4 py-3 font-mono text-xs">{order.trackingNumber || order.id}</td>
                            <td className="px-4 py-3">{order.user?.name || order.user?.email}</td>
                            <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">₹{order.totalAmount.toFixed(2)}</td>
                            <td className="px-4 py-3">
                                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">{order.status}</span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(order)} className="font-medium text-blue-600 hover:underline mr-4">Manage</button>
                                <button onClick={() => onViewInvoice(order)} className="font-medium text-indigo-600 hover:underline">Invoice</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const UsersView: React.FC<{ users: AdminUser[], onEdit: (u: AdminUser) => void, onDelete: (id: string) => void }> = ({ users, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-xl font-semibold mb-6">User Management</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Registration Date</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-4 py-3">
                                <div>
                                    <p className="font-medium text-slate-800">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </td>
                            <td className="px-4 py-3">{user.isAdmin ? 'Admin' : 'Customer'}</td>
                            <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(user)} className="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                                <button onClick={() => onDelete(user.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CouponsView: React.FC<{ coupons: Coupon[], onAdd: () => void, onEdit: (c: Coupon) => void, onDelete: (id: string) => void }> = ({ coupons, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Coupon Management</h2>
            <Button onClick={onAdd} variant="primary">Add New Coupon</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 font-medium">Code</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Value</th>
                        <th className="px-4 py-3 font-medium">Usage</th>
                        <th className="px-4 py-3 font-medium">Expires</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {coupons.map(coupon => (
                        <tr key={coupon.id}>
                            <td className="px-4 py-3 font-mono text-xs bg-slate-50 rounded-md">{coupon.code}</td>
                            <td className="px-4 py-3">{coupon.discountType}</td>
                            <td className="px-4 py-3">{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                            <td className="px-4 py-3">{coupon.timesUsed} / {coupon.usageLimit || '∞'}</td>
                            <td className="px-4 py-3">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(coupon)} className="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                                <button onClick={() => onDelete(coupon.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const SettingsView: React.FC<{ settings: Setting[], onSave: (settings: Setting[]) => void }> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as { [key: string]: string });
        setFormData(settingsMap);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const settingsPayload = Object.keys(formData).map(key => ({ key, value: formData[key] }));
        // We filter out settings that don't have an ID because the backend expects existing settings
        onSave(settingsPayload.map(s => {
            const originalSetting = settings.find(os => os.key === s.key);
            return { ...s, id: originalSetting?.id || '' };
        }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-6">Store Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Name</label>
                    <input name="storeName" value={formData.storeName || ''} onChange={handleChange} className="w-full border p-2 rounded-md mt-1" />
                </div>

                {/* Store Logo Upload */}
                <ImageUploader
                    currentImage={formData.storeLogo}
                    onUpload={(url) => setFormData(prev => ({ ...prev, storeLogo: url }))}
                    uploadType="settings"
                    label="Store Logo"
                    placeholder="Click to upload or drag and drop your store logo"
                />

                {/* Favicon Upload */}
                <ImageUploader
                    currentImage={formData.storeFavicon}
                    onUpload={(url) => setFormData(prev => ({ ...prev, storeFavicon: url }))}
                    uploadType="settings"
                    label="Favicon"
                    placeholder="Click to upload or drag and drop favicon (recommended: 32x32)"
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700">Tax Rate (GST %)</label>
                    <input name="taxRate" type="number" step="0.01" value={formData.taxRate || ''} onChange={handleChange} className="w-full border p-2 rounded-md mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Description (for SEO)</label>
                    <textarea name="storeDescription" value={formData.storeDescription || ''} onChange={handleChange} className="w-full border p-2 rounded-md mt-1" rows={3} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Email</label>
                    <input name="storeEmail" type="email" value={formData.storeEmail || ''} onChange={handleChange} className="w-full border p-2 rounded-md mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Phone</label>
                    <input name="storePhone" value={formData.storePhone || ''} onChange={handleChange} className="w-full border p-2 rounded-md mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Address</label>
                    <input name="storeAddress" value={formData.storeAddress || ''} onChange={handleChange} className="w-full border p-2 rounded-md mt-1" />
                </div>
                <div className="pt-4">
                    <Button type="submit" variant="primary">Save Settings</Button>
                </div>
            </form>
        </div>
    );
};

// --- SIDEBAR COMPONENT ---
const NavItem: React.FC<{ view: AdminView; label: string; icon: React.ReactNode; currentView: AdminView; setView: (view: AdminView) => void; }> = ({ view, label, icon, currentView, setView }) => {
    const isActive = currentView === view;
    return (
        <li>
            <button
                onClick={() => setView(view)}
                className={`w-full flex items-center p-3 text-base font-normal rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary text-white' : 'text-slate-200 hover:bg-slate-700'
                    }`}
            >
                {icon}
                <span className="ml-3 hidden md:inline">{label}</span>
            </button>
        </li>
    );
};

const AdminSidebar: React.FC<{ currentView: AdminView; setView: (view: AdminView) => void; onLogout: () => void; }> = ({ currentView, setView, onLogout }) => {
    const navItems = [
        { view: 'dashboard' as AdminView, label: 'Dashboard', icon: <DashboardIcon /> },
        { view: 'slides' as AdminView, label: 'Home Slides', icon: <SlidesIcon /> },
        { view: 'categories' as AdminView, label: 'Categories', icon: <CategoryIcon /> },
        { view: 'products' as AdminView, label: 'Products', icon: <ProductIcon /> },
        { view: 'orders' as AdminView, label: 'Orders', icon: <OrderIcon /> },
        { view: 'users' as AdminView, label: 'Users', icon: <UserIcon /> },
        { view: 'coupons' as AdminView, label: 'Coupons', icon: <CouponIcon /> },
        { view: 'settings' as AdminView, label: 'Settings', icon: <SettingsIcon /> },
    ];

    return (
        <aside className="w-16 md:w-64 bg-slate-800 text-white flex flex-col transition-all duration-300">
            <div className="flex items-center justify-center h-20 border-b border-slate-700">
                <h1 className="text-xl font-bold hidden md:block">Qurion Tech</h1>
                <div className="md:hidden text-primary"><DashboardIcon /></div>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navItems.map(item => <NavItem key={item.view} {...item} currentView={currentView} setView={setView} />)}
            </nav>
            <div className="px-2 py-4 mt-auto border-t border-slate-700 space-y-2">
                <a
                    href="#/"
                    className="w-full flex items-center p-3 text-base font-normal rounded-lg text-slate-200 hover:bg-slate-700"
                >
                    <StoreIcon />
                    <span className="ml-3 hidden md:inline">View Store</span>
                </a>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center p-3 text-base font-normal rounded-lg text-slate-200 hover:bg-slate-700"
                >
                    <LogoutIcon />
                    <span className="ml-3 hidden md:inline">Logout</span>
                </button>
            </div>
        </aside>
    );
};


// --- GENERIC MODAL & FORMS ---

const Modal: React.FC<{ children: React.ReactNode, title: string, onClose: () => void, size?: 'lg' | 'xl' }> = ({ children, title, onClose, size = 'lg' }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-16" onClick={onClose}>
        <div className={`bg-white rounded-lg shadow-xl w-full max-w-${size} m-4`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                {children}
            </div>
        </div>
    </div>
);

const ProductForm: React.FC<{ product?: Product; categories: Category[], onSave: (p: any) => void; onCancel: () => void; }> = ({ product, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        stock: product?.stock?.toString() || '',
        imageUrl: product?.imageUrl || '',
        images: product?.images || [],
        categoryId: product?.categoryId || '',
        slug: product?.slug || '',
        originalPrice: product?.originalPrice?.toString() || '',
        metaTitle: product?.metaTitle || '',
        metaDescription: product?.metaDescription || '',
    });
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!product?.slug);

    const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    useEffect(() => {
        if (!isSlugManuallyEdited) {
            setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
        }
    }, [formData.name, isSlugManuallyEdited]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (['price', 'originalPrice', 'stock'].includes(name)) {
            // Allow only numbers and one decimal point
            if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }

    const handleAddImage = (url: string) => {
        if (url) {
            setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price) || 0,
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            stock: parseInt(formData.stock, 10) || 0,
            images: formData.images,
        };
        onSave(payload);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="w-full border p-2 rounded-md" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded-md" rows={4} />
            <input name="slug" value={formData.slug} onChange={(e) => { setIsSlugManuallyEdited(true); handleChange(e); }} placeholder="URL Slug (e.g., product-name)" className="w-full border p-2 rounded-md" required />

            {/* Main Product Image Upload */}
            <ImageUploader
                currentImage={formData.imageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="products"
                label="Main Product Image"
                placeholder="Click to upload or drag and drop the main product image"
            />

            {/* Additional Images Section */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Images</label>

                {/* Image List */}
                {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                        {formData.images.map((img, index) => (
                            <div key={index} className="relative group w-24 h-24 border rounded-md overflow-hidden bg-slate-100">
                                <img src={getImageUrl(img)} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Uploader for New Images */}
                <ImageUploader
                    onUpload={handleAddImage}
                    uploadType="products"
                    label=""
                    placeholder="Add another image"
                    currentImage="" // Reset logic handled by parent? No, ImageUploader keeps internal state.
                // We need a key to force reset or modify ImageUploader. 
                // Actually, onUpload adds it to the list. We want the uploader to reset after upload.
                // The current ImageUploader doesn't self-reset nicely if we don't clear currentImage.
                // But here currentImage is empty string constant, so it might stay empty? 
                // Let's rely on the user clicking "X" in Uploader or just uploading another.
                // A better UX would be the Uploader resetting. 
                // For now, let's just render it.
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input name="price" type="text" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full border p-2 rounded-md" required />
                <input name="originalPrice" type="text" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price (Optional)" className="w-full border p-2 rounded-md" />
            </div>
            <input name="stock" type="text" value={formData.stock} onChange={handleChange} placeholder="Stock" className="w-full border p-2 rounded-md" required />
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border p-2 rounded-md" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold mb-2 text-slate-600">SEO Settings</h4>
                <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="SEO Meta Title" className="w-full border p-2 rounded-md" />
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} placeholder="SEO Meta Description" className="w-full border p-2 rounded-md mt-2" rows={2} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Product</Button>
            </div>
        </form>
    );
};

const CategoryForm: React.FC<{ category?: Category; onSave: (c: any) => void; onCancel: () => void; }> = ({ category, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        slug: category?.slug || '',
        status: category?.status || 'ACTIVE',
        imageUrl: category?.imageUrl || '',
        metaTitle: category?.metaTitle || '',
        metaDescription: category?.metaDescription || '',
    });
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!category?.slug);

    const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    useEffect(() => {
        if (!isSlugManuallyEdited) {
            setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
        }
    }, [formData.name, isSlugManuallyEdited]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Category Name" className="w-full border p-2 rounded-md" required />
            <input name="slug" value={formData.slug} onChange={(e) => { setIsSlugManuallyEdited(true); handleChange(e); }} placeholder="URL Slug (e.g., category-name)" className="w-full border p-2 rounded-md" required />

            {/* Category Image Upload */}
            <ImageUploader
                currentImage={formData.imageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="categories"
                label="Category Image (Optional)"
                placeholder="Click to upload or drag and drop a category image"
            />

            <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded-md" required>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
            </select>
            <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold mb-2 text-slate-600">SEO Settings</h4>
                <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="SEO Meta Title" className="w-full border p-2 rounded-md" />
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} placeholder="SEO Meta Description" className="w-full border p-2 rounded-md mt-2" rows={2} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Category</Button>
            </div>
        </form>
    );
};

const SlideForm: React.FC<{ slide?: HomeSlide; onSave: (s: any) => void; onCancel: () => void; }> = ({ slide, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: slide?.title || '',
        imageUrl: slide?.imageUrl || '',
        linkUrl: slide?.linkUrl || '',
        order: slide?.order || 0,
        status: slide?.status || 'ACTIVE',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.name === 'order' ? parseInt(e.target.value) || 0 : e.target.value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Slide Title" className="w-full border p-2 rounded-md" required />

            {/* Slide Image Upload */}
            <ImageUploader
                currentImage={formData.imageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="slides"
                label="Slide Banner Image"
                placeholder="Click to upload or drag and drop banner image (recommended: 1920x600)"
            />

            <input name="linkUrl" value={formData.linkUrl} onChange={handleChange} placeholder="Link URL (e.g., #/product/some-id)" className="w-full border p-2 rounded-md" />
            <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Display Order" className="w-full border p-2 rounded-md" required />
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded-md" required>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
            </select>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Slide</Button>
            </div>
        </form>
    );
}

const OrderForm: React.FC<{ order: Order; onSave: (o: any) => void; onCancel: () => void; }> = ({ order, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        status: order?.status || 'PENDING',
        trackingNumber: order?.trackingNumber || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Order Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded-md mt-1" required>
                    {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tracking Number</label>
                <input name="trackingNumber" value={formData.trackingNumber} onChange={handleChange} placeholder="Enter tracking number" className="w-full border p-2 rounded-md mt-1" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Update Order</Button>
            </div>
        </form>
    );
};

const UserForm: React.FC<{ user: AdminUser; onSave: (u: any) => void; onCancel: () => void; }> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        isAdmin: user?.isAdmin || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="User Name" className="w-full border p-2 rounded-md" required />
            <label className="flex items-center space-x-2">
                <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span>Is Administrator</span>
            </label>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save User</Button>
            </div>
        </form>
    );
};

const CouponForm: React.FC<{ coupon?: Coupon; onSave: (c: any) => void; onCancel: () => void; }> = ({ coupon, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        code: coupon?.code || '',
        discountType: coupon?.discountType || 'PERCENTAGE',
        discountValue: coupon?.discountValue?.toString() || '',
        expiryDate: coupon?.expiryDate ? coupon.expiryDate.split('T')[0] : '',
        usageLimit: coupon?.usageLimit?.toString() || '',
        minCartValue: coupon?.minCartValue?.toString() || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            discountValue: parseFloat(formData.discountValue) || 0,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            minCartValue: formData.minCartValue ? parseFloat(formData.minCartValue) : null,
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="code" value={formData.code} onChange={handleChange} placeholder="Coupon Code (e.g., SUMMER10)" className="w-full border p-2 rounded-md uppercase" required />
            <div className="grid grid-cols-2 gap-4">
                <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full border p-2 rounded-md">
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                </select>
                <input name="discountValue" type="number" value={formData.discountValue} onChange={handleChange} placeholder="Discount Value" className="w-full border p-2 rounded-md" required />
            </div>
            <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="w-full border p-2 rounded-md" />
            <div className="grid grid-cols-2 gap-4">
                <input name="usageLimit" type="number" value={formData.usageLimit} onChange={handleChange} placeholder="Usage Limit (optional)" className="w-full border p-2 rounded-md" />
                <input name="minCartValue" type="number" value={formData.minCartValue} onChange={handleChange} placeholder="Min. Cart Value (optional)" className="w-full border p-2 rounded-md" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Coupon</Button>
            </div>
        </form>
    );
};

const InvoiceView: React.FC<{ order: Order, settings: Record<string, string>, onPrint: () => void }> = ({ order, settings, onPrint }) => (
    <div id="invoice-content" className="text-slate-800">
        <div className="flex justify-between items-start pb-4 border-b">
            <div>
                <h2 className="text-2xl font-bold">{settings.storeName || 'Qurion Tech'}</h2>
                <p className="text-sm">{settings.storeAddress}</p>
                <p className="text-sm">{settings.storeEmail}</p>
                <p className="text-sm">{settings.storePhone}</p>
            </div>
            <div className="text-right">
                <h3 className="text-xl font-semibold">INVOICE</h3>
                <p className="text-sm"><strong>Order ID:</strong> {order.trackingNumber || order.id}</p>
                <p className="text-sm"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="flex justify-between items-start mt-6">
            <div>
                <h4 className="font-semibold text-slate-600">BILL TO</h4>
                <p>{order.user.name}</p>
                <p>{order.user.email}</p>
            </div>
        </div>
        <div className="mt-8">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium text-center">Qty</th>
                        <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {order.items.map(item => (
                        <tr key={item.id}>
                            <td className="px-4 py-3 font-medium">{item.product.name}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right">₹{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{(order.totalAmount + (order.discountAmount || 0)).toFixed(2)}</span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount ({order.couponCode})</span>
                        <span>- ₹{order.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-4 pt-8">
            <Button onClick={onPrint} variant="primary">Print Invoice</Button>
        </div>
    </div>
);


// --- MAIN ADMIN DASHBOARD COMPONENT ---
const AdminDashboard: React.FC<{ settings: Record<string, string> }> = ({ settings: appSettings }) => {
    const [view, setView] = useState<AdminView>('dashboard');
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, categories: 0 });
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [slides, setSlides] = useState<HomeSlide[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [statsPeriod, setStatsPeriod] = useState<Period>('all');
    const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);


    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HomeSlide | undefined>(undefined);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | undefined>(undefined);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<Order | undefined>(undefined);

    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: 'success' | 'error') => {
        const newToast: Toast = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 3000);
    };

    const fetchLowStockData = useCallback(async (threshold: number) => {
        try {
            const lowStockData = await adminApi.getLowStockProducts(threshold);
            setLowStockProducts(lowStockData);
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    }, []);

    useEffect(() => {
        // Debounce fetching to avoid spamming API on slider change
        const handler = setTimeout(() => {
            if (view === 'dashboard') {
                fetchLowStockData(lowStockThreshold);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [lowStockThreshold, view, fetchLowStockData]);

    const loadDataForView = useCallback(async (currentView: AdminView, period: Period, threshold: number) => {
        setLoading(true);
        setError(null);
        try {
            switch (currentView) {
                case 'dashboard':
                    const [statsData, lowStockData] = await Promise.all([
                        adminApi.getStats(period),
                        adminApi.getLowStockProducts(threshold)
                    ]);
                    setStats(statsData);
                    setLowStockProducts(lowStockData);
                    break;
                case 'users': setUsers(await adminApi.getUsers()); break;
                case 'products':
                    const [p, c] = await Promise.all([adminApi.getProducts(), adminApi.getCategories()]);
                    setProducts(p); setCategories(c); break;
                case 'categories': setCategories(await adminApi.getCategories()); break;
                case 'slides': setSlides(await adminApi.getSlides()); break;
                case 'orders': setOrders(await adminApi.getOrders()); break;
                case 'coupons': setCoupons(await adminApi.getCoupons()); break;
                case 'settings': setSettings(await adminApi.getSettings()); break;
            }
        } catch (err: any) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDataForView(view, statsPeriod, lowStockThreshold);
    }, [view, statsPeriod, loadDataForView, lowStockThreshold]);

    // --- CRUD Handlers ---
    const createDeleteHandler = (noun: string, deleteFn: (id: string) => Promise<any>, refreshView: AdminView) => async (id: string) => {
        if (window.confirm(`Are you sure you want to delete this ${noun}? This action cannot be undone.`)) {
            try {
                await deleteFn(id);
                showToast(`${noun} deleted successfully.`, 'success');
                await loadDataForView(refreshView, statsPeriod, lowStockThreshold);
            } catch (err: any) { showToast(err.message, 'error'); }
        }
    };

    const handleDeleteUser = createDeleteHandler('user', adminApi.deleteUser, 'users');
    const handleDeleteProduct = createDeleteHandler('product', adminApi.deleteProduct, 'products');
    const handleDeleteCategory = createDeleteHandler('category', adminApi.deleteCategory, 'categories');
    const handleDeleteSlide = createDeleteHandler('slide', adminApi.deleteSlide, 'slides');
    const handleDeleteCoupon = createDeleteHandler('coupon', adminApi.deleteCoupon, 'coupons');

    const handleSaveProduct = async (data: any) => {
        try {
            const action = editingProduct ? 'updated' : 'created';
            if (editingProduct) await adminApi.updateProduct(editingProduct.id, data);
            else await adminApi.createProduct(data);
            await loadDataForView('products', statsPeriod, lowStockThreshold);
            showToast(`Product ${action} successfully.`, 'success');
            setIsProductModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveCategory = async (data: any) => {
        try {
            const action = editingCategory ? 'updated' : 'created';
            if (editingCategory) await adminApi.updateCategory(editingCategory.id, data);
            else await adminApi.createCategory(data);
            await loadDataForView('categories', statsPeriod, lowStockThreshold);
            showToast(`Category ${action} successfully.`, 'success');
            setIsCategoryModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveSlide = async (data: any) => {
        try {
            const action = editingSlide ? 'updated' : 'created';
            if (editingSlide) await adminApi.updateSlide(editingSlide.id, data);
            else await adminApi.createSlide(data);
            await loadDataForView('slides', statsPeriod, lowStockThreshold);
            showToast(`Slide ${action} successfully.`, 'success');
            setIsSlideModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveOrder = async (data: any) => {
        if (!editingOrder) return;
        try {
            await adminApi.updateOrder(editingOrder.id, data);
            await loadDataForView('orders', statsPeriod, lowStockThreshold);
            showToast(`Order updated successfully.`, 'success');
            setIsOrderModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveUser = async (data: any) => {
        if (!editingUser) return;
        try {
            await adminApi.updateUser(editingUser.id, data);
            await loadDataForView('users', statsPeriod, lowStockThreshold);
            showToast(`User updated successfully.`, 'success');
            setIsUserModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveCoupon = async (data: any) => {
        try {
            const action = editingCoupon ? 'updated' : 'created';
            if (editingCoupon) await adminApi.updateCoupon(editingCoupon.id, data);
            else await adminApi.createCoupon(data);
            await loadDataForView('coupons', statsPeriod, lowStockThreshold);
            showToast(`Coupon ${action} successfully.`, 'success');
            setIsCouponModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveSettings = async (data: Setting[]) => {
        try {
            await adminApi.updateSettings(data);
            await loadDataForView('settings', statsPeriod, lowStockThreshold);
            showToast(`Settings updated successfully.`, 'success');
        } catch (err: any) { showToast(err.message, 'error'); }
    }

    const openProductModal = (product?: Product) => { setEditingProduct(product); setIsProductModalOpen(true); }
    const openCategoryModal = (cat?: Category) => { setEditingCategory(cat); setIsCategoryModalOpen(true); }
    const openSlideModal = (slide?: HomeSlide) => { setEditingSlide(slide); setIsSlideModalOpen(true); }
    const openOrderModal = (order?: Order) => { setEditingOrder(order); setIsOrderModalOpen(true); }
    const openUserModal = (user?: AdminUser) => { setEditingUser(user); setIsUserModalOpen(true); }
    const openCouponModal = (coupon?: Coupon) => { setEditingCoupon(coupon); setIsCouponModalOpen(true); }
    const openInvoiceModal = (order: Order) => { setViewingOrder(order); setIsInvoiceModalOpen(true); }

    const handlePrintInvoice = () => {
        const printContents = document.getElementById('invoice-content')?.innerHTML;
        const originalContents = document.body.innerHTML;
        if (printContents) {
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to re-mount React app
        }
    };

    const renderView = () => {
        if (loading) return <div className="text-center p-10">Loading...</div>;
        if (error && view !== 'dashboard') return <div className="text-center p-10 text-red-500 bg-red-100 rounded-lg">{error}</div>;

        switch (view) {
            case 'dashboard': return <DashboardView stats={stats} lowStockProducts={lowStockProducts} period={statsPeriod} setPeriod={setStatsPeriod} onEditProduct={openProductModal} lowStockThreshold={lowStockThreshold} onThresholdChange={setLowStockThreshold} />;
            case 'slides': return <SlidesView slides={slides} onAdd={() => openSlideModal()} onEdit={openSlideModal} onDelete={handleDeleteSlide} />;
            case 'categories': return <CategoriesView categories={categories} onAdd={() => openCategoryModal()} onEdit={openCategoryModal} onDelete={handleDeleteCategory} />;
            case 'products': return <ProductsView products={products} categories={categories} onDelete={handleDeleteProduct} onAdd={() => openProductModal()} onEdit={openProductModal} />;
            case 'orders': return <OrdersView orders={orders} onEdit={openOrderModal} onViewInvoice={openInvoiceModal} />;
            case 'users': return <UsersView users={users} onEdit={openUserModal} onDelete={handleDeleteUser} />;
            case 'coupons': return <CouponsView coupons={coupons} onAdd={() => openCouponModal()} onEdit={openCouponModal} onDelete={handleDeleteCoupon} />;
            case 'settings': return <SettingsView settings={settings} onSave={handleSaveSettings} />;
            default: return <DashboardView stats={stats} lowStockProducts={lowStockProducts} period={statsPeriod} setPeriod={setStatsPeriod} onEditProduct={openProductModal} lowStockThreshold={lowStockThreshold} onThresholdChange={setLowStockThreshold} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-100 font-sans">
            <AdminSidebar currentView={view} setView={setView} onLogout={logout} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 capitalize">{view}</h1>
                        <p className="text-sm text-slate-500">Welcome back, {user?.name || 'Admin'}!</p>
                    </div>
                </div>
                {renderView()}
            </main>

            {/* Toast Container */}
            <div className="fixed bottom-5 right-5 z-[100] space-y-2">
                {toasts.map(toast => (
                    <div key={toast.id} className={`flex items-center w-full max-w-xs p-4 text-white rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} role="alert">
                        <div className="text-sm font-normal">{toast.message}</div>
                    </div>
                ))}
            </div>

            {isProductModalOpen && <Modal title={editingProduct ? 'Edit Product' : 'Add Product'} onClose={() => setIsProductModalOpen(false)}>
                <ProductForm product={editingProduct} categories={categories} onSave={handleSaveProduct} onCancel={() => setIsProductModalOpen(false)} />
            </Modal>}
            {isCategoryModalOpen && <Modal title={editingCategory ? 'Edit Category' : 'Add Category'} onClose={() => setIsCategoryModalOpen(false)}>
                <CategoryForm category={editingCategory} onSave={handleSaveCategory} onCancel={() => setIsCategoryModalOpen(false)} />
            </Modal>}
            {isSlideModalOpen && <Modal title={editingSlide ? 'Edit Slide' : 'Add Slide'} onClose={() => setIsSlideModalOpen(false)}>
                <SlideForm slide={editingSlide} onSave={handleSaveSlide} onCancel={() => setIsSlideModalOpen(false)} />
            </Modal>}
            {isOrderModalOpen && editingOrder && <Modal title={`Manage Order #${editingOrder.id.substring(0, 8)}`} onClose={() => setIsOrderModalOpen(false)}>
                <OrderForm order={editingOrder} onSave={handleSaveOrder} onCancel={() => setIsOrderModalOpen(false)} />
            </Modal>}
            {isUserModalOpen && editingUser && <Modal title={`Edit User: ${editingUser.name}`} onClose={() => setIsUserModalOpen(false)}>
                <UserForm user={editingUser} onSave={handleSaveUser} onCancel={() => setIsUserModalOpen(false)} />
            </Modal>}
            {isCouponModalOpen && <Modal title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'} onClose={() => setIsCouponModalOpen(false)}>
                <CouponForm coupon={editingCoupon} onSave={handleSaveCoupon} onCancel={() => setIsCouponModalOpen(false)} />
            </Modal>}
            {isInvoiceModalOpen && viewingOrder && <Modal title={`Invoice for Order #${viewingOrder.id.substring(0, 8)}`} onClose={() => setIsInvoiceModalOpen(false)} size="xl">
                <InvoiceView order={viewingOrder} settings={appSettings} onPrint={handlePrintInvoice} />
            </Modal>}
        </div>
    );
};

export default AdminDashboard;