import React, { useState, useEffect } from 'react';
import { Product, AdminUser, Category, HomeSlide, Order, Coupon, Setting } from '../../types';
import Button from '../UIElements/Button';
import ImageUploader from '../ImageUploader';
import { getImageUrl } from '../../utils/imageUtils';
import { Period } from './types';
import { StatusBadge, StatCard, LowStockWidget } from './shared';
import { UsersIcon, OrdersIcon, ProductsIcon, CategoriesIcon } from './icons';

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
            </form>

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
