import React, { useState, useCallback } from 'react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import Button from './UIElements/Button';
import * as apiService from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import ReviewSection from './ReviewSection';
import Breadcrumbs from './Breadcrumbs';
import ImageZoom from './ImageZoom';
import { useSeoMeta } from '../hooks/useSeoMeta';
import RelatedProducts from './RelatedProducts';
import StockNotifyForm from './StockNotifyForm';
import CountdownTimer from './CountdownTimer';

interface ProductDetailProps {
  product: Product;
  showNotification: (message: string) => void;
}

type Tab = 'description' | 'specifications' | 'reviews';

const ProductDetail: React.FC<ProductDetailProps> = ({ product, showNotification }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const [saleExpired, setSaleExpired] = useState(false);
  const handleSaleExpire = useCallback(() => setSaleExpired(true), []);

  // Flash sale: only applies to base product (not per-variant)
  const isFlashSale = !selectedVariant && !saleExpired && !!product.salePrice && !!product.saleEndsAt && new Date(product.saleEndsAt) > new Date();

  // Active price/stock/discount derived from selected variant or base product
  const activePrice = isFlashSale ? product.salePrice! : (selectedVariant ? selectedVariant.price : product.price);
  const activeOriginalPrice = isFlashSale
    ? product.price
    : selectedVariant ? (selectedVariant.originalPrice ?? undefined) : product.originalPrice;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;

  useSeoMeta({
    title: product.metaTitle || `${product.name} | Qurion Tech`,
    description: product.metaDescription || product.description?.slice(0, 160) || '',
    image: getImageUrl(product.imageUrl),
    type: 'product',
  });

  // If selected variant has an image, show it first
  const variantImage = selectedVariant?.imageUrl ? getImageUrl(selectedVariant.imageUrl) : null;
  const baseImages = [getImageUrl(product.imageUrl), ...(product.images || []).map(img => getImageUrl(img))]
    .filter((img, index, self) => img && self.indexOf(img) === index);
  const allImages = variantImage && !baseImages.includes(variantImage)
    ? [variantImage, ...baseImages]
    : baseImages;
  const [currentIndex, setCurrentIndex] = useState(0);

  const [pincode, setPincode] = useState('');
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{ date?: string; error?: string } | null>(null);

  const hasDiscount = activeOriginalPrice && activeOriginalPrice > activePrice;
  const discountPct = hasDiscount ? Math.round(((activeOriginalPrice! - activePrice) / activeOriginalPrice!) * 100) : 0;
  const savings = hasDiscount ? activeOriginalPrice! - activePrice : 0;
  const lowStock = activeStock > 0 && activeStock <= 5;

  const handleSelectVariant = (v: ProductVariant) => {
    setSelectedVariant(v);
    setQuantity(1);
    // If variant has its own image, jump to it
    if (v.imageUrl) {
      const vi = getImageUrl(v.imageUrl);
      const idx = allImages.indexOf(vi);
      if (idx >= 0) setCurrentIndex(idx);
      else setCurrentIndex(0);
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity, product, selectedVariant?.id, selectedVariant?.name);
    const variantLabel = selectedVariant ? ` (${selectedVariant.name})` : '';
    showNotification(`${quantity} × ${product.name}${variantLabel} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, product, selectedVariant?.id, selectedVariant?.name);
    window.location.hash = '/checkout';
  };

  const handleCheckDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryResult({ error: 'Please enter a valid 6-digit pincode.' });
      return;
    }
    setCheckingDelivery(true);
    setDeliveryResult(null);
    try {
      const result = await apiService.checkDeliveryServiceability(pincode);
      setDeliveryResult({ date: result.estimatedDate });
    } catch {
      setDeliveryResult({ error: 'Could not verify delivery for this pincode.' });
    } finally {
      setCheckingDelivery(false);
    }
  };

  const specs = product.specifications as Record<string, string> | null;

  return (
    <div className="py-6 md:py-10">
      {/* Breadcrumb */}
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
        { label: product.name },
      ]} />

      {/* Main product layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">

        {/* ── LEFT: Image Gallery ── */}
        <div className="flex gap-3 lg:sticky lg:top-24 self-start">
          {/* Vertical thumbnails */}
          {allImages.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${currentIndex === i ? 'border-primary ring-1 ring-primary' : 'border-slate-200 hover:border-primary opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 relative">
            <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ width: '100%', maxWidth: 450, height: 450 }}>
              {/* Discount badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {discountPct}% OFF
                </div>
              )}
              {/* Wishlist */}
              <button
                onClick={() => {
                  if (inWishlist) { removeFromWishlist(product.id); showNotification('Removed from wishlist'); }
                  else { addToWishlist(product); showNotification('Added to wishlist'); }
                }}
                className={`absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full shadow transition-all ${inWishlist ? 'bg-red-50 text-red-500' : 'bg-white text-slate-400 hover:text-red-500'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
              <ImageZoom src={allImages[currentIndex]} alt={product.name} />
              {/* Arrows */}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setCurrentIndex(i => (i === 0 ? allImages.length - 1 : i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center transition">
                    <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => setCurrentIndex(i => (i === allImages.length - 1 ? 0 : i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center transition">
                    <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>

            {/* Mobile dot indicators */}
            {allImages.length > 1 && (
              <div className="sm:hidden flex justify-center gap-1.5 mt-3">
                {allImages.map((_, i) => (
                  <button key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'bg-primary w-4' : 'bg-slate-300'}`} />
                ))}
              </div>
            )}

            {/* Mobile thumbnail row */}
            {allImages.length > 1 && (
              <div className="sm:hidden flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setCurrentIndex(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${currentIndex === i ? 'border-primary' : 'border-slate-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="flex flex-col">
          {/* Category + SKU */}
          <div className="flex items-center justify-between mb-2">
            <a href={`#/category/${product.category?.slug}`} className="text-sm font-medium text-primary hover:underline">{product.category?.name}</a>
            {product.sku && <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{product.name}</h1>

          {/* Stock badge */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {activeStock > 0 ? (
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                Out of Stock
              </span>
            )}
            {lowStock && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Only {activeStock} left!
              </span>
            )}
          </div>

          {/* Flash Sale Banner */}
          {isFlashSale && product.saleEndsAt && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Flash Sale</p>
                  <p className="text-xs text-red-400">Hurry! Limited time offer</p>
                </div>
              </div>
              <CountdownTimer endsAt={product.saleEndsAt} size="md" onExpire={handleSaleExpire} />
            </div>
          )}

          {/* Price */}
          <div className="mt-4 pb-4 border-b border-slate-100">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className={`text-3xl font-bold ${isFlashSale ? 'text-red-600' : 'text-slate-900'}`}>₹{activePrice.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-slate-400 line-through">₹{activeOriginalPrice!.toFixed(2)}</span>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">{discountPct}% off</span>
                </>
              )}
            </div>
            {hasDiscount && (
              <p className="mt-1 text-sm text-green-700 font-medium">You save ₹{savings.toFixed(2)}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">Inclusive of all taxes</p>
          </div>

          {/* Variant selector */}
          {hasVariants && (
            <div className="mt-4 pb-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Variant: <span className="font-normal text-slate-900">{selectedVariant?.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVariant(v)}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-primary bg-primary text-white'
                        : v.stock === 0
                          ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed line-through'
                          : 'border-slate-300 text-slate-700 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {v.name}
                    {v.stock === 0 && ' (OOS)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key highlights */}
          {product.description && (
            <div className="mt-4 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Highlights</h3>
              <ul className="space-y-1">
                {product.description.split('\n').filter(l => l.trim()).slice(0, 4).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {line.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity + Actions */}
          {!user?.isAdmin && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 w-16">Qty</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition text-lg font-medium">−</button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(activeStock || 99, q + 1))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition text-lg font-medium">+</button>
                </div>
              </div>

              {activeStock > 0 ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-focus transition-colors flex items-center justify-center gap-2"
                    style={{ borderRadius: 'var(--radius-btn, 12px)' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Buy Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-12 bg-slate-100 text-slate-400 font-semibold rounded-xl flex items-center justify-center cursor-not-allowed">
                    Out of Stock
                  </div>
                  <StockNotifyForm productId={product.id} />
                </div>
              )}
            </div>
          )}

          {/* Delivery check */}
          <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-sm font-semibold text-slate-700">Check Delivery</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleCheckDelivery()}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
              />
              <button
                onClick={handleCheckDelivery}
                disabled={checkingDelivery}
                className="px-4 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/5 transition disabled:opacity-50"
              >
                {checkingDelivery ? '…' : 'Check'}
              </button>
            </div>
            {deliveryResult && (
              <p className={`mt-2 text-sm font-medium flex items-center gap-1 ${deliveryResult.error ? 'text-red-600' : 'text-green-700'}`}>
                {deliveryResult.error ? (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>{deliveryResult.error}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Estimated delivery by {new Date(deliveryResult.date!).toDateString()}</>
                )}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ── Tabs: Description / Specifications / Reviews ── */}
      <div className="mt-12 border-t border-slate-200">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {([
            { id: 'description', label: 'Description' },
            ...(specs && Object.keys(specs).length > 0 ? [{ id: 'specifications', label: 'Specifications' }] : []),
            { id: 'reviews', label: 'Reviews' },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="max-w-3xl">
              <div className="prose prose-slate text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && specs && (
            <div className="max-w-2xl">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="py-3 pr-6 font-medium text-slate-500 w-40 align-top">{key}</td>
                      <td className="py-3 text-slate-800">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewSection productId={product.id} />
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts productId={product.id} showNotification={showNotification} />

      {/* Sticky mobile bottom bar */}
      {!user?.isAdmin && activeStock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-slate-200 p-3 flex gap-3 shadow-2xl">
          <button
            onClick={handleAddToCart}
            className="flex-1 h-11 border-2 border-primary text-primary font-semibold rounded-xl text-sm hover:bg-primary/5 transition"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 h-11 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-focus transition"
            style={{ borderRadius: 'var(--radius-btn, 12px)' }}
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
