import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HashRouter,
  Routes,
  Route as RRoute,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import Header from './components/Header';
import TrustFeatures from './components/TrustFeatures';
import VideoGallery from './components/VideoGallery';
import FeaturedBrands from './components/FeaturedBrands';
import BlogPreview from './components/BlogPreview';
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
import BlogListPage from './components/BlogListPage';
import FaqPage from './components/FaqPage';
import BrandsListPage from './components/BrandsListPage';
import NewsletterSection from './components/NewsletterSection';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import WishlistView from './components/WishlistView';
import SharedWishlistPage from './components/SharedWishlistPage';
import { useCart } from './hooks/useCart';
import { Product, Category } from './types';
import * as apiService from './services/api';

// Kept for backwards compatibility: child components (e.g. Header) navigate by
// passing a Route object to an `onNavigate` callback. App maps it to a URL.
export type Route =
  | { page: 'home' }
  | { page: 'products' }
  | { page: 'product'; slug: string }
  | { page: 'categories' }
  | { page: 'category'; slug: string }
  | { page: 'blogs' }
  | { page: 'brands' }
  | { page: 'cart' }
  | { page: 'wishlist' }
  | { page: 'checkout' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'account' }
  | { page: 'admin' }
  | { page: 'payment-status'; transactionId: string };

// Convert a Route object into a router path.
export const routeToPath = (route: Route): string => {
  if (route.page === 'home') return '/';
  let path = `/${route.page}`;
  if ('slug' in route) path += `/${route.slug}`;
  if ('transactionId' in route) path += `/${route.transactionId}`;
  return path;
};

const PaymentStatusView: React.FC<{
  transactionId: string;
  showNotification: (message: string) => void;
}> = ({ transactionId, showNotification }) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const navigate = useNavigate();
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
          navigate('/account');
        }, 2000);
      } catch (err: any) {
        setStatus('failed');
        setError(err.message || 'Payment verification failed.');
        showNotification(`Payment failed: ${err.message}`);
        // Critical Fix: Sync cart even on failure.
        await refreshCart();
      }
    };

    verify();
  }, [transactionId, showNotification, refreshCart, navigate]);

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
          <p className="mt-2 text-slate-600">
            Your order has been placed. Redirecting to your account...
          </p>
        </>
      )}
      {status === 'failed' && (
        <>
          <h1 className="text-3xl font-bold text-red-600">Payment Failed</h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <a href="#/cart" className="mt-4 inline-block text-primary hover:underline">
            Return to Cart
          </a>
        </>
      )}
    </div>
  );
};

// --- Route guards ---
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return children;
};

// --- Param-based route wrappers ---
const ProductRoute: React.FC<{
  products: Product[];
  showNotification: (message: string) => void;
}> = ({ products, showNotification }) => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  return product ? (
    <ProductDetail product={product} showNotification={showNotification} />
  ) : (
    <div className="text-center py-10 text-xl">Product not found.</div>
  );
};

const CategoryRoute: React.FC<{
  categories: Category[];
  products: Product[];
  onProductSelect: (slug: string) => void;
  showNotification: (message: string) => void;
}> = ({ categories, products, onProductSelect, showNotification }) => {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === slug);
  const categoryProducts = products.filter((p) => p.category.slug === slug);
  return (
    <CategoryView
      category={category}
      products={categoryProducts}
      onProductSelect={onProductSelect}
      showNotification={showNotification}
    />
  );
};

const PaymentStatusRoute: React.FC<{ showNotification: (message: string) => void }> = ({
  showNotification,
}) => {
  const { transactionId } = useParams<{ transactionId: string }>();
  return <PaymentStatusView transactionId={transactionId || ''} showNotification={showNotification} />;
};

// --- Storefront shell (header + footer + notification) wrapping routed pages ---
const StorefrontLayout: React.FC<{
  onNavigate: (route: Route) => void;
  products: Product[];
  categories: Category[];
  settings: Record<string, string>;
  loading: boolean;
  error: string | null;
  notification: string | null;
}> = ({ onNavigate, products, categories, settings, loading, error, notification }) => (
  <div className="flex flex-col min-h-screen bg-slate-50">
    <Header
      onNavigate={onNavigate}
      allProducts={products}
      categories={categories}
      storeName={settings.storeName || 'Qurion Tech'}
      settings={settings}
    />
    <main className="flex-grow">
      <Container>
        {loading && (
          <div className="text-center py-20 text-lg font-medium text-slate-600">
            Loading components...
          </div>
        )}
        {error && (
          <div className="text-center py-4 px-6 mb-8 text-amber-700 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center gap-2">
            <span>⚠️ {error} - Showing static version</span>
          </div>
        )}
        {!loading && <Outlet />}
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

const AppContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Load settings from cache immediately if available
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem('storeSettings');
    return cached ? JSON.parse(cached) : {};
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSetRoute = useCallback(
    (route: Route) => {
      navigate(routeToPath(route));
    },
    [navigate]
  );

  const onProductSelect = useCallback(
    (slug: string) => navigate(routeToPath({ page: 'product', slug })),
    [navigate]
  );

  const showNotification = useCallback((message: string) => {
    setNotification(message);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsResponse, categoriesData, settingsData] = await Promise.all([
          apiService.fetchProducts({ limit: 100 }),
          apiService.fetchCategories(),
          apiService.fetchSettings(),
        ]);
        setProducts(productsResponse.products || []);
        setCategories(categoriesData);
        setSettings(settingsData);
        localStorage.setItem('storeSettings', JSON.stringify(settingsData));
      } catch (err: any) {
        setError('Could not fetch initial data. Is the backend server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // SEO meta tags + OG tags + favicon, derived from the current URL.
  useEffect(() => {
    const setMeta = (nameOrProp: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const updateMeta = (title: string, description: string, image?: string) => {
      document.title = title;
      setMeta('description', description);
      setMeta('og:title', title, 'property');
      setMeta('og:description', description, 'property');
      setMeta('og:url', window.location.href, 'property');
      setMeta('og:site_name', storeName, 'property');
      if (image) setMeta('og:image', image, 'property');
      setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
      setMeta('twitter:title', title);
      setMeta('twitter:description', description);
    };

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
    const defaultDescription = settings.storeDescription || 'Your source for electronic components.';
    const [page, slug] = location.pathname.split('/').filter(Boolean);

    switch (page) {
      case 'product': {
        const product = products.find((p) => p.slug === slug);
        updateMeta(
          product?.metaTitle || `${product?.name || 'Product'} | ${storeName}`,
          product?.metaDescription || product?.description?.slice(0, 160) || defaultDescription,
          product?.imageUrl
        );
        break;
      }
      case 'category': {
        const category = categories.find((c) => c.slug === slug);
        updateMeta(
          category?.metaTitle || `${category?.name || 'Category'} | ${storeName}`,
          category?.metaDescription || `Browse products in the ${category?.name} category on ${storeName}.`
        );
        break;
      }
      case 'products':
        updateMeta(`All Products | ${storeName}`, `Browse our complete catalog of electronic components on ${storeName}.`);
        break;
      case 'blogs':
        updateMeta(`Blog & Tutorials | ${storeName}`, `Read the latest articles and tutorials from ${storeName}.`);
        break;
      case 'brands':
        updateMeta(`Brands | ${storeName}`, `Explore all brands available at ${storeName}.`);
        break;
      case 'faq':
        updateMeta(`FAQ | ${storeName}`, `Frequently asked questions about ${storeName}.`);
        break;
      case 'cart':
        updateMeta(`Your Cart | ${storeName}`, 'Review your selected items and proceed to checkout.');
        break;
      case 'account':
        updateMeta(`My Account | ${storeName}`, 'Manage your orders, addresses and profile.');
        break;
      default:
        updateMeta(storeName, defaultDescription, settings.storeLogo);
        break;
    }
  }, [location.pathname, products, categories, settings]);

  return (
    <Routes>
      <RRoute
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminDashboard settings={settings} />
          </RequireAdmin>
        }
      />
      <RRoute
        element={
          <StorefrontLayout
            onNavigate={handleSetRoute}
            products={products}
            categories={categories}
            settings={settings}
            loading={loading}
            error={error}
            notification={notification}
          />
        }
      >
        <RRoute
          index
          element={
            <>
              <Hero />
              <CategoryGrid categories={categories} limit={8} />
              <FeaturedProducts
                products={products.slice(0, 12)}
                onProductSelect={onProductSelect}
                showNotification={showNotification}
              />
              <TrustFeatures />
              {settings.videosEnabled !== 'false' && (
                <>
                  <VideoGallery type="full" youtubeChannelUrl={settings.youtubeChannel} />
                  <VideoGallery type="shorts" youtubeChannelUrl={settings.youtubeChannel} />
                </>
              )}
              {settings.blogsEnabled !== 'false' && (
                <>
                  <BlogPreview type="blogs" />
                  <BlogPreview type="tutorials" />
                </>
              )}
              <NewsletterSection />
              <FeaturedBrands />
            </>
          }
        />
        <RRoute path="categories" element={<CategoryGrid categories={categories} />} />
        <RRoute
          path="products"
          element={
            <ProductList
              categories={categories}
              onProductSelect={onProductSelect}
              showNotification={showNotification}
            />
          }
        />
        <RRoute
          path="product/:slug"
          element={<ProductRoute products={products} showNotification={showNotification} />}
        />
        <RRoute
          path="category/:slug"
          element={
            <CategoryRoute
              categories={categories}
              products={products}
              onProductSelect={onProductSelect}
              showNotification={showNotification}
            />
          }
        />
        <RRoute path="blogs" element={<BlogListPage />} />
        <RRoute path="faq" element={<FaqPage />} />
        <RRoute path="brands" element={<BrandsListPage />} />
        <RRoute path="cart" element={<CartView />} />
        <RRoute
          path="wishlist"
          element={<WishlistView onNavigate={handleSetRoute} showNotification={showNotification} />}
        />
        <RRoute
          path="wishlist/shared"
          element={<SharedWishlistPage onNavigate={handleSetRoute} showNotification={showNotification} />}
        />
        <RRoute
          path="checkout"
          element={<CheckoutView onLoginRedirect={() => navigate('/login')} showNotification={showNotification} />}
        />
        <RRoute path="login" element={<LoginView onLoginSuccess={() => navigate('/')} />} />
        <RRoute path="register" element={<RegisterView onRegisterSuccess={() => navigate('/')} />} />
        <RRoute
          path="account"
          element={
            <RequireAuth>
              <AccountView />
            </RequireAuth>
          }
        />
        <RRoute
          path="payment-status/:transactionId"
          element={<PaymentStatusRoute showNotification={showNotification} />}
        />
        <RRoute path="*" element={<Navigate to="/" replace />} />
      </RRoute>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
