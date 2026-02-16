import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import Container from './UIElements/Container';
import { Route } from '../App';
import { Product } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { Search, ShoppingCart, Heart, User, Menu, ChevronDown, Package, Phone, BookOpen, X } from 'lucide-react';

interface HeaderProps {
  onNavigate: (route: Route) => void;
  allProducts: Product[];
  storeName: string;
  settings?: Record<string, string>;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, allProducts, storeName, settings }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // States
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  // Scroll State for Smart Sticky
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollThreshold = 10;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) {
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide
        setIsVisible(false);
      } else {
        // Scrolling up - show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchTerm, allProducts]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    onNavigate({ page: 'home' });
  };

  const handleProductSelect = (slug: string) => {
    onNavigate({ page: 'product', slug });
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleProductSelect(searchResults[0].slug);
    } else {
      onNavigate({ page: 'products' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={`bg-white fixed top-0 left-0 right-0 z-40 shadow-lg border-b border-slate-100 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {/* Primary Header Row */}
        <Container>
          <div className="grid grid-cols-3 items-center h-20 gap-4">

            {/* Left: Logo + Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-primary transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <a href="#/" onClick={() => onNavigate({ page: 'home' })} className="flex items-center gap-2 text-xl md:text-2xl font-black text-slate-800 tracking-tighter hover:opacity-90 transition-opacity flex-shrink-0">
                {settings?.storeLogo ? (
                  <img src={getImageUrl(settings.storeLogo)} alt={storeName} className="h-10 md:h-12 w-auto object-contain" />
                ) : (
                  <span className="bg-gradient-to-br from-primary to-primary-focus bg-clip-text text-transparent">{storeName}</span>
                )}
              </a>
            </div>

            {/* Center: Search Bar (Perfectly Centered) */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative group">
                <input
                  type="text"
                  placeholder="Search over 10,000 components..."
                  className="w-full pl-6 pr-14 py-3 text-sm border-2 border-slate-100 rounded-2xl group-hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-slate-50/50 focus:bg-white shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-focus transition-all shadow-md group-active:scale-95">
                  <Search className="w-5 h-5" />
                </button>

                {isSearchFocused && searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 border-b border-slate-50">Suggestions</div>
                        <ul className="divide-y divide-slate-50">
                          {searchResults.slice(0, 5).map(product => (
                            <li key={product.id} onMouseDown={() => handleProductSelect(product.slug)} className="hover:bg-primary/5 transition-colors">
                              <div className="flex items-center p-4 cursor-pointer">
                                <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 mr-4 border border-slate-100 p-1">
                                  <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-slate-800 truncate">{product.name}</p>
                                  <span className="text-primary font-black text-xs">₹{product.price.toLocaleString()}</span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button onMouseDown={() => onNavigate({ page: 'products' })} className="w-full p-4 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100">
                          View all products
                        </button>
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">No results found for "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-1 md:gap-4">
              <button onClick={() => onNavigate({ page: 'wishlist' })} className="relative p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all group">
                <Heart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button onClick={() => onNavigate({ page: 'cart' })} className="relative p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all group">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white animate-bounce-short">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block"></div>

              {isAuthenticated && user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                    <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-black shadow-md shadow-primary/20">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700 hidden lg:inline">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-5 py-3 border-b border-slate-50 mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                      </div>
                      {user.isAdmin && (
                        <button onClick={() => { onNavigate({ page: 'admin' }); setUserMenuOpen(false); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 transition-colors">
                          Admin Dashboard
                        </button>
                      )}
                      <button onClick={() => { onNavigate({ page: 'account' }); setUserMenuOpen(false); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Profile Settings
                      </button>
                      <div className="h-px bg-slate-50 my-2"></div>
                      <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onNavigate({ page: 'login' })}
                  className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
            </div>
          </div>
        </Container>

        {/* Secondary Navigation Row (Desktop Only) */}
        <div className="border-t border-slate-50 hidden lg:block">
          <Container>
            <div className="flex items-center justify-center h-12 gap-10">
              <a href="#/" onClick={() => onNavigate({ page: 'home' })} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors py-3">Home</a>

              <div
                className="relative py-3 group"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <button className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                  Shop <ChevronDown className={`w-4 h-4 transition-transform ${shopOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>

                {shopOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-[400px] bg-white rounded-b-3xl shadow-2xl border-x border-b border-slate-100 p-6 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Discover</h4>
                        <ul className="space-y-3">
                          <li>
                            <button onClick={() => onNavigate({ page: 'categories' })} className="text-sm font-bold text-slate-700 hover:text-primary flex items-center gap-2 group/link">
                              <Menu className="w-4 h-4 text-slate-300 group-hover/link:text-primary" /> All Categories
                            </button>
                          </li>
                          <li>
                            <button onClick={() => onNavigate({ page: 'products' })} className="text-sm font-bold text-slate-700 hover:text-primary flex items-center gap-2 group/link">
                              <Search className="w-4 h-4 text-slate-300 group-hover/link:text-primary" /> Featured
                            </button>
                          </li>
                          <li>
                            <button onClick={() => onNavigate({ page: 'products' })} className="text-sm font-bold text-slate-700 hover:text-primary flex items-center gap-2 group/link">
                              <ShoppingCart className="w-4 h-4 text-slate-300 group-hover/link:text-primary" /> Shop All
                            </button>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-800 mb-2">New Arrivals</p>
                        <p className="text-[10px] text-slate-500 mb-4">Check out the latest robotics kits and sensors.</p>
                        <button onClick={() => onNavigate({ page: 'products' })} className="text-[10px] font-bold text-primary flex items-center gap-1">
                          Browse Now <ChevronDown className="-rotate-90 w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <a href="#/blogs" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors flex items-center gap-1.5 py-3 border-b-2 border-transparent hover:border-primary">
                <BookOpen className="w-4 h-4" /> Blogs
              </a>
              <button onClick={() => onNavigate(isAuthenticated ? { page: 'account' } : { page: 'login' })} className="text-sm font-bold text-slate-600 hover:text-primary transition-colors flex items-center gap-1.5 py-3 border-b-2 border-transparent hover:border-primary">
                <Package className="w-4 h-4" /> Track Order
              </button>
              <a href="#/" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors flex items-center gap-1.5 py-3 border-b-2 border-transparent hover:border-primary">
                <Phone className="w-4 h-4" /> Bulk Enquiry
              </a>
            </div>
          </Container>
        </div>
      </header>

      {/* Spacer to prevent content jump due to fixed header */}
      <div className="h-20 lg:h-32"></div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>

        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white shadow-2xl transition-transform duration-300 ease-out transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xl font-black text-primary tracking-tighter">{storeName}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-6 border-b border-slate-50">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search components..."
                  className="w-full pl-5 pr-12 py-3 text-sm border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 bg-primary text-white aspect-square flex items-center justify-center rounded-xl shadow-md">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-6">
              <ul className="space-y-1">
                <li>
                  <button onClick={() => { onNavigate({ page: 'home' }); setMobileMenuOpen(false); }} className="w-full text-left px-6 py-4 text-slate-700 font-bold hover:bg-slate-50 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Home
                  </button>
                </li>
                <li>
                  <div className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 mt-4 mb-2">Shop Inventory</div>
                  <button onClick={() => { onNavigate({ page: 'categories' }); setMobileMenuOpen(false); }} className="w-full text-left px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-3">
                    <Menu className="w-4 h-4" /> Categories
                  </button>
                  <button onClick={() => { onNavigate({ page: 'products' }); setMobileMenuOpen(false); }} className="w-full text-left px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" /> All Products
                  </button>
                </li>
                <li>
                  <div className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 mt-4 mb-2">Community & Support</div>
                  <button onClick={() => { onNavigate({ page: 'home' }); setMobileMenuOpen(false); }} className="w-full text-left px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-3">
                    <BookOpen className="w-4 h-4" /> Blogs
                  </button>
                  <button onClick={() => setMobileMenuOpen(false)} className="w-full text-left px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-3">
                    <Package className="w-4 h-4" /> Track Order
                  </button>
                  <button onClick={() => setMobileMenuOpen(false)} className="w-full text-left px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-3">
                    <Phone className="w-4 h-4" /> Bulk Enquiry
                  </button>
                </li>
              </ul>
            </nav>

            {/* Footer / User */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                    <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600">Logout</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { onNavigate({ page: 'login' }); setMobileMenuOpen(false); }}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <User className="w-5 h-5" /> Login to Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
