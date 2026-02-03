
import React from 'react';
import { useWishlist } from '../hooks/useWishlist';
import ProductCard from './ProductCard';
import Container from './UIElements/Container';
import Button from './UIElements/Button';

const WishlistView: React.FC<{ onNavigate: (route: any) => void; showNotification: (msg: string) => void }> = ({ onNavigate, showNotification }) => {
    const { wishlist, loading } = useWishlist();

    if (loading) {
        return <div className="py-20 text-center">Loading wishlist...</div>;
    }

    if (wishlist.length === 0) {
        return (
            <Container className="py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Wishlist</h1>
                <p className="text-slate-600 mb-8">You haven't saved any items yet.</p>
                <Button onClick={() => onNavigate({ page: 'products' })} variant="primary">Browse Products</Button>
            </Container>
        );
    }

    return (
        <Container className="py-12">
            <h1 className="text-3xl font-bold mb-8">Your Wishlist ({wishlist.length})</h1>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {wishlist.map((item) => (
                    <ProductCard
                        key={item.id}
                        product={item.product}
                        onProductSelect={(slug) => onNavigate({ page: 'product', slug })}
                        showNotification={showNotification}
                    />
                ))}
            </div>
        </Container>
    );
};

export default WishlistView;
