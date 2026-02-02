import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import Container from './UIElements/Container';
import { Route } from '../App';
import { Product } from '../types';
import { getImageUrl } from '../utils/imageUtils';

interface HeaderProps {
  onNavigate: (route: Route) => void;
  allProducts: Product[];
  storeName: string;
  settings?: Record<string, string>;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, allProducts, storeName, settings }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    // Filter the provided allProducts array instead of fetching
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchTerm, allProducts]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    onNavigate({ page: 'home' });
  };

  const handleProductSelect = (slug: string) => {
    onNavigate({ page: 'product', slug });
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchFocused(false);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleProductSelect(searchResults[0].slug);
    } else {
      // If no direct match, go to products page
      onNavigate({ page: 'products' });
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <a href="#/" onClick={() => onNavigate({ page: 'home' })} className="flex items-center gap-2 text-2xl font-bold text-slate-800">
              {settings?.storeLogo ? (
                <img src={getImageUrl(settings.storeLogo)} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <span>{storeName}</span>
              )}
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="#/" onClick={() => onNavigate({ page: 'home' })} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Home</a>
              <a href="#/products" onClick={() => onNavigate({ page: 'products' })} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Shop</a>
            </nav>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg mx-8 hidden md:block">
            <input
              type="text"
              placeholder="Search for components..."
              className="w-full pl-4 pr-24 py-2 text-sm border border-slate-300 rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center px-4 font-semibold text-sm bg-primary text-white rounded-r-full hover:bg-primary-focus w-24 gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search
            </button>

            {isSearchFocused && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto max-h-80 z-50">
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.slice(0, 5).map(product => (
                      <li key={product.id} onMouseDown={() => handleProductSelect(product.slug)} className="hover:bg-slate-100">
                        <a href={`#/product/${product.slug}`} className="flex items-center p-3 cursor-pointer">
                          <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-800">{product.name}</p>
                            <p className="text-sm text-primary">₹{product.price.toFixed(2)}</p>
                          </div>
                        </a>
                      </li>
                    ))}
                    <li onMouseDown={() => onNavigate({ page: 'products' })} className="p-3 text-center text-sm text-primary font-medium hover:bg-slate-50 cursor-pointer">
                      View all results
                    </li>
                  </ul>
                ) : (
                  <p className="p-4 text-sm text-slate-500">No results found.</p>
                )}
              </div>
            )}
          </form>

          <div className="flex items-center space-x-4">
            <a href="#/cart" onClick={() => onNavigate({ page: 'cart' })} className="relative p-2 text-slate-600 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{cartCount}</span>}
            </a>
            {isAuthenticated && user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-100">
                  <span className="font-medium text-sm text-slate-700 hidden sm:inline">Hi, {user.name?.split(' ')[0] || 'User'}</span>
                  <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {!user.isAdmin && <a href="#/account" onClick={() => { onNavigate({ page: 'account' }); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">My Account</a>}
                    {user.isAdmin && <a href="#/admin" onClick={() => { onNavigate({ page: 'admin' }); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Admin Dashboard</a>}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <a href="#/login" onClick={() => onNavigate({ page: 'login' })} className="flex items-center text-sm font-medium text-slate-600 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Login
              </a>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
