

import React from 'react';
import { Product, Category } from '../types';
// Fix: Import the ProductCard component to resolve the 'ProductCard is not defined' error.
import ProductCard from './ProductCard';
import Button from './UIElements/Button';

interface CategoryViewProps {
  category: Category | undefined;
  products: Product[];
  onProductSelect: (slug: string) => void;
  showNotification: (message: string) => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category, products, onProductSelect, showNotification }) => {
  
  if (!category) {
    return (
        <div className="text-center py-20">
            <h1 className="text-3xl font-bold">Category Not Found</h1>
            <p className="mt-2 text-slate-600">The category you're looking for doesn't seem to exist.</p>
            <Button href="#/" variant="primary" size="lg" className="mt-6">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {category.name}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
            Browse all products in the {category.name} category.
        </p>
      </div>
      {products.length > 0 ? (
         <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} showNotification={showNotification} />
            ))}
        </div>
      ) : (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-slate-800">No Products Found</h2>
            <p className="mt-2 text-slate-600">There are currently no products available in this category.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryView;