
import React, { useState } from 'react';
import { useWishlist } from '../hooks/useWishlist';
import ProductCard from './ProductCard';
import Container from './UIElements/Container';
import Button from './UIElements/Button';

const WishlistView: React.FC<{ onNavigate: (route: any) => void; showNotification: (msg: string) => void }> = ({ onNavigate, showNotification }) => {
    const { wishlist, loading } = useWishlist();
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        const slugs = wishlist.map((item: any) => item.product.slug).join(',');
        const url = `${window.location.origin}/#/wishlist/shared?items=${encodeURIComponent(slugs)}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
                <p className="text-slate-500">Loading wishlist...</p>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
                <div className="text-6xl mb-4">🤍</div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Your Wishlist is Empty</h1>
                <p className="text-slate-500 text-sm mb-8">Save items you love and come back to them later.</p>
                <Button onClick={() => onNavigate({ page: 'products' })} variant="primary">Browse Products</Button>
            </div>
        );
    }

    return (
        <Container className="py-12">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Your Wishlist ({wishlist.length})</h1>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Link copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Share Wishlist
                        </>
                    )}
                </button>
            </div>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {wishlist.map((item: any) => (
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
