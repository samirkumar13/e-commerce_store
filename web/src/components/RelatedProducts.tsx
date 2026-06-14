import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { fetchRelatedProducts } from '../services/api';

interface RelatedProductsProps {
  productId: string;
  showNotification: (msg: string) => void;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productId, showNotification }) => {
  const [related, setRelated] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelatedProducts(productId)
      .then((data: Product[]) => setRelated(data))
      .catch(() => {});
  }, [productId]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 border-t border-slate-100 pt-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {related.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onProductSelect={(slug) => navigate(`/product/${slug}`)}
            showNotification={showNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
