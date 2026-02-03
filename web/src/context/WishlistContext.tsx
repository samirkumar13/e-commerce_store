
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as apiService from '../services/api';
import { useAuth } from './AuthContext';
import { Product } from '../types';

interface WishlistItem {
    id: string;
    product: Product;
    productId: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    loading: boolean;
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_WISHLIST_KEY = 'guest_wishlist';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Helper to get local wishlist
    const getLocalWishlist = (): WishlistItem[] => {
        const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    };

    // Helper to save local wishlist
    const saveLocalWishlist = (items: WishlistItem[]) => {
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
        setWishlist(items);
    };

    const refreshWishlist = useCallback(async () => {
        if (isAuthenticated) {
            setLoading(true);
            try {
                // MERGE LOGIC
                const localItems = getLocalWishlist();
                if (localItems.length > 0) {
                    console.log("Merging guest wishlist...");
                    for (const item of localItems) {
                        try {
                            await apiService.addToWishlist(item.productId);
                        } catch (e) {
                            console.error("Failed to merge wishlist item", e);
                        }
                    }
                    localStorage.removeItem(LOCAL_WISHLIST_KEY);
                }

                const data = await apiService.getWishlist();
                // Backend returns object with items array
                setWishlist(data.items || []);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
                setWishlist([]);
            } finally {
                setLoading(false);
            }
        } else {
            setWishlist(getLocalWishlist());
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    const addToWishlist = async (product: Product) => {
        if (isAuthenticated) {
            try {
                await apiService.addToWishlist(product.id);
                // Refresh to get sync
                refreshWishlist();
            } catch (e) {
                console.error("Add to wishlist failed", e);
            }
        } else {
            const current = getLocalWishlist();
            if (!current.find(i => i.productId === product.id)) {
                const newItem: WishlistItem = {
                    id: `local-${Date.now()}`,
                    product,
                    productId: product.id
                };
                current.push(newItem);
                saveLocalWishlist(current);
            }
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (isAuthenticated) {
            try {
                await apiService.removeFromWishlist(productId);
                refreshWishlist();
            } catch (e) {
                console.error("Remove from wishlist failed", e);
            }
        } else {
            const current = getLocalWishlist();
            const updated = current.filter(i => i.productId !== productId);
            saveLocalWishlist(updated);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item.productId === productId);
    };

    const value = {
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
