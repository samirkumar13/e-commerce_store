import React, { useState, useEffect, useCallback } from 'react';
import { Product, AdminUser, Category, HomeSlide, Order, Coupon, Setting, StaffUser, StaffPermissions, WalletTransaction, Return } from '../../types';
import Button from '../UIElements/Button';
import ImageUploader from '../ImageUploader';
import { getImageUrl } from '../../utils/imageUtils';
import { Period } from './types';
import { StatusBadge, StatCard, LowStockWidget } from './shared';
import { UsersIcon, OrdersIcon, ProductsIcon, CategoriesIcon } from './icons';
import { applyTheme, FONT_OPTIONS, RADIUS_OPTIONS } from '../../utils/applyTheme';
import * as adminApi from '../../services/adminApi';

export const DashboardView: React.FC<{
    stats: any;
    lowStockProducts: Product[];
    period: Period;
    setPeriod: (p: Period) => void;
    onEditProduct: (p: Product) => void;
    lowStockThreshold: number;
    onThresholdChange: (t: number) => void;
}> = ({ stats, lowStockProducts, period, setPeriod, onEditProduct, lowStockThreshold, onThresholdChange }) => (
    <div className="space-y-8">
        <div className="flex justify-end items-center">
            <div className="inline-flex items-center gap-1 bg-white border border-slate-200/70 rounded-xl p-1 shadow-soft">
                {(['today', 'week', 'month', 'all'] as Period[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`capitalize text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors ${period === p ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
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

export const SlidesView: React.FC<{ slides: HomeSlide[]; onAdd: () => void; onEdit: (s: HomeSlide) => void; onDelete: (id: string) => void; }> = ({ slides, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Home Slides Management</h2>
            <Button onClick={onAdd} variant="primary">Add New Slide</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Slide</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {slides.map(slide => (
                        <tr key={slide.id}>
                            <td className="px-4 py-3 flex items-center">
                                <img src={getImageUrl(slide.imageUrl)} alt={slide.title} className="w-24 h-12 object-cover rounded-md mr-3" />
                                <span className="font-medium text-slate-800">{slide.title}</span>
                            </td>
                            <td className="px-4 py-3">{slide.order}</td>
                            <td className="px-4 py-3"><StatusBadge status={slide.status} /></td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(slide)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(slide.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const CategoriesView: React.FC<{ categories: Category[]; onAdd: () => void; onEdit: (c: Category) => void; onDelete: (id: string) => void; }> = ({ categories, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Category Management</h2>
            <Button onClick={onAdd} variant="primary">Add New Category</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Category Name</th>
                        <th className="px-4 py-3 font-medium">Slug</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {categories.map(cat => (
                        <tr key={cat.id}>
                            <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                            <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                            <td className="px-4 py-3"><StatusBadge status={cat.status} /></td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(cat)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(cat.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const ProductsView: React.FC<{ products: Product[]; categories: Category[]; onAdd: () => void; onEdit: (p: Product) => void; onDelete: (id: string) => void; }> = ({ products, categories, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? product.categoryId === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Product Management</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full md:w-64 bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full md:w-48 bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
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
                    <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                        <tr>
                            <th className="px-4 py-3 font-medium">Product Name</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Price</th>
                            <th className="px-4 py-3 font-medium">Stock</th>
                            <th className="px-4 py-3 font-medium text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
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
                                        <button onClick={() => onEdit(product)} className="admin-act admin-act-edit mr-2">Edit</button>
                                        <button onClick={() => onDelete(product.id)} className="admin-act admin-act-del">Delete</button>
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

export const OrdersView: React.FC<{ orders: Order[], onEdit: (o: Order) => void, onViewInvoice: (o: Order) => void }> = ({ orders, onEdit, onViewInvoice }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <h2 className="text-xl font-semibold mb-6">Order Management</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Order ID</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="px-4 py-3 font-mono text-xs">{order.trackingNumber || order.id}</td>
                            <td className="px-4 py-3">{order.user?.name || order.user?.email}</td>
                            <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">₹{order.totalAmount.toFixed(2)}</td>
                            <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(order)} className="admin-act admin-act-edit mr-2">Manage</button>
                                <button onClick={() => onViewInvoice(order)} className="admin-act admin-act-alt">Invoice</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const UsersView: React.FC<{ users: AdminUser[], onEdit: (u: AdminUser) => void, onDelete: (id: string) => void }> = ({ users, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <h2 className="text-xl font-semibold mb-6">User Management</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Registration Date</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
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
                                <button onClick={() => onEdit(user)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(user.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const CouponsView: React.FC<{ coupons: Coupon[], onAdd: () => void, onEdit: (c: Coupon) => void, onDelete: (id: string) => void }> = ({ coupons, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Coupon Management</h2>
            <Button onClick={onAdd} variant="primary">Add New Coupon</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Code</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Value</th>
                        <th className="px-4 py-3 font-medium">Usage</th>
                        <th className="px-4 py-3 font-medium">Expires</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {coupons.map(coupon => (
                        <tr key={coupon.id}>
                            <td className="px-4 py-3 font-mono text-xs bg-slate-50 rounded-md">{coupon.code}</td>
                            <td className="px-4 py-3">{coupon.discountType}</td>
                            <td className="px-4 py-3">{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                            <td className="px-4 py-3">{coupon.timesUsed} / {coupon.usageLimit || '∞'}</td>
                            <td className="px-4 py-3">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(coupon)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(coupon.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const SettingsView: React.FC<{ settings: Setting[], onSave: (settings: Setting[]) => void }> = ({ settings, onSave }) => {
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
        onSave(settingsPayload.map(s => {
            const originalSetting = settings.find(os => os.key === s.key);
            return { ...s, id: originalSetting?.id || '' };
        }));
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
            <h2 className="text-xl font-semibold mb-6">Store Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Name</label>
                    <input name="storeName" value={formData.storeName || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>

                <ImageUploader
                    currentImage={formData.storeLogo}
                    onUpload={(url) => setFormData(prev => ({ ...prev, storeLogo: url }))}
                    uploadType="settings"
                    label="Store Logo"
                    placeholder="Click to upload or drag and drop your store logo"
                />

                <ImageUploader
                    currentImage={formData.storeFavicon}
                    onUpload={(url) => setFormData(prev => ({ ...prev, storeFavicon: url }))}
                    uploadType="settings"
                    label="Favicon"
                    placeholder="Click to upload or drag and drop favicon (recommended: 32x32)"
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700">Tax Rate (GST %)</label>
                    <input name="taxRate" type="number" step="0.01" value={formData.taxRate || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>

                <h4 className="text-md font-semibold mb-1 text-slate-600 pt-2">Loyalty Points & Referral</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Points Earn Rate (pts per ₹100)</label>
                        <input name="pointsEarnRate" type="number" min="0" step="1" value={formData.pointsEarnRate || ''} onChange={handleChange} placeholder="5" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                        <p className="text-xs text-slate-400 mt-1">E.g. 5 = earn 5pts per ₹100 spent</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Max Redeem (% of order)</label>
                        <input name="pointsRedeemMaxPercent" type="number" min="0" max="100" step="1" value={formData.pointsRedeemMaxPercent || ''} onChange={handleChange} placeholder="50" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                        <p className="text-xs text-slate-400 mt-1">Max % of order value redeemable</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Referral Bonus (pts each)</label>
                        <input name="referralBonusPoints" type="number" min="0" step="1" value={formData.referralBonusPoints || ''} onChange={handleChange} placeholder="100" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                        <p className="text-xs text-slate-400 mt-1">Points for referrer + referred on first order</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Description (for SEO)</label>
                    <textarea name="storeDescription" value={formData.storeDescription || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" rows={3} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Email</label>
                    <input name="storeEmail" type="email" value={formData.storeEmail || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Phone</label>
                    <input name="storePhone" value={formData.storePhone || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Store Address</label>
                    <input name="storeAddress" value={formData.storeAddress || ''} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>

                <div className="pt-4 border-t mt-4">
                    <h4 className="text-md font-semibold mb-3 text-slate-600">Social & Channel Links</h4>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">YouTube Channel URL</label>
                    <input name="youtubeChannel" value={formData.youtubeChannel || ''} onChange={handleChange} placeholder="https://www.youtube.com/@yourchannel" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Facebook URL</label>
                    <input name="facebookUrl" value={formData.facebookUrl || ''} onChange={handleChange} placeholder="https://www.facebook.com/yourpage" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Instagram URL</label>
                    <input name="instagramUrl" value={formData.instagramUrl || ''} onChange={handleChange} placeholder="https://www.instagram.com/yourhandle" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Twitter / X URL</label>
                    <input name="twitterUrl" value={formData.twitterUrl || ''} onChange={handleChange} placeholder="https://x.com/yourhandle" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">LinkedIn URL</label>
                    <input name="linkedinUrl" value={formData.linkedinUrl || ''} onChange={handleChange} placeholder="https://www.linkedin.com/company/yourcompany" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>

                <div className="pt-4 border-t mt-4">
                    <h4 className="text-md font-semibold mb-1 text-slate-600">Analytics & Tracking</h4>
                    <p className="text-xs text-slate-400 mb-3">Scripts are injected automatically when IDs are saved.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Google Analytics 4 Measurement ID</label>
                    <input name="gaId" value={formData.gaId || ''} onChange={handleChange} placeholder="G-XXXXXXXXXX" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Meta Pixel ID</label>
                    <input name="metaPixelId" value={formData.metaPixelId || ''} onChange={handleChange} placeholder="1234567890" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                </div>

                <div className="pt-4 border-t mt-4">
                    <h4 className="text-md font-semibold mb-1 text-slate-600">Legal Pages</h4>
                    <p className="text-xs text-slate-400 mb-3">Content shown at /legal/privacy, /legal/terms, and /legal/returns. Plain text — use blank lines to separate paragraphs.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Privacy Policy</label>
                    <textarea name="privacyPolicy" value={formData.privacyPolicy || ''} onChange={handleChange} rows={8} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1 font-mono" placeholder="Enter your Privacy Policy text here..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Terms of Service</label>
                    <textarea name="termsOfService" value={formData.termsOfService || ''} onChange={handleChange} rows={8} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1 font-mono" placeholder="Enter your Terms of Service text here..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Return &amp; Refund Policy</label>
                    <textarea name="returnPolicy" value={formData.returnPolicy || ''} onChange={handleChange} rows={8} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1 font-mono" placeholder="Enter your Return &amp; Refund Policy text here..." />
                </div>
            </form>

            {/* ── Theme & Branding ── */}
            <div className="mt-10 border-t pt-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Theme & Branding</h3>
                <p className="text-sm text-slate-500 mb-6">Changes apply live across the entire storefront.</p>

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.primaryColor || '#06b6d4'}
                                onChange={e => {
                                    setFormData(prev => ({ ...prev, primaryColor: e.target.value }));
                                    applyTheme({ ...formData, primaryColor: e.target.value });
                                }}
                                className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                                type="text"
                                value={formData.primaryColor || '#06b6d4'}
                                onChange={e => {
                                    if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                                        setFormData(prev => ({ ...prev, primaryColor: e.target.value }));
                                        if (e.target.value.length === 7) applyTheme({ ...formData, primaryColor: e.target.value });
                                    }
                                }}
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                                placeholder="#06b6d4"
                            />
                        </div>
                        {/* Color presets */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {['#06b6d4','#8b5cf6','#ec4899','#f97316','#10b981','#ef4444','#3b82f6','#f59e0b','#1e293b'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    title={c}
                                    onClick={() => { setFormData(prev => ({ ...prev, primaryColor: c })); applyTheme({ ...formData, primaryColor: c }); }}
                                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                                    style={{ backgroundColor: c, borderColor: formData.primaryColor === c ? '#1e293b' : 'transparent' }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.backgroundColor || '#f8fafc'}
                                onChange={e => {
                                    setFormData(prev => ({ ...prev, backgroundColor: e.target.value }));
                                    applyTheme({ ...formData, backgroundColor: e.target.value });
                                }}
                                className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                                type="text"
                                value={formData.backgroundColor || '#f8fafc'}
                                onChange={e => {
                                    if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                                        setFormData(prev => ({ ...prev, backgroundColor: e.target.value }));
                                        if (e.target.value.length === 7) applyTheme({ ...formData, backgroundColor: e.target.value });
                                    }
                                }}
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                                placeholder="#f8fafc"
                            />
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {['#f8fafc','#ffffff','#f0f9ff','#fdf4ff','#fff7ed','#f0fdf4','#0f172a','#1e1b4b'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    title={c}
                                    onClick={() => { setFormData(prev => ({ ...prev, backgroundColor: c })); applyTheme({ ...formData, backgroundColor: c }); }}
                                    className="w-6 h-6 rounded-full border-2 border-slate-300 transition-transform hover:scale-110"
                                    style={{ backgroundColor: c, borderColor: formData.backgroundColor === c ? '#1e293b' : '#e2e8f0' }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Font family */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
                    <div className="flex flex-wrap gap-2">
                        {FONT_OPTIONS.map(font => (
                            <button
                                key={font}
                                type="button"
                                onClick={() => { setFormData(prev => ({ ...prev, fontFamily: font })); applyTheme({ ...formData, fontFamily: font }); }}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                    (formData.fontFamily || 'Inter') === font
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                                style={{ fontFamily: `'${font}', sans-serif` }}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Border radius */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Button Style</label>
                    <div className="flex gap-3">
                        {RADIUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { setFormData(prev => ({ ...prev, borderRadius: opt.value })); applyTheme({ ...formData, borderRadius: opt.value }); }}
                                className={`flex-1 py-2.5 border text-sm font-medium transition-colors ${
                                    (formData.borderRadius || '6px') === opt.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                                style={{ borderRadius: opt.value }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live preview */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Live Preview</p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button variant="primary" size="md">Primary Button</Button>
                        <Button variant="secondary" size="md">Secondary</Button>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: formData.primaryColor || '#06b6d4' }}>Badge</span>
                        <span className="text-sm font-semibold" style={{ color: formData.primaryColor || '#06b6d4' }}>Link text</span>
                    </div>
                </div>
            </div>

            {/* ── GST / Invoice Details ── */}
            <div className="mt-10 border-t pt-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">GST & Invoice Details</h3>
                <p className="text-sm text-slate-500 mb-6">Shown on downloadable tax invoices for customers.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">GSTIN</label>
                        <input name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">PAN Number</label>
                        <input name="storePAN" value={formData.storePAN || ''} onChange={handleChange} placeholder="AAAAA0000A" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                    </div>
                </div>
            </div>

            {/* ── Announcement Bar ── */}
            <div className="mt-10 border-t pt-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Announcement Bar</h3>
                <p className="text-sm text-slate-500 mb-6">A dismissible banner shown above the header on your storefront.</p>
                <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
                        <div>
                            <h4 className="font-medium text-slate-900">Enable Announcement Bar</h4>
                            <p className="text-sm text-slate-500 mt-0.5">Show the bar on all storefront pages.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.announcementEnabled === 'true'}
                                onChange={e => setFormData(prev => ({ ...prev, announcementEnabled: e.target.checked ? 'true' : 'false' }))}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Announcement Text</label>
                        <input name="announcementText" value={formData.announcementText || ''} onChange={handleChange} placeholder="🎉 Free shipping on orders above ₹999!" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Link Text <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input name="announcementLinkText" value={formData.announcementLinkText || ''} onChange={handleChange} placeholder="Shop Now" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Link URL <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input name="announcementLinkUrl" value={formData.announcementLinkUrl || ''} onChange={handleChange} placeholder="#/products" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Bar Background Color <span className="text-slate-400 font-normal">(defaults to primary color)</span></label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.announcementBgColor || '#06b6d4'}
                                onChange={e => setFormData(prev => ({ ...prev, announcementBgColor: e.target.value }))}
                                className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                                type="text"
                                value={formData.announcementBgColor || ''}
                                onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setFormData(prev => ({ ...prev, announcementBgColor: e.target.value })); }}
                                className="w-32 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                                placeholder="(use primary)"
                            />
                        </div>
                    </div>
                    {/* Preview */}
                    {formData.announcementText && (
                        <div className="rounded-lg overflow-hidden border border-slate-200">
                            <p className="text-xs text-slate-400 px-3 pt-2 font-medium uppercase tracking-wide">Preview</p>
                            <div className="flex items-center justify-center px-10 py-2 text-sm font-medium text-white relative mt-1" style={{ backgroundColor: formData.announcementBgColor || 'var(--color-primary, #06b6d4)' }}>
                                <span>{formData.announcementText}</span>
                                {formData.announcementLinkText && <span className="ml-2 underline opacity-90">{formData.announcementLinkText}</span>}
                                <span className="absolute right-3 opacity-70 text-xs">✕</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 border-t pt-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Feature Management</h3>
                {[
                    { key: 'reviewsEnabled', label: 'Product Reviews & Ratings', desc: 'Allow customers to rate and review verified purchases.' },
                    { key: 'videosEnabled', label: 'Video Gallery', desc: 'Show video sections (full videos & shorts) on the homepage.' },
                    { key: 'blogsEnabled', label: 'Blog & Tutorials', desc: 'Show blog posts and tutorials section on the homepage.' },
                ].map(({ key, label, desc }) => (
                    <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
                        <div>
                            <h4 className="font-medium text-slate-900">{label}</h4>
                            <p className="text-sm text-slate-500 mt-1">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData[key] !== 'false'}
                                onChange={(e) => {
                                    const newVal = e.target.checked ? 'true' : 'false';
                                    setFormData(prev => ({ ...prev, [key]: newVal }));
                                }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <Button onClick={() => {
                    const settingsPayload = Object.keys(formData).map(key => ({ key, value: formData[key] }));
                    onSave(settingsPayload.map(s => {
                        const originalSetting = settings.find(os => os.key === s.key);
                        return { ...s, id: originalSetting?.id || '' };
                    }));
                }} variant="primary" size="lg">Save All Settings</Button>
            </div>
        </div>
    );
};

export const BlogsView: React.FC<{ blogs: any[]; onAdd: () => void; onEdit: (b: any) => void; onDelete: (id: string) => void; }> = ({ blogs, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Blog Management</h2>
            <Button onClick={onAdd} variant="primary">Add Blog Post</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {blogs.map(blog => (
                        <tr key={blog.id}>
                            <td className="px-4 py-3 flex items-center">
                                <img src={getImageUrl(blog.imageUrl)} alt={blog.title} className="w-16 h-10 object-cover rounded-md mr-3" />
                                <span className="font-medium text-slate-800">{blog.title}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${blog.type === 'TUTORIAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>{blog.type || 'BLOG'}</span>
                            </td>
                            <td className="px-4 py-3">{blog.category}</td>
                            <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{blog.status}</span>
                            </td>
                            <td className="px-4 py-3">{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(blog)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(blog.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const VideosView: React.FC<{ videos: any[]; onAdd: () => void; onEdit: (v: any) => void; onDelete: (id: string) => void; }> = ({ videos, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Video Management</h2>
            <Button onClick={onAdd} variant="primary">Add Video</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">YouTube ID</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {videos.map(video => (
                        <tr key={video.id}>
                            <td className="px-4 py-3 font-medium text-slate-800">{video.title}</td>
                            <td className="px-4 py-3 font-mono text-xs">{video.youtubeId}</td>
                            <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${video.type === 'FULL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{video.type}</span>
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={video.status} /></td>
                            <td className="px-4 py-3">{video.order}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(video)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(video.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const NewsletterView: React.FC<{ subscribers: any[]; onDelete: (id: string) => void }> = ({ subscribers, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Newsletter Subscribers</h2>
                <p className="text-sm text-slate-500 mt-1">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''} total</p>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Subscribed At</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {subscribers.map(sub => (
                        <tr key={sub.id}>
                            <td className="px-4 py-3 font-medium text-slate-800">{sub.email}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(sub.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center">
                                <button onClick={() => onDelete(sub.id)} className="admin-act admin-act-del">Remove</button>
                            </td>
                        </tr>
                    ))}
                    {subscribers.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No subscribers yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export const StockNotificationsView: React.FC<{ notifications: any[] }> = ({ notifications }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Stock Notification Requests</h2>
                <p className="text-sm text-slate-500 mt-1">{notifications.length} pending request{notifications.length !== 1 ? 's' : ''}</p>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Stock</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Requested At</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {notifications.map(n => (
                        <tr key={n.id}>
                            <td className="px-4 py-3 font-medium text-slate-800">{n.email}</td>
                            <td className="px-4 py-3 text-slate-600">{n.product?.name || '—'}</td>
                            <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${n.product?.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {n.product?.stock > 0 ? `In Stock (${n.product.stock})` : 'Out of Stock'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${n.notified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {n.notified ? 'Notified' : 'Pending'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(n.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {notifications.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No stock notification requests yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export const FaqsView: React.FC<{ faqs: any[]; onAdd: () => void; onEdit: (f: any) => void; onDelete: (id: string) => void; }> = ({ faqs, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">FAQ Management</h2>
            <Button onClick={onAdd} variant="primary">Add FAQ</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Question</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {faqs.map(faq => (
                        <tr key={faq.id}>
                            <td className="px-4 py-3 font-medium text-slate-800 max-w-md truncate">{faq.question}</td>
                            <td className="px-4 py-3 text-xs">{faq.category}</td>
                            <td className="px-4 py-3"><StatusBadge status={faq.status} /></td>
                            <td className="px-4 py-3">{faq.order}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(faq)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(faq.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const BrandsView: React.FC<{ brands: any[]; onAdd: () => void; onEdit: (b: any) => void; onDelete: (id: string) => void; }> = ({ brands, onAdd, onEdit, onDelete }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Brand Management</h2>
            <Button onClick={onAdd} variant="primary">Add Brand</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Brand</th>
                        <th className="px-4 py-3 font-medium">Website</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
                    {brands.map(brand => (
                        <tr key={brand.id}>
                            <td className="px-4 py-3 flex items-center">
                                <img src={getImageUrl(brand.logoUrl)} alt={brand.name} className="w-10 h-10 object-contain rounded-md mr-3 bg-slate-50 p-1" />
                                <span className="font-medium text-slate-800">{brand.name}</span>
                            </td>
                            <td className="px-4 py-3 text-xs">{brand.website || '-'}</td>
                            <td className="px-4 py-3"><StatusBadge status={brand.status} /></td>
                            <td className="px-4 py-3">{brand.order}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(brand)} className="admin-act admin-act-edit mr-2">Edit</button>
                                <button onClick={() => onDelete(brand.id)} className="admin-act admin-act-del">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ALL_PERMISSIONS: { key: keyof StaffPermissions; label: string }[] = [
    { key: 'orders', label: 'Orders' },
    { key: 'products', label: 'Products & Variants' },
    { key: 'categories', label: 'Categories' },
    { key: 'users', label: 'Customers / Newsletter' },
    { key: 'coupons', label: 'Coupons' },
    { key: 'blog', label: 'Blog / Videos / FAQs' },
    { key: 'slides', label: 'Slides / Brands' },
    { key: 'settings', label: 'Settings (view only)' },
];

const emptyStaffForm = () => ({
    name: '', email: '', password: '', role: 'STAFF' as 'STAFF' | 'ADMIN',
    permissions: Object.fromEntries(ALL_PERMISSIONS.map(p => [p.key, false])) as StaffPermissions,
});

export const StaffView: React.FC = () => {
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<StaffUser | null>(null);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState(emptyStaffForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const reload = async () => { setLoading(true); const s = await adminApi.getStaff(); setStaff(s); setLoading(false); };
    useEffect(() => { reload(); }, []);

    const openAdd = () => { setForm(emptyStaffForm()); setAdding(true); setEditing(null); setError(''); };
    const openEdit = (s: StaffUser) => {
        setEditing(s); setAdding(false); setError('');
        setForm({
            name: s.name || '', email: s.email, password: '', role: s.role,
            permissions: { ...Object.fromEntries(ALL_PERMISSIONS.map(p => [p.key, false])), ...(s.permissions || {}) } as StaffPermissions,
        });
    };
    const closeForm = () => { setAdding(false); setEditing(null); };
    const togglePerm = (key: keyof StaffPermissions) =>
        setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            if (adding) {
                if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); setSaving(false); return; }
                await adminApi.createStaff({ name: form.name, email: form.email, password: form.password, role: form.role, permissions: form.permissions });
            } else if (editing) {
                const data: any = { name: form.name, role: form.role, permissions: form.permissions };
                if (form.password) data.password = form.password;
                await adminApi.updateStaff(editing.id, data);
            }
            await reload(); closeForm();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this staff member?')) return;
        await adminApi.deleteStaff(id); await reload();
    };

    const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition";

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Staff & Roles</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Create staff accounts with specific section access.</p>
                </div>
                <Button onClick={openAdd} variant="primary">+ Add Staff</Button>
            </div>

            {(adding || editing) && (
                <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-semibold text-slate-700">{adding ? 'New Staff Member' : `Edit: ${editing?.name || editing?.email}`}</h3>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} />
                        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} disabled={!!editing} />
                        <input placeholder={editing ? 'New password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inp} />
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'STAFF' | 'ADMIN' }))} className={inp}>
                            <option value="STAFF">Staff (permission-based)</option>
                            <option value="ADMIN">Admin (full access)</option>
                        </select>
                    </div>
                    {form.role === 'STAFF' && (
                        <div>
                            <p className="text-sm font-semibold text-slate-600 mb-2">Section Permissions</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {ALL_PERMISSIONS.map(p => (
                                    <label key={p.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition text-sm ${form.permissions[p.key] ? 'border-cyan-400 bg-cyan-50 text-cyan-700 font-medium' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <input type="checkbox" className="hidden" checked={!!form.permissions[p.key]} onChange={() => togglePerm(p.key)} />
                                        <span className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${form.permissions[p.key] ? 'bg-cyan-500 border-cyan-500' : 'border-slate-300'}`}>
                                            {form.permissions[p.key] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" /></svg>}
                                        </span>
                                        {p.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {form.role === 'ADMIN' && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">Admin role has full access to all sections.</p>
                    )}
                    <div className="flex gap-3 pt-1">
                        <Button onClick={handleSave} disabled={saving} variant="primary">{saving ? 'Saving…' : 'Save'}</Button>
                        <Button onClick={closeForm} variant="secondary">Cancel</Button>
                    </div>
                </div>
            )}

            {loading ? <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
            : staff.length === 0 ? <p className="text-sm text-slate-400 py-6 text-center">No staff members yet.</p>
            : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3 pr-4">Name / Email</th>
                            <th className="pb-3 pr-4">Role</th>
                            <th className="pb-3 pr-4">Permissions</th>
                            <th className="pb-3 pr-4">Joined</th>
                            <th className="pb-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {staff.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition">
                                <td className="py-3 pr-4">
                                    <p className="font-medium text-slate-800">{s.name || '—'}</p>
                                    <p className="text-xs text-slate-400">{s.email}</p>
                                </td>
                                <td className="py-3 pr-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'}`}>{s.role}</span>
                                </td>
                                <td className="py-3 pr-4">
                                    {s.role === 'ADMIN' ? <span className="text-xs text-slate-400">All sections</span> : (
                                        <div className="flex flex-wrap gap-1">
                                            {ALL_PERMISSIONS.filter(p => s.permissions?.[p.key]).map(p => (
                                                <span key={p.key} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded">{p.label}</span>
                                            ))}
                                            {!ALL_PERMISSIONS.some(p => s.permissions?.[p.key]) && <span className="text-xs text-slate-300">No permissions set</span>}
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 pr-4 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 text-right space-x-3">
                                    <button onClick={() => openEdit(s)} className="text-cyan-600 hover:underline text-xs font-medium">Edit</button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs font-medium">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export const FlashSalesView: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ salePrice: '', saleEndsAt: '' });
    const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [addId, setAddId] = useState<string | null>(null);
    const [addData, setAddData] = useState({ salePrice: '', saleEndsAt: '' });

    useEffect(() => {
        adminApi.getProducts()
            .then((p: Product[]) => { setProducts(p); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const now = new Date();

    const getSaleStatus = (p: Product): 'active' | 'expired' | 'none' => {
        if (!p.salePrice || !p.saleEndsAt) return 'none';
        return new Date(p.saleEndsAt) > now ? 'active' : 'expired';
    };

    const saleProducts = products.filter(p => p.salePrice);
    const filtered = filter === 'all' ? saleProducts : saleProducts.filter(p => getSaleStatus(p) === filter);
    const noSaleProducts = products.filter(p => !p.salePrice);
    const searchResults = searchTerm.trim()
        ? noSaleProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
        : [];

    const handleEdit = (p: Product) => {
        setEditId(p.id);
        setEditData({
            salePrice: p.salePrice?.toString() || '',
            saleEndsAt: p.saleEndsAt ? new Date(p.saleEndsAt).toISOString().slice(0, 16) : '',
        });
    };

    // Strip relation objects — Prisma rejects category/variants in update body
    const scalarFields = (p: Product) => ({
        name: p.name, slug: p.slug, description: p.description,
        price: p.price, originalPrice: p.originalPrice ?? null,
        imageUrl: p.imageUrl, images: p.images, stock: p.stock,
        categoryId: p.categoryId, sku: p.sku ?? null,
        metaTitle: p.metaTitle ?? null, metaDescription: p.metaDescription ?? null,
    });

    const handleSave = async (p: Product) => {
        setSaving(p.id);
        try {
            const updated = await adminApi.updateProduct(p.id, {
                ...scalarFields(p),
                salePrice: editData.salePrice ? parseFloat(editData.salePrice) : null,
                saleEndsAt: editData.saleEndsAt ? new Date(editData.saleEndsAt).toISOString() : null,
            });
            setProducts(prev => prev.map(x => x.id === p.id ? updated : x));
            setEditId(null);
        } catch {}
        setSaving(null);
    };

    const handleRemove = async (p: Product) => {
        setSaving(p.id);
        try {
            const updated = await adminApi.updateProduct(p.id, { ...scalarFields(p), salePrice: null, saleEndsAt: null });
            setProducts(prev => prev.map(x => x.id === p.id ? updated : x));
        } catch {}
        setSaving(null);
    };

    const handleAddSale = async (p: Product) => {
        if (!addData.salePrice || !addData.saleEndsAt) return;
        setSaving(p.id);
        try {
            const updated = await adminApi.updateProduct(p.id, {
                ...scalarFields(p),
                salePrice: parseFloat(addData.salePrice),
                saleEndsAt: new Date(addData.saleEndsAt).toISOString(),
            });
            setProducts(prev => prev.map(x => x.id === p.id ? updated : x));
            setAddId(null);
            setSearchTerm('');
            setAddData({ salePrice: '', saleEndsAt: '' });
        } catch {}
        setSaving(null);
    };

    const inp = 'border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:border-cyan-500 focus:outline-none';

    const statusBadge = (status: 'active' | 'expired' | 'none') => {
        if (status === 'active') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
        if (status === 'expired') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Expired</span>;
        return null;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">⚡ Flash Sales</h2>
                <p className="text-sm text-slate-500 mt-0.5">Set a sale price and end time on any product to run a flash sale with live countdown.</p>
            </div>

            {/* Add new flash sale */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Start a Flash Sale</h3>
                <input
                    type="text"
                    placeholder="Search product by name..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setAddId(null); }}
                    className={inp + ' w-full mb-2'}
                />
                {searchResults.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {searchResults.map(p => (
                            <div key={p.id} className="p-3">
                                {addId === p.id ? (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-800">{p.name} <span className="text-slate-400 font-normal">— Regular: ₹{p.price.toFixed(2)}</span></p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Sale Price (₹)</label>
                                                <input type="number" placeholder="e.g. 499" value={addData.salePrice} onChange={e => setAddData(d => ({ ...d, salePrice: e.target.value }))} className={inp + ' w-full'} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Sale Ends At</label>
                                                <input type="datetime-local" value={addData.saleEndsAt} onChange={e => setAddData(d => ({ ...d, saleEndsAt: e.target.value }))} className={inp + ' w-full'} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={() => handleAddSale(p)} disabled={saving === p.id || !addData.salePrice || !addData.saleEndsAt} className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition">
                                                {saving === p.id ? 'Saving...' : '⚡ Start Sale'}
                                            </button>
                                            <button onClick={() => { setAddId(null); }} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{p.name}</p>
                                            <p className="text-xs text-slate-400">₹{p.price.toFixed(2)} · {p.category?.name}</p>
                                        </div>
                                        <button onClick={() => { setAddId(p.id); setAddData({ salePrice: '', saleEndsAt: '' }); }} className="text-xs font-semibold text-red-600 hover:underline">+ Add Sale</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {searchTerm.trim() !== '' && searchResults.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1">No products without an active sale found.</p>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(['all', 'active', 'expired'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter === f ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {f} {f === 'all' ? `(${saleProducts.length})` : `(${saleProducts.filter(p => getSaleStatus(p) === f).length})`}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-slate-400 text-sm">Loading products...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-5xl mb-3">⚡</p>
                        <p className="font-medium text-slate-600">No flash sales here</p>
                        <p className="text-xs mt-1">Search for a product above to create one</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Regular</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sale Price</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Discount</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ends At</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(p => {
                                const status = getSaleStatus(p);
                                const disc = p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800 truncate max-w-[200px]">{p.name}</p>
                                            <p className="text-xs text-slate-400">{p.category?.name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-500">₹{p.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {editId === p.id ? (
                                                <input type="number" value={editData.salePrice} onChange={e => setEditData(d => ({ ...d, salePrice: e.target.value }))} className={inp + ' w-24 text-right'} />
                                            ) : (
                                                <span className="font-semibold text-red-600">₹{p.salePrice!.toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {disc > 0 && <span className="text-green-600 font-semibold">{disc}% off</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-slate-500">
                                            {editId === p.id ? (
                                                <input type="datetime-local" value={editData.saleEndsAt} onChange={e => setEditData(d => ({ ...d, saleEndsAt: e.target.value }))} className={inp} />
                                            ) : (
                                                p.saleEndsAt ? new Date(p.saleEndsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">{statusBadge(status)}</td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            {editId === p.id ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => handleSave(p)} disabled={saving === p.id} className="text-xs font-semibold text-cyan-600 hover:underline disabled:opacity-50">{saving === p.id ? 'Saving...' : 'Save'}</button>
                                                    <button onClick={() => setEditId(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3 justify-end">
                                                    <button onClick={() => handleEdit(p)} className="text-xs text-cyan-600 hover:underline">Edit</button>
                                                    <button onClick={() => handleRemove(p)} disabled={saving === p.id} className="text-xs text-red-500 hover:underline disabled:opacity-50">Remove</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const CSV_TEMPLATE_HEADERS = ['name','slug','description','price','originalPrice','stock','category','sku','imageUrl','metaTitle','metaDescription'];
const CSV_SAMPLE_ROW = ['Arduino Uno R3','arduino-uno-r3','The classic Arduino microcontroller board','599','899','50','Microcontrollers','ARD-UNO-R3','https://placehold.co/400x400?text=Arduino','Arduino Uno R3','Buy Arduino Uno R3 at best price'];

export const CsvImportView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<Record<string, string>[]>([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ created: number; errors: number; skipped: number; total: number; results: any[] } | null>(null);
    const [error, setError] = useState('');
    const fileRef = React.useRef<HTMLInputElement>(null);

    const parsePreview = (f: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(l => l.trim()).slice(0, 6);
            if (lines.length < 2) return;
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const rows = lines.slice(1).map(line => {
                const cells: string[] = [];
                let cur = ''; let inQ = false;
                for (const ch of line) {
                    if (ch === '"') { inQ = !inQ; continue; }
                    if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ''; continue; }
                    cur += ch;
                }
                cells.push(cur.trim());
                const row: Record<string, string> = {};
                headers.forEach((h, i) => { row[h] = cells[i] || ''; });
                return row;
            });
            setPreview(rows);
        };
        reader.readAsText(f);
    };

    const handleFile = (f: File) => {
        if (!f.name.endsWith('.csv')) { setError('Please upload a .csv file'); return; }
        setFile(f); setResult(null); setError('');
        parsePreview(f);
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true); setError(''); setResult(null);
        try {
            const res = await adminApi.importProductsCSV(file);
            setResult(res);
        } catch (e: any) {
            setError(e.message || 'Import failed');
        }
        setImporting(false);
    };

    const downloadTemplate = () => {
        const csv = [CSV_TEMPLATE_HEADERS.join(','), CSV_SAMPLE_ROW.map(v => '"' + v + '"').join(',')].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'product_import_template.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const clearAll = () => { setFile(null); setPreview([]); setResult(null); if (fileRef.current) fileRef.current.value = ''; };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-xl font-bold text-slate-800">CSV Product Import</h2>
                <p className="text-sm text-slate-500 mt-0.5">Import multiple products at once. New categories are created automatically if they don't exist.</p>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-cyan-800">Download Template</p>
                    <p className="text-xs text-cyan-600 mt-0.5">Required columns: <span className="font-mono font-bold">name, price</span> — all others optional.</p>
                    <p className="text-xs text-slate-400 mt-1">Columns: {CSV_TEMPLATE_HEADERS.join(', ')}</p>
                </div>
                <button onClick={downloadTemplate} className="flex-shrink-0 px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition">
                    Download Template
                </button>
            </div>

            <div
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/30 transition-all"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                {file ? (
                    <p className="text-sm font-semibold text-slate-700">{file.name} <span className="text-slate-400 font-normal">({(file.size / 1024).toFixed(1)} KB)</span></p>
                ) : (
                    <>
                        <p className="text-sm font-semibold text-slate-600">Drop your CSV here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">Max 5 MB · .csv files only</p>
                    </>
                )}
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

            {preview.length > 0 && !result && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">Preview (first {preview.length} data rows)</p>
                        <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>{Object.keys(preview[0]).map(h => <th key={h} className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {preview.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-slate-600 max-w-[160px] truncate">{v || <span className="text-slate-300">—</span>}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400">Showing first 5 rows. All rows will be imported.</p>
                        <button onClick={handleImport} disabled={importing} className="px-5 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition">
                            {importing ? 'Importing…' : 'Import Products'}
                        </button>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-green-700">{result.created}</p>
                            <p className="text-xs text-green-600 font-semibold mt-1">Created</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-red-600">{result.errors}</p>
                            <p className="text-xs text-red-500 font-semibold mt-1">Errors</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-slate-600">{result.skipped}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-1">Skipped</p>
                        </div>
                    </div>
                    {result.results.some(r => r.status !== 'created') && (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <p className="px-4 py-3 text-sm font-semibold text-slate-700 border-b border-slate-100">Issues</p>
                            <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto">
                                {result.results.filter(r => r.status !== 'created').map((r: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${r.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{r.status}</span>
                                        <span className="text-xs text-slate-700">Row {r.row}: <span className="font-medium">{r.name}</span></span>
                                        {r.reason && <span className="text-xs text-slate-400 ml-auto truncate max-w-[200px]">{r.reason}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button onClick={clearAll} className="text-sm text-cyan-600 hover:underline">Import another file</button>
                </div>
            )}
        </div>
    );
};

const txTypeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    CREDIT_ORDER:    { label: 'Order Reward',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '🛍️' },
    CREDIT_REFERRAL: { label: 'Referral Bonus', color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    icon: '🎁' },
    CREDIT_ADMIN:    { label: 'Admin Credit',   color: 'text-violet-400',  bg: 'bg-violet-500/10',  icon: '✦' },
    DEBIT_ORDER:     { label: 'Redeemed',       color: 'text-rose-400',    bg: 'bg-rose-500/10',    icon: '💸' },
    DEBIT_ADMIN:     { label: 'Admin Debit',    color: 'text-orange-400',  bg: 'bg-orange-500/10',  icon: '✦' },
};

export const WalletView: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [history, setHistory] = useState<WalletTransaction[]>([]);
    const [adjustPts, setAdjustPts] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [adjustMode, setAdjustMode] = useState<'credit' | 'debit'>('credit');

    useEffect(() => {
        adminApi.getUsers().then((u: AdminUser[]) => setUsers(u)).finally(() => setLoading(false));
    }, []);

    const openUser = async (u: AdminUser) => {
        setSelectedUser(u);
        setHistory([]);
        const h = await adminApi.getUserWalletHistory(u.id);
        setHistory(h);
    };

    const handleAdjust = async () => {
        if (!selectedUser || !adjustPts) return;
        setSaving(true);
        try {
            const pts = adjustMode === 'debit' ? -Math.abs(parseInt(adjustPts)) : Math.abs(parseInt(adjustPts));
            const res = await adminApi.adjustUserWallet(selectedUser.id, pts, adjustReason);
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, walletBalance: res.walletBalance } : u));
            setSelectedUser(prev => prev ? { ...prev, walletBalance: res.walletBalance } : prev);
            const h = await adminApi.getUserWalletHistory(selectedUser.id);
            setHistory(h);
            setMsg({ text: `${adjustMode === 'credit' ? 'Credited' : 'Debited'} ${Math.abs(parseInt(adjustPts))} pts`, ok: true });
            setAdjustPts(''); setAdjustReason('');
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const customers = users.filter(u => u.role === 'CUSTOMER' || !u.role);
    const filtered = customers.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    const totalPoints = customers.reduce((s, u) => s + ((u as any).walletBalance ?? 0), 0);
    const usersWithPoints = customers.filter(u => ((u as any).walletBalance ?? 0) > 0).length;
    const selectedBalance = (selectedUser as any)?.walletBalance ?? 0;

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Wallet & Points</h1>
                <p className="text-sm text-slate-400 mt-0.5">Manage customer loyalty points and transaction history</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Points Issued', value: totalPoints.toLocaleString(), icon: '🪙', color: 'from-amber-400 to-amber-500' },
                    { label: 'Active Wallets', value: usersWithPoints, icon: '👛', color: 'from-cyan-400 to-cyan-500' },
                    { label: 'Total Customers', value: customers.length, icon: '👥', color: 'from-violet-400 to-violet-500' },
                    { label: '₹ Value in Circulation', value: `₹${totalPoints.toLocaleString()}`, icon: '💰', color: 'from-emerald-400 to-emerald-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-base mb-3`}>{s.icon}</div>
                        <p className="text-xl font-bold text-slate-800">{s.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {msg && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <span>{msg.ok ? '✓' : '✕'}</span> {msg.text}
                </div>
            )}

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Customer list */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
                        <input type="text" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 focus:outline-none bg-white shadow-sm" />
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs text-slate-400">Loading customers…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-12 text-center text-sm text-slate-400">No customers found</div>
                        ) : (
                            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto custom-scrollbar">
                                {filtered.map(u => {
                                    const bal = (u as any).walletBalance ?? 0;
                                    const initials = (u.name || u.email).trim().split(/\s+/).map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();
                                    const isSelected = selectedUser?.id === u.id;
                                    return (
                                        <button key={u.id} onClick={() => openUser(u)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected ? 'bg-cyan-50 border-l-2 border-cyan-500' : 'hover:bg-slate-50 border-l-2 border-transparent'}`}>
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{u.name || '—'}</p>
                                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className={`text-sm font-bold ${bal > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{bal.toLocaleString()}</span>
                                                <p className="text-[10px] text-slate-400">pts</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="lg:col-span-3">
                    {selectedUser ? (
                        <div className="space-y-4">
                            {/* User card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {(selectedUser.name || selectedUser.email).trim().split(/\s+/).map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800">{selectedUser.name || '—'}</p>
                                        <p className="text-sm text-slate-400">{selectedUser.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-amber-500">{selectedBalance.toLocaleString()}</p>
                                        <p className="text-xs text-slate-400">points = ₹{selectedBalance.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Adjust form */}
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Manual Adjustment</p>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => setAdjustMode('credit')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${adjustMode === 'credit' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                            + Credit
                                        </button>
                                        <button onClick={() => setAdjustMode('debit')}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${adjustMode === 'debit' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                            − Debit
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative w-32">
                                            <input type="number" min="1" placeholder="Points" value={adjustPts} onChange={e => setAdjustPts(e.target.value)}
                                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 focus:outline-none" />
                                        </div>
                                        <input type="text" placeholder="Reason (e.g. promo, correction)" value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                                            className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 focus:outline-none" />
                                        <button onClick={handleAdjust} disabled={saving || !adjustPts}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 ${adjustMode === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                                            {saving ? '…' : 'Apply'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction history */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                    <p className="text-sm font-bold text-slate-800">Transaction History</p>
                                    <span className="text-xs text-slate-400">{history.length} transactions</span>
                                </div>
                                {history.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-2xl mb-2">🪙</p>
                                        <p className="text-sm text-slate-400">No transactions yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto custom-scrollbar">
                                        {history.map(tx => {
                                            const cfg = txTypeConfig[tx.type] || { label: tx.type, color: 'text-slate-400', bg: 'bg-slate-100', icon: '•' };
                                            return (
                                                <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                                                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center text-sm flex-shrink-0`}>
                                                        {cfg.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 truncate">{tx.description}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                                            <span className="text-[11px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-bold flex-shrink-0 ${tx.points > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()} pts
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-center p-8">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-3">🪙</div>
                            <p className="font-semibold text-slate-700">Select a customer</p>
                            <p className="text-sm text-slate-400 mt-1">Click any customer on the left to view their wallet and adjust points</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ReturnsView: React.FC = () => {
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getReturns();
            setReturns(data);
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDecide = async (returnId: string, status: 'APPROVED' | 'REJECTED', refundMode: string, adminNote: string) => {
        setProcessingId(returnId);
        setMsg(null);
        try {
            await adminApi.updateReturn(returnId, { status, refundMode, adminNote });
            setMsg({ text: `Return ${status.toLowerCase()} successfully.`, ok: true });
            setExpandedId(null);
            await load();
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally {
            setProcessingId(null);
        }
    };

    const statusColor = (s: string) =>
        s === 'APPROVED' ? 'bg-green-100 text-green-700'
        : s === 'REJECTED' ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Return Requests</h2>
                <button onClick={load} className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors">Refresh</button>
            </div>
            {msg && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>
            )}
            {loading ? (
                <div className="py-16 text-center text-slate-400">Loading returns…</div>
            ) : returns.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No return requests yet.</div>
            ) : (
                <div className="space-y-3">
                    {returns.map(ret => (
                        <ReturnRow
                            key={ret.id}
                            ret={ret}
                            expanded={expandedId === ret.id}
                            onToggle={() => setExpandedId(expandedId === ret.id ? null : ret.id)}
                            onDecide={handleDecide}
                            processing={processingId === ret.id}
                            statusColor={statusColor}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ReturnRow: React.FC<{
    ret: Return;
    expanded: boolean;
    onToggle: () => void;
    onDecide: (id: string, status: 'APPROVED' | 'REJECTED', refundMode: string, adminNote: string) => void;
    processing: boolean;
    statusColor: (s: string) => string;
}> = ({ ret, expanded, onToggle, onDecide, processing, statusColor }) => {
    const [refundMode, setRefundMode] = useState<'wallet' | 'original'>('wallet');
    const [adminNote, setAdminNote] = useState('');
    const pointsEarned = (ret as any).order?.pointsEarned ?? 0;

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor(ret.status)}`}>{ret.status}</span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{ret.user?.name || ret.user?.email}</p>
                        <p className="text-xs text-slate-400">Order #{ret.orderId.slice(-8).toUpperCase()} · ₹{ret.refundAmount?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-slate-400 hidden sm:block">{new Date(ret.createdAt).toLocaleDateString()}</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>
            {expanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Customer Reason</p>
                        <p className="text-sm text-slate-700">{ret.reason}</p>
                    </div>
                    {ret.adminNote && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Admin Note</p>
                            <p className="text-sm text-slate-600">{ret.adminNote}</p>
                        </div>
                    )}
                    {pointsEarned > 0 && (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            {pointsEarned} loyalty points were earned on delivery and will be <strong>automatically deducted</strong> from the customer's wallet on approval.
                        </div>
                    )}
                    {ret.status === 'PENDING' && (
                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1">Admin Note (optional)</label>
                                <input
                                    type="text"
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    placeholder="Reason for decision…"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-600 mb-2">Refund method (on approval)</p>
                                <div className="space-y-2">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input type="radio" name={`refund-${ret.id}`} value="wallet" checked={refundMode === 'wallet'} onChange={() => setRefundMode('wallet')} className="mt-0.5 text-cyan-600 focus:ring-cyan-500" />
                                        <div>
                                            <span className="text-sm font-medium text-slate-700">Credit ₹{ret.refundAmount?.toFixed(2)} to customer wallet</span>
                                            <p className="text-xs text-slate-400">Instant — added to loyalty wallet balance</p>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input type="radio" name={`refund-${ret.id}`} value="original" checked={refundMode === 'original'} onChange={() => setRefundMode('original')} className="mt-0.5 text-cyan-600 focus:ring-cyan-500" />
                                        <div>
                                            <span className="text-sm font-medium text-slate-700">Original payment method</span>
                                            <p className="text-xs text-slate-400">Manual — you must initiate the PhonePe/bank refund separately</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => onDecide(ret.id, 'APPROVED', refundMode, adminNote)}
                                    disabled={processing}
                                    className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Processing…' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => onDecide(ret.id, 'REJECTED', refundMode, adminNote)}
                                    disabled={processing}
                                    className="flex-1 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Processing…' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
