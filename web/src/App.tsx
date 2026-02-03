
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import Hero from './components/Hero';
import Container from './components/UIElements/Container';
import CategoryGrid from './components/CategoryGrid';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import AccountView from './components/AccountView';
import AdminDashboard from './components/AdminDashboard';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryView from './components/CategoryView';
import ProductList from './components/ProductList';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import WishlistView from './components/WishlistView';
import { useCart } from './hooks/useCart';
import { Product, Category } from './types';
import * as apiService from './services/api';

export type Route =
  | { page: 'home' }
  | { page: 'products' }
  | { page: 'product'; slug: string }
  | { page: 'categories' }
  | { page: 'category'; slug: string }
  | { page: 'cart' }
  | { page: 'wishlist' }
  | { page: 'checkout' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'account' }
  | { page: 'admin' }
  | { page: 'payment-status'; transactionId: string };

const PaymentStatusView: React.FC<{ transactionId: string; showNotification: (message: string) => void; }> = ({ transactionId, showNotification }) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    const verify = async () => {
      try {
        await apiService.verifyPhonePePayment(transactionId);
        // Ensure frontend cart state is synced (cleared) after payment
        await refreshCart();
        setStatus('success');
        showNotification('Payment successful! Your order has been placed.');
        setTimeout(() => {
          window.location.hash = '#/account';
        }, 2000);
      } catch (err: any) {
        setStatus('failed');
        setError(err.message || 'Payment verification failed.');
        showNotification(`Payment failed: ${err.message}`);
        // Critical Fix: Sync cart even on failure. 
        // If backend cleared cart but crashed later, we need empty cart state.
        await refreshCart();
      }
    };

    verify();
  }, [transactionId, showNotification, refreshCart]);

  return (
    <div className="text-center py-20">
      {status === 'verifying' && (
        <>
          <h1 className="text-3xl font-bold">Verifying Payment...</h1>
          <p className="mt-2 text-slate-600">Please wait while we confirm your transaction.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
          <p className="mt-2 text-slate-600">Your order has been placed. Redirecting to your account...</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <h1 className="text-3xl font-bold text-red-600">Payment Failed</h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <a href="#/cart" className="mt-4 inline-block text-primary hover:underline">Return to Cart</a>
        </>
      )}
    </div>
  );
};


const AppContent: React.FC = () => {
  const [route, setRoute] = useState<Route>({ page: 'home' });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Load settings from cache immediately if available
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem('storeSettings');
    return cached ? JSON.parse(cached) : {};
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // Notification disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Don't set loading=true for everything, to avoid hiding the cached UI
        // We only block interaction if critical data is missing?
        // Actually, we can keep loading=true but the UI renders "Loading components..." which hides the header.
        // We should move loading state inside the components or remove full page loader if we want instant header.

        // Strategy: Fetch in background, update state.
        // But for first load, we might want to show loading spinner for products?

        const [productsData, categoriesData, settingsData] = await Promise.all([
          apiService.fetchProducts(),
          apiService.fetchCategories(),
          apiService.fetchSettings()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setSettings(settingsData);
        // Cache the settings for next reload
        localStorage.setItem('storeSettings', JSON.stringify(settingsData));
      } catch (err: any) {
        setError("Could not fetch initial data. Is the backend server running?");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Effect for handling SEO meta tags and Favicon
  useEffect(() => {
    const updateMetaTags = (title: string, description: string) => {
      document.title = title;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    };

    // Set Favicon if available
    if (settings.storeFavicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.storeFavicon;
    }

    const storeName = settings.storeName || 'Qurion Tech';
    const defaultDescription = settings.storeDescription || "Your source for electronic components.";

    switch (route.page) {
      case 'product':
        const product = products.find(p => p.slug === route.slug);
        updateMetaTags(
          product?.metaTitle || `${product?.name || 'Product'} | ${storeName}`,
          product?.metaDescription || product?.description || defaultDescription
        );
        break;
      case 'category':
        const category = categories.find(c => c.slug === route.slug);
        updateMetaTags(
          category?.metaTitle || `${category?.name || 'Category'} | ${storeName}`,
          category?.metaDescription || `Browse products in the ${category?.name} category on ${storeName}.`
        );
        break;
      case 'products':
        updateMetaTags(`All Products | ${storeName}`, `Browse our complete catalog of electronic components on ${storeName}.`);
        break;
      default:
        updateMetaTags(storeName, defaultDescription);
        break;
    }
  }, [route, products, categories, settings]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(2); // Remove '#/'
      const [page, idOrSlug] = hash.split('/');

      switch (page) {
        case 'product':
          if (idOrSlug) setRoute({ page: 'product', slug: idOrSlug });
          break;
        case 'category':
          if (idOrSlug) setRoute({ page: 'category', slug: idOrSlug });
          break;
        case 'categories':
          setRoute({ page: 'categories' });
          break;
        case 'products':
          setRoute({ page: 'products' });
          break;
        case 'cart':
          setRoute({ page: 'cart' });
          break;
        case 'wishlist':
          setRoute({ page: 'wishlist' });
          break;
        case 'checkout':
          setRoute({ page: 'checkout' });
          break;
        case 'login':
          setRoute({ page: 'login' });
          break;
        case 'register':
          setRoute({ page: 'register' });
          break;
        case 'account':
          if (isAuthenticated) setRoute({ page: 'account' });
          break;
        case 'admin':
          if (isAuthenticated && user?.isAdmin) {
            setRoute({ page: 'admin' });
          } else if (isAuthenticated) {
            // Redirect non-admin users home
            window.location.hash = '#/';
          }
          break;
        case 'payment-status':
          if (idOrSlug) setRoute({ page: 'payment-status', transactionId: idOrSlug });
          break;
        default:
          setRoute({ page: 'home' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, user]);

  const handleSetRoute = (newRoute: Route) => {
    let newHash = `#/${newRoute.page}`;
    if ('slug' in newRoute) newHash += `/${newRoute.slug}`;
    if ('transactionId' in newRoute) newHash += `/${newRoute.transactionId}`;

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    } else {
      setRoute(newRoute);
    }
  };

  const selectedProduct = route.page === 'product' && route.slug
    ? products.find(p => p.slug === route.slug)
    : undefined;

  // If user is admin and on admin page, render the standalone dashboard
  if (route.page === 'admin' && user?.isAdmin) {
    return <AdminDashboard settings={settings} />;
  }

  const renderContent = () => {
    switch (route.page) {
      case 'home':
        return (
          <>
            <Hero />
            <CategoryGrid categories={categories} limit={8} />
            <FeaturedProducts
              products={products.slice(0, 12)}
              onProductSelect={(slug: string) => handleSetRoute({ page: 'product', slug })}
              showNotification={showNotification}
            />
          </>
        );
      case 'categories':
        return <CategoryGrid categories={categories} />;
      case 'products':
        return <ProductList
          products={products}
          categories={categories}
          onProductSelect={(slug: string) => handleSetRoute({ page: 'product', slug })}
          showNotification={showNotification}
        />;
      case 'product':
        return selectedProduct ? <ProductDetail product={selectedProduct} showNotification={showNotification} /> : <div className="text-center py-10 text-xl">Product not found.</div>;
      case 'category':
        const category = categories.find(c => c.slug === route.slug);
        const categoryProducts = products.filter(p => p.category.slug === route.slug);
        return <CategoryView
          category={category}
          products={categoryProducts}
          onProductSelect={(slug: string) => handleSetRoute({ page: 'product', slug })}
          showNotification={showNotification}
        />;
      case 'cart':
        return <CartView />;
      case 'wishlist':
        return <WishlistView onNavigate={setRoute} showNotification={showNotification} />;
      case 'checkout':
        return <CheckoutView onLoginRedirect={() => handleSetRoute({ page: 'login' })} showNotification={showNotification} />;
      case 'login':
        return <LoginView onLoginSuccess={() => window.location.hash = '#/'} />;
      case 'register':
        return <RegisterView onRegisterSuccess={() => window.location.hash = '#/'} />;
      case 'account':
        return <AccountView />;
      case 'payment-status':
        return <PaymentStatusView transactionId={route.transactionId} showNotification={showNotification} />;
      default:
        return <div>Page not found.</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header onNavigate={handleSetRoute} allProducts={products} storeName={settings.storeName || 'Qurion Tech'} settings={settings} />
      <main className="flex-grow">
        <Container>
          {loading && <div className="text-center py-20 text-lg font-medium text-slate-600">Loading components...</div>}
          {error && <div className="text-center py-20 text-red-600 bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">{error}</div>}
          {!loading && !error && renderContent()}
        </Container>
      </main>
      <Footer settings={settings} />
      {notification && (
        <div className="fixed bottom-5 right-5 bg-slate-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-up z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
