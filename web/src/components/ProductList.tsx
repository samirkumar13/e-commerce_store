
import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onProductSelect: (slug: string) => void;
  showNotification: (message: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, categories, onProductSelect, showNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    let result = [...products];

    // Filter by Search Term
    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // Assuming products come sorted by newest from backend or original order
        break;
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">All Products</h2>
        <p className="mt-4 text-lg text-slate-600">Browse our complete catalog of components.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-1/3 relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <select
            className="border border-slate-300 rounded-md px-4 py-2 focus:ring-primary focus:border-primary bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            className="border border-slate-300 rounded-md px-4 py-2 focus:ring-primary focus:border-primary bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} showNotification={showNotification} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <h3 className="text-lg font-medium text-slate-900">No products found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
            className="mt-4 text-primary hover:text-primary-focus font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
