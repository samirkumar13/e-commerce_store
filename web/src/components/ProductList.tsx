
import React, { useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';
import * as api from '../services/api';

interface ProductListProps {
  categories: Category[];
  onProductSelect: (slug: string) => void;
  showNotification: (message: string) => void;
}

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

const ProductList: React.FC<ProductListProps> = ({ categories, onProductSelect, showNotification }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, totalPages: 1, limit: 12 });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products from API when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.fetchProducts({
        search: debouncedSearch,
        category: selectedCategory,
        sort: sortBy,
        page: currentPage,
        limit: 12,
      });
      setProducts(result.products);
      setPagination({
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showNotification('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortBy, currentPage, showNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle category change - reset to page 1
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle sort change - reset to page 1
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { totalPages, page } = pagination;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) pages.push('...');

      // Show pages around current
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push('...');

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Calculate showing range
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

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
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            className="border border-slate-300 rounded-md px-4 py-2 focus:ring-primary focus:border-primary bg-white"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} showNotification={showNotification} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Showing X-Y of Z */}
              <p className="text-sm text-slate-600">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{pagination.total}</span> products
              </p>

              {/* Page Numbers */}
              <nav className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === page
                          ? 'bg-primary text-white'
                          : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 py-2 text-slate-400">...</span>
                  )
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <h3 className="text-lg font-medium text-slate-900">No products found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
          <button
            onClick={handleClearFilters}
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
