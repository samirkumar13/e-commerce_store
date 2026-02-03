import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import Button from './UIElements/Button';
import { getImageUrl } from '../utils/imageUtils';

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Guest check removed
    addToCart(product.id, 1, product);
    showNotification(`${product.name} added to cart!`);
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? allImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const isLastSlide = currentIndex === allImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
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
        <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden bg-slate-100">
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
              {discountPercentage}% OFF
            </div>
          )}
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
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
          {hasDiscount && (
            <p className="text-sm text-slate-500 line-through">₹{product.originalPrice!.toFixed(2)}</p>
          )}
        </div>
        <div className="mt-4">
          {!user?.isAdmin && (
            <>
              {product.stock > 0 ? (
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