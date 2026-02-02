import React from 'react';
import { Category } from '../types';
import { getImageUrl } from '../utils/imageUtils';

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  if (categories.length === 0) return null;

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Shop by Category</h2>
        <p className="mt-4 text-lg text-slate-600">Find the components you need by browsing our categories.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {categories.map(category => (
          <a
            key={category.id}
            href={`#/category/${category.slug}`}
            className="group relative flex flex-col justify-end items-center text-center p-6 bg-slate-200 rounded-lg overflow-hidden h-40 hover:shadow-lg transition-all"
          >
            {/* Background Image */}
            {category.imageUrl && (
              <img
                src={getImageUrl(category.imageUrl)}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}

            <div
              className={`absolute inset-0 transition-all ${category.imageUrl ? 'bg-black/40 group-hover:bg-black/50' : 'bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/75'}`}
            />
            <h3 className="relative text-lg font-bold text-white z-10">{category.name}</h3>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
