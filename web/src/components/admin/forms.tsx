import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, ProductVariant, AdminUser, Category, HomeSlide, Order, Coupon } from '../../types';
import Button from '../UIElements/Button';
import ImageUploader from '../ImageUploader';
import { getImageUrl } from '../../utils/imageUtils';
import * as adminApi from '../../services/adminApi';

const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const emptyVariant = () => ({ name: '', price: '', originalPrice: '', stock: '0', sku: '' });

const VariantManager: React.FC<{ productId: string; initial: ProductVariant[] }> = ({ productId, initial }) => {
    const [variants, setVariants] = useState<ProductVariant[]>(initial);
    const [newV, setNewV] = useState(emptyVariant());
    const [editId, setEditId] = useState<string | null>(null);
    const [editV, setEditV] = useState(emptyVariant());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const reload = async () => {
        const fresh = await adminApi.getVariants(productId);
        setVariants(fresh);
    };

    const handleAdd = async () => {
        if (!newV.name.trim() || !newV.price) { setError('Name and price are required.'); return; }
        setSaving(true); setError('');
        try {
            await adminApi.createVariant(productId, {
                name: newV.name.trim(),
                price: parseFloat(newV.price),
                originalPrice: newV.originalPrice ? parseFloat(newV.originalPrice) : null,
                stock: parseInt(newV.stock, 10) || 0,
                sku: newV.sku.trim() || undefined,
            });
            setNewV(emptyVariant());
            await reload();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const handleSaveEdit = async () => {
        if (!editId) return;
        setSaving(true); setError('');
        try {
            await adminApi.updateVariant(productId, editId, {
                name: editV.name.trim(),
                price: parseFloat(editV.price),
                originalPrice: editV.originalPrice ? parseFloat(editV.originalPrice) : null,
                stock: parseInt(editV.stock, 10) || 0,
                sku: editV.sku.trim() || undefined,
            });
            setEditId(null);
            await reload();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this variant?')) return;
        try {
            await adminApi.deleteVariant(productId, id);
            await reload();
        } catch (e: any) { setError(e.message); }
    };

    const inp = "border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none";

    return (
        <div className="border-t pt-4 mt-2">
            <h4 className="text-md font-semibold mb-3 text-slate-700">Product Variants</h4>
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

            {variants.length > 0 && (
                <table className="w-full text-xs mb-4 border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                        <tr>
                            <th className="px-3 py-2 text-left">Name</th>
                            <th className="px-3 py-2 text-right">Price</th>
                            <th className="px-3 py-2 text-right">MRP</th>
                            <th className="px-3 py-2 text-right">Stock</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {variants.map(v => (
                            <tr key={v.id}>
                                {editId === v.id ? (
                                    <>
                                        <td className="px-3 py-2"><input value={editV.name} onChange={e => setEditV(p => ({ ...p, name: e.target.value }))} className={inp + ' w-full'} /></td>
                                        <td className="px-3 py-2"><input type="number" value={editV.price} onChange={e => setEditV(p => ({ ...p, price: e.target.value }))} className={inp + ' w-20 text-right'} /></td>
                                        <td className="px-3 py-2"><input type="number" value={editV.originalPrice} onChange={e => setEditV(p => ({ ...p, originalPrice: e.target.value }))} className={inp + ' w-20 text-right'} /></td>
                                        <td className="px-3 py-2"><input type="number" value={editV.stock} onChange={e => setEditV(p => ({ ...p, stock: e.target.value }))} className={inp + ' w-16 text-right'} /></td>
                                        <td className="px-3 py-2 text-right space-x-2">
                                            <button type="button" onClick={handleSaveEdit} disabled={saving} className="text-green-600 font-semibold hover:underline">Save</button>
                                            <button type="button" onClick={() => setEditId(null)} className="text-slate-400 hover:underline">Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-3 py-2 font-medium text-slate-800">{v.name}</td>
                                        <td className="px-3 py-2 text-right">₹{v.price.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right text-slate-400">{v.originalPrice ? `₹${v.originalPrice.toFixed(2)}` : '—'}</td>
                                        <td className="px-3 py-2 text-right">{v.stock}</td>
                                        <td className="px-3 py-2 text-right space-x-2">
                                            <button type="button" onClick={() => { setEditId(v.id); setEditV({ name: v.name, price: v.price.toString(), originalPrice: v.originalPrice?.toString() || '', stock: v.stock.toString(), sku: v.sku || '' }); }} className="text-cyan-600 hover:underline">Edit</button>
                                            <button type="button" onClick={() => handleDelete(v.id)} className="text-red-500 hover:underline">Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Add Variant</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input placeholder="Variant name (e.g. Red / 64GB)" value={newV.name} onChange={e => setNewV(p => ({ ...p, name: e.target.value }))} className={inp + ' col-span-2'} />
                    <input type="number" placeholder="Price" value={newV.price} onChange={e => setNewV(p => ({ ...p, price: e.target.value }))} className={inp} />
                    <input type="number" placeholder="MRP (optional)" value={newV.originalPrice} onChange={e => setNewV(p => ({ ...p, originalPrice: e.target.value }))} className={inp} />
                    <input type="number" placeholder="Stock" value={newV.stock} onChange={e => setNewV(p => ({ ...p, stock: e.target.value }))} className={inp} />
                    <input placeholder="SKU (optional)" value={newV.sku} onChange={e => setNewV(p => ({ ...p, sku: e.target.value }))} className={inp} />
                </div>
                <button type="button" onClick={handleAdd} disabled={saving} className="w-full py-1.5 text-sm font-semibold text-cyan-600 border border-cyan-300 rounded-lg hover:bg-cyan-50 transition disabled:opacity-50">
                    {saving ? 'Saving…' : '+ Add Variant'}
                </button>
            </div>
        </div>
    );
};

// --- Gallery Manager ---
// Props: primaryUrl + gallery array; callbacks to set primary and reorder/add/remove gallery
const GalleryManager: React.FC<{
    primaryUrl: string;
    images: string[];
    onPrimaryChange: (url: string) => void;
    onImagesChange: (images: string[]) => void;
}> = ({ primaryUrl, images, onPrimaryChange, onImagesChange }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const dragIndexRef = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // All slots: primary first, then gallery
    const allImages = primaryUrl ? [primaryUrl, ...images] : images;

    const handleMultiUpload = useCallback(async (files: FileList) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
        if (validFiles.length === 0) { setError('No valid image files selected (max 5 MB each).'); return; }
        setError(null);
        setUploading(true);
        setUploadProgress({ done: 0, total: validFiles.length });
        const uploaded: string[] = [];
        for (const file of validFiles) {
            try {
                const url = await adminApi.uploadImage(file, 'products');
                uploaded.push(url);
                setUploadProgress(p => p ? { ...p, done: p.done + 1 } : null);
            } catch {
                // skip failed files
            }
        }
        setUploading(false);
        setUploadProgress(null);
        if (uploaded.length === 0) { setError('All uploads failed.'); return; }
        if (!primaryUrl && uploaded.length > 0) {
            onPrimaryChange(uploaded[0]);
            onImagesChange([...images, ...uploaded.slice(1)]);
        } else {
            onImagesChange([...images, ...uploaded]);
        }
    }, [primaryUrl, images, onPrimaryChange, onImagesChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) handleMultiUpload(e.dataTransfer.files);
    }, [handleMultiUpload]);

    const handlePromoteToPrimary = (img: string) => {
        // Swap img into primary; push old primary into gallery at front
        const newGallery = images.filter(i => i !== img);
        if (primaryUrl) newGallery.unshift(primaryUrl);
        onPrimaryChange(img);
        onImagesChange(newGallery);
    };

    const handleRemove = (img: string) => {
        if (img === primaryUrl) {
            // Promote first gallery image to primary
            onPrimaryChange(images[0] || '');
            onImagesChange(images.slice(1));
        } else {
            onImagesChange(images.filter(i => i !== img));
        }
    };

    // Drag-to-reorder within allImages (primary stays index 0 semantically but user can reorder freely)
    const handleDragStart = (index: number) => { dragIndexRef.current = index; };
    const handleDropOnThumb = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const from = dragIndexRef.current;
        if (from === null || from === dropIndex) return;
        const reordered = [...allImages];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(dropIndex, 0, moved);
        onPrimaryChange(reordered[0]);
        onImagesChange(reordered.slice(1));
        dragIndexRef.current = null;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Product Images</label>
                <span className="text-xs text-slate-400">{allImages.length} image{allImages.length !== 1 ? 's' : ''} · drag to reorder</span>
            </div>

            {/* Thumbnail grid */}
            {allImages.length > 0 && (
                <div
                    className="flex flex-wrap gap-3"
                    onDragOver={e => e.preventDefault()}
                >
                    {allImages.map((img, index) => (
                        <div
                            key={img + index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnd={() => { dragIndexRef.current = null; }}
                            onDrop={e => handleDropOnThumb(e, index)}
                            onDragOver={e => e.preventDefault()}
                            className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all"
                            style={{ borderColor: index === 0 ? 'rgb(6 182 212)' : 'rgb(226 232 240)' }}
                        >
                            <img src={getImageUrl(img)} alt="" draggable={false} className="w-full h-full object-cover" />

                            {/* Primary badge */}
                            {index === 0 && (
                                <span className="absolute bottom-0 left-0 right-0 bg-cyan-500/90 text-white text-[10px] font-semibold text-center py-0.5">
                                    Primary
                                </span>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                {index !== 0 && (
                                    <button
                                        type="button"
                                        title="Set as primary"
                                        onClick={() => handlePromoteToPrimary(img)}
                                        className="w-7 h-7 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full flex items-center justify-center"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    title="Remove"
                                    onClick={() => handleRemove(img)}
                                    className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Drop zone / add button */}
            <div
                onDragOver={e => { e.preventDefault(); }}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${uploading ? 'opacity-60 pointer-events-none border-slate-200' : 'border-slate-300 hover:border-cyan-400 hover:bg-cyan-50 cursor-pointer'}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                        if (e.target.files) handleMultiUpload(e.target.files);
                        e.target.value = ''; // reset so the same files can be re-selected
                    }}
                />
                {uploading && uploadProgress ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-500">Uploading {uploadProgress.done}/{uploadProgress.total}…</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span className="text-sm">Click or drop to add images</span>
                        <span className="text-xs">Select multiple files at once · PNG, JPG, WebP up to 5 MB</span>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

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
        salePrice: product?.salePrice?.toString() || '',
        saleEndsAt: product?.saleEndsAt ? new Date(product.saleEndsAt).toISOString().slice(0, 16) : '',
        metaTitle: product?.metaTitle || '',
        metaDescription: product?.metaDescription || '',
        isReturnable: product?.isReturnable !== undefined ? product.isReturnable : true,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price) || 0,
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
            saleEndsAt: formData.saleEndsAt ? new Date(formData.saleEndsAt).toISOString() : null,
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

            <GalleryManager
                primaryUrl={formData.imageUrl}
                images={formData.images}
                onPrimaryChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                onImagesChange={imgs => setFormData(prev => ({ ...prev, images: imgs }))}
            />

            <div className="grid grid-cols-2 gap-4">
                <input name="price" type="text" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
                <input name="originalPrice" type="text" value={formData.originalPrice} onChange={handleChange} placeholder="Original Price (Optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            </div>

            {/* Flash Sale */}
            <div className="border border-red-200 bg-red-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">⚡ Flash Sale (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                    <input name="salePrice" type="text" value={formData.salePrice} onChange={handleChange} placeholder="Sale Price" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-red-400 focus:ring-2 focus:ring-red-400/20 focus:outline-none transition" />
                    <input name="saleEndsAt" type="datetime-local" value={formData.saleEndsAt} onChange={handleChange} className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-red-400 focus:ring-2 focus:ring-red-400/20 focus:outline-none transition" />
                </div>
                <p className="text-[11px] text-red-400 mt-1.5">Leave both blank to disable. Sale price overrides regular price until the end time.</p>
            </div>
            <div className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
                <div>
                    <p className="text-sm font-medium text-slate-700">Returnable Product</p>
                    <p className="text-xs text-slate-400 mt-0.5">Allow customers to request a return for this product</p>
                </div>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isReturnable: !prev.isReturnable }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isReturnable ? 'bg-cyan-500' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.isReturnable ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
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
            {product?.id && (
                <VariantManager productId={product.id} initial={product.variants || []} />
            )}
            {!product?.id && (
                <p className="text-xs text-slate-400 border-t pt-3 mt-2">Save the product first to add variants.</p>
            )}
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
        perUserLimit: coupon?.perUserLimit?.toString() || '',
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
            perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : null,
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
                <input name="usageLimit" type="number" value={formData.usageLimit} onChange={handleChange} placeholder="Global Usage Limit (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
                <input name="perUserLimit" type="number" value={formData.perUserLimit} onChange={handleChange} placeholder="Per-User Limit (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            </div>
            <input name="minCartValue" type="number" value={formData.minCartValue} onChange={handleChange} placeholder="Min. Cart Value (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
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

export const FaqForm: React.FC<{ faq?: any; onSave: (f: any) => void; onCancel: () => void; }> = ({ faq, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        question: faq?.question || '',
        answer: faq?.answer || '',
        category: faq?.category || 'General',
        status: faq?.status || 'ACTIVE',
        order: faq?.order || 0,
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.name === 'order' ? parseInt(e.target.value) || 0 : e.target.value }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="question" value={formData.question} onChange={handleChange} placeholder="Question" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <textarea name="answer" value={formData.answer} onChange={handleChange} placeholder="Answer" rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <input name="category" value={formData.category} onChange={handleChange} placeholder="Category (e.g. Shipping, Returns, General)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" required />
            <div className="grid grid-cols-2 gap-4">
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition">
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                </select>
                <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Display Order" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button type="submit" variant="primary">Save FAQ</Button>
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
