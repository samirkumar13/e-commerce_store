import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { fetchProducts } from '../services/api';
import ProductCard from './ProductCard';
import Container from './UIElements/Container';

interface SharedWishlistPageProps {
  onNavigate: (route: any) => void;
  showNotification: (msg: string) => void;
}

const SharedWishlistPage: React.FC<SharedWishlistPageProps> = ({ onNavigate, showNotification }) => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const rawSlugs = searchParams.get('items') || '';
  const slugs = rawSlugs ? rawSlugs.split(',').filter(Boolean) : [];

  useEffect(() => {
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }
    // Fetch all products and filter by the shared slugs client-side.
    // This avoids needing a new backend endpoint.
    fetchProducts({ limit: 1000 })
      .then((data: any) => {
        const all: Product[] = data.products ?? data;
        const matched = slugs
          .map(slug => all.find((p: Product) => p.slug === slug))
          .filter(Boolean) as Product[];
        setProducts(matched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSlugs]);

  if (loading) {
    return <div className="py-20 text-center">Loading shared wishlist...</div>;
  }

  if (slugs.length === 0 || products.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Shared Wishlist</h1>
        <p className="text-slate-600">This wishlist is empty or the link is invalid.</p>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold mb-2">Shared Wishlist</h1>
      <p className="text-slate-500 mb-8">{products.length} item{products.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onProductSelect={(slug) => onNavigate({ page: 'product', slug })}
            showNotification={showNotification}
          />
        ))}
      </div>
    </Container>
  );
};

export default SharedWishlistPage;
