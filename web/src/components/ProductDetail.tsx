import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Button from './UIElements/Button';
import * as apiService from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

interface ProductDetailProps {
  product: Product;
  showNotification: (message: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, showNotification }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Combine imageUrl and images array for the gallery, ensuring no duplicates and filtering out empty strings.
  const allImages = [getImageUrl(product.imageUrl), ...(product.images || []).map(img => getImageUrl(img))].filter((img, index, self) => img && self.indexOf(img) === index);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Delivery Check State
  const [pincode, setPincode] = useState('');
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{ date?: string; error?: string } | null>(null);


  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.hash = '#/login';
      return;
    }
    addToCart(product.id, quantity);
    showNotification(`${quantity} x ${product.name} added to cart!`);
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
    } catch (err) {
      setDeliveryResult({ error: 'Could not verify delivery for this pincode.' });
    } finally {
      setCheckingDelivery(false);
    }
  };

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? allImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === allImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-w-1 aspect-h-1 bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
            <img src={allImages[currentIndex]} alt={product.name} className="w-full h-full object-cover" />
            {allImages.length > 1 && (
              <>
                <button onClick={goToPrevious} className="absolute top-1/2 left-3 transform -translate-y-1/2 z-10 bg-white/60 hover:bg-white rounded-full p-2 transition shadow-md" aria-label="Previous image">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goToNext} className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10 bg-white/60 hover:bg-white rounded-full p-2 transition shadow-md" aria-label="Next image">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-4">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === index ? 'border-primary ring-2 ring-primary' : 'border-slate-200 hover:border-primary'}`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Product Info */}
        <div>
          <span className="text-sm font-medium text-primary">{product.category.name}</span>
          <h1 className="text-4xl font-bold text-slate-900 mt-1">{product.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            {product.stock > 0 ? (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">In Stock</span>
            ) : (
              <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">Out of Stock</span>
            )}
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xl text-slate-500 line-through">₹{product.originalPrice.toFixed(2)}</p>
            )}
          </div>

          <div className="prose max-w-none text-slate-600 mt-4">
            <p>{product.description}</p>
          </div>

          {/* Delivery Check Section */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 max-w-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Check Delivery Availability</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button onClick={handleCheckDelivery} variant="secondary" size="sm" disabled={checkingDelivery}>
                {checkingDelivery ? '...' : 'Check'}
              </Button>
            </div>
            {deliveryResult && (
              <div className="mt-2 text-sm">
                {deliveryResult.error ? (
                  <span className="text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {deliveryResult.error}
                  </span>
                ) : (
                  <span className="text-green-700 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Estimated Delivery by {new Date(deliveryResult.date!).toDateString()}
                  </span>
                )}
              </div>
            )}
          </div>


          {!user?.isAdmin && (
            <div className="mt-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-slate-300 rounded-md">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-l-md">-</button>
                  <input type="number" value={quantity} readOnly className="w-12 text-center border-none focus:ring-0 bg-transparent" />
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-r-md">+</button>
                </div>
                {product.stock > 0 ? (
                  <Button onClick={handleAddToCart} variant="primary" size="lg" className="flex-grow">
                    Add to Cart
                  </Button>
                ) : (
                  <Button size="lg" className="flex-grow bg-slate-400 text-white cursor-not-allowed" disabled>
                    Out of Stock
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
