import React, { useState, useEffect } from 'react';
import { Product, AdminUser, Category, HomeSlide, Order, Coupon } from '../../types';
import Button from '../UIElements/Button';
import ImageUploader from '../ImageUploader';
import { getImageUrl } from '../../utils/imageUtils';

const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const ProductForm: React.FC<{ product?: Product; categories: Category[], onSave: (p: any) => void; onCancel: () => void; }> = ({ product, categories, onSave, onCancel }) => {
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

    useEffect(() => {
        if (!isSlugManuallyEdited) {
            setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
        }
    }, [formData.name, isSlugManuallyEdited]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (['price', 'originalPrice', 'stock'].includes(name)) {
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
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" rows={4} />
            <input name="slug" value={formData.slug} onChange={(e) => { setIsSlugManuallyEdited(true); handleChange(e); }} placeholder="URL Slug (e.g., product-name)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />

            <ImageUploader
                currentImage={formData.imageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="products"
                label="Main Product Image"
                placeholder="Click to upload or drag and drop the main product image"
            />

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Images</label>
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
                <ImageUploader
                    onUpload={handleAddImage}
                    uploadType="products"
                    label=""
                    placeholder="Add another image"
                    currentImage=""
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input name="price" type="text" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
                <input name="originalPrice" type="text" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price (Optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            </div>
            <input name="stock" type="text" value={formData.stock} onChange={handleChange} placeholder="Stock" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold mb-2 text-slate-600">SEO Settings</h4>
                <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="SEO Meta Title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} placeholder="SEO Meta Description" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-2" rows={2} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Product</Button>
            </div>
        </form>
    );
};

export const CategoryForm: React.FC<{ category?: Category; onSave: (c: any) => void; onCancel: () => void; }> = ({ category, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        slug: category?.slug || '',
        status: category?.status || 'ACTIVE',
        imageUrl: category?.imageUrl || '',
        metaTitle: category?.metaTitle || '',
        metaDescription: category?.metaDescription || '',
    });
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!category?.slug);

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
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Category Name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <input name="slug" value={formData.slug} onChange={(e) => { setIsSlugManuallyEdited(true); handleChange(e); }} placeholder="URL Slug (e.g., category-name)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />

            <ImageUploader
                currentImage={formData.imageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="categories"
                label="Category Image (Optional)"
                placeholder="Click to upload or drag and drop a category image"
            />

            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
            </select>
            <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold mb-2 text-slate-600">SEO Settings</h4>
                <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="SEO Meta Title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} placeholder="SEO Meta Description" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-2" rows={2} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Category</Button>
            </div>
        </form>
    );
};

export const SlideForm: React.FC<{ slide?: HomeSlide; onSave: (s: any) => void; onCancel: () => void; }> = ({ slide, onSave, onCancel }) => {
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
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Slide Title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />

            <ImageUploader
                currentImage={formData.imageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                uploadType="slides"
                label="Slide Banner Image"
                placeholder="Click to upload or drag and drop banner image (recommended: 1920x600)"
            />

            <input name="linkUrl" value={formData.linkUrl} onChange={handleChange} placeholder="Link URL (e.g., #/product/some-id)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Display Order" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required>
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

export const OrderForm: React.FC<{ order: Order; onSave: (o: any) => void; onCancel: () => void; }> = ({ order, onSave, onCancel }) => {
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
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" required>
                    {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tracking Number</label>
                <input name="trackingNumber" value={formData.trackingNumber} onChange={handleChange} placeholder="Enter tracking number" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition mt-1" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Update Order</Button>
            </div>
        </form>
    );
};

export const UserForm: React.FC<{ user: AdminUser; onSave: (u: any) => void; onCancel: () => void; }> = ({ user, onSave, onCancel }) => {
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
            <input name="name" value={formData.name} onChange={handleChange} placeholder="User Name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
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

export const CouponForm: React.FC<{ coupon?: Coupon; onSave: (c: any) => void; onCancel: () => void; }> = ({ coupon, onSave, onCancel }) => {
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
            <input name="code" value={formData.code} onChange={handleChange} placeholder="Coupon Code (e.g., SUMMER10)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition uppercase" required />
            <div className="grid grid-cols-2 gap-4">
                <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition">
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                </select>
                <input name="discountValue" type="number" value={formData.discountValue} onChange={handleChange} placeholder="Discount Value" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            </div>
            <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            <div className="grid grid-cols-2 gap-4">
                <input name="usageLimit" type="number" value={formData.usageLimit} onChange={handleChange} placeholder="Usage Limit (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
                <input name="minCartValue" type="number" value={formData.minCartValue} onChange={handleChange} placeholder="Min. Cart Value (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Coupon</Button>
            </div>
        </form>
    );
};

export const InvoiceView: React.FC<{ order: Order, settings: Record<string, string>, onPrint: () => void }> = ({ order, settings, onPrint }) => (
    <div id="invoice-content" className="text-slate-800">
        <div className="flex justify-between items-start pb-4 border-b">
            <div>
                <h2 className="text-2xl font-bold">{settings.storeName || 'Qurion Tech'}</h2>
                <p className="text-sm">{settings.storeAddress}</p>
                <p className="text-sm">{settings.storeEmail}</p>
                <p className="text-sm">{settings.storePhone}</p>
            </div>
            <div className="text-right">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">INVOICE</h3>
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
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium text-center">Qty</th>
                        <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr]:transition-colors [&>tr:hover]:bg-slate-50/60">
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

export const BlogForm: React.FC<{ blog?: any; onSave: (b: any) => void; onCancel: () => void; }> = ({ blog, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: blog?.title || '',
        slug: blog?.slug || '',
        excerpt: blog?.excerpt || '',
        content: blog?.content || '',
        imageUrl: blog?.imageUrl || '',
        category: blog?.category || '',
        type: blog?.type || 'BLOG',
        status: blog?.status || 'DRAFT',
    });
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!blog?.slug);
    useEffect(() => { if (!isSlugManuallyEdited) setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) })); }, [formData.title, isSlugManuallyEdited]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Blog Title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <input name="slug" value={formData.slug} onChange={(e) => { setIsSlugManuallyEdited(true); handleChange(e); }} placeholder="URL Slug" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <input name="category" value={formData.category} onChange={handleChange} placeholder="Category (e.g. Tutorial, News)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <ImageUploader currentImage={formData.imageUrl} onUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} uploadType="blogs" label="Cover Image" placeholder="Upload blog cover image" />
            <input name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="Short Excerpt" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Full Content" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" rows={8} required />
            <div className="grid grid-cols-2 gap-4">
                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition">
                    <option value="BLOG">Blog Post</option>
                    <option value="TUTORIAL">Tutorial</option>
                </select>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Blog Post</Button>
            </div>
        </form>
    );
};

export const VideoForm: React.FC<{ video?: any; onSave: (v: any) => void; onCancel: () => void; }> = ({ video, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: video?.title || '',
        youtubeId: video?.youtubeId || '',
        type: video?.type || 'FULL',
        category: video?.category || '',
        description: video?.description || '',
        status: video?.status || 'ACTIVE',
        order: video?.order || 0,
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.name === 'order' ? parseInt(e.target.value) || 0 : e.target.value }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Video Title" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <input name="youtubeId" value={formData.youtubeId} onChange={handleChange} placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <div className="grid grid-cols-2 gap-4">
                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition">
                    <option value="FULL">Full Video</option>
                    <option value="SHORT">Short</option>
                </select>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>
            <input name="category" value={formData.category} onChange={handleChange} placeholder="Category (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" rows={3} />
            <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Display Order" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Video</Button>
            </div>
        </form>
    );
};

export const BrandForm: React.FC<{ brand?: any; onSave: (b: any) => void; onCancel: () => void; }> = ({ brand, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: brand?.name || '',
        logoUrl: brand?.logoUrl || '',
        website: brand?.website || '',
        status: brand?.status || 'ACTIVE',
        order: brand?.order || 0,
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.name === 'order' ? parseInt(e.target.value) || 0 : e.target.value }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Brand Name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <ImageUploader currentImage={formData.logoUrl} onUpload={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))} uploadType="brands" label="Brand Logo" placeholder="Upload brand logo" />
            <input name="website" value={formData.website} onChange={handleChange} placeholder="Website URL (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            <div className="grid grid-cols-2 gap-4">
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Display Order" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save Brand</Button>
            </div>
        </form>
    );
};
