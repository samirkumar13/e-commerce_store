import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import * as apiService from '../services/api';

interface FeaturedProductsProps {
  products: Product[];
  onProductSelect: (slug: string) => void;
  showNotification: (message: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products: initialProducts, onProductSelect, showNotification }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Fetch fresh on mount so flash sales / stock changes are always current
  useEffect(() => {
    apiService.fetchProducts({ limit: 12, sort: 'newest' })
      .then((r: any) => { if (r.products?.length) setProducts(r.products); })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const display = products.slice(0, 12);

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Featured Products</h2>
        <p className="mt-4 text-lg text-slate-600">Check out our hand-picked selection of popular components.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-x-8 sm:gap-y-12">
        {display.map((product, index) => (
          <div key={product.id} className={index >= 4 ? 'hidden lg:block' : ''}>
            <ProductCard product={product} onProductSelect={onProductSelect} showNotification={showNotification} />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <a href="#/products" className="inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-focus md:text-lg transition-colors shadow-sm">
          View All Products
        </a>
      </div>
    </div>
  );
};

export default FeaturedProducts;
