import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import Button from './UIElements/Button';
import { getImageUrl } from '../utils/imageUtils';
import CountdownTimer from './CountdownTimer';

interface ProductCardProps {
  product: Product;
  onProductSelect: (slug: string) => void;
  showNotification: (message: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect, showNotification }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      showNotification('Removed from wishlist');
    } else {
      addToWishlist(product);
      showNotification('Added to wishlist');
    }
  };

  const allImages = [getImageUrl(product.imageUrl), ...(product.images || []).map(img => getImageUrl(img))].filter(Boolean).filter((img, index, self) => self.indexOf(img) === index);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [saleExpired, setSaleExpired] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product.id, 1, product);
    showNotification(`${product.name} added to cart!`);
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(i => (i === 0 ? allImages.length - 1 : i - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(i => (i === allImages.length - 1 ? 0 : i + 1));
  };

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const minVariantPrice = hasVariants ? Math.min(...variants.map(v => v.price)) : null;
  const totalVariantStock = hasVariants ? variants.reduce((s, v) => s + v.stock, 0) : null;

  // Flash sale logic
  const isFlashSale = !saleExpired && !!product.salePrice && !!product.saleEndsAt && new Date(product.saleEndsAt) > new Date();
  const effectivePrice = isFlashSale ? product.salePrice! : (hasVariants ? minVariantPrice! : product.price);
  const displayPrice = hasVariants ? minVariantPrice! : effectivePrice;
  const displayStock = hasVariants ? totalVariantStock! : product.stock;

  const originalForDiscount = isFlashSale ? product.price : product.originalPrice;
  const hasDiscount = !hasVariants && originalForDiscount && originalForDiscount > displayPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalForDiscount! - displayPrice) / originalForDiscount!) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col relative">
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm transition-all"
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${inWishlist ? 'text-red-500 fill-current' : 'text-slate-500'}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      </button>

      <a
        href={`#/product/${product.slug}`}
        className="block"
        onClick={(e) => { e.preventDefault(); onProductSelect(product.slug); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full overflow-hidden bg-slate-100" style={{ height: '220px' }}>
          {/* Badge: Flash Sale takes priority over regular discount */}
          {isFlashSale ? (
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                ⚡ FLASH SALE
              </span>
              {discountPercentage > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full self-start">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          ) : hasDiscount ? (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
              {discountPercentage}% OFF
            </div>
          ) : null}

          {allImages.length > 1 && isHovered && (
            <>
              <button onClick={goToPrevious} className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10 bg-white/50 hover:bg-white rounded-full p-1.5 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={goToNext} className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10 bg-white/50 hover:bg-white rounded-full p-1.5 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <img
            src={allImages[currentIndex]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
              {allImages.map((_, index) => (
                <div key={index} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`}></div>
              ))}
            </div>
          )}
        </div>
      </a>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm text-slate-500">{product.category?.name || 'General'}</h3>
        <h4 className="mt-1 font-semibold text-slate-800 truncate flex-grow">
          <a href={`#/product/${product.slug}`} onClick={(e) => { e.preventDefault(); onProductSelect(product.slug); }} className="hover:text-primary transition-colors">
            {product.name}
          </a>
        </h4>

        {/* Flash sale countdown */}
        {isFlashSale && product.saleEndsAt && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-red-500 font-medium">Ends in</span>
            <CountdownTimer endsAt={product.saleEndsAt} size="sm" onExpire={() => setSaleExpired(true)} />
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-2">
          <p className={`text-lg font-bold ${isFlashSale ? 'text-red-600' : 'text-primary'}`}>
            {hasVariants ? 'From ' : ''}₹{displayPrice.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="text-sm text-slate-400 line-through">₹{originalForDiscount!.toFixed(2)}</p>
          )}
          {hasVariants && <p className="text-xs text-slate-400">{variants.length} options</p>}
        </div>

        <div className="mt-4">
          {!user?.isAdmin && (
            <>
              {hasVariants ? (
                <Button onClick={(e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); onProductSelect(product.slug); }} variant="primary" size="sm" className="w-full">
                  Select Options
                </Button>
              ) : displayStock > 0 ? (
                <Button onClick={handleAddToCart} variant="primary" size="sm" className="w-full">
                  Add to Cart
                </Button>
              ) : (
                <Button size="sm" className="w-full bg-slate-400 text-white cursor-not-allowed" disabled>
                  Out of Stock
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
