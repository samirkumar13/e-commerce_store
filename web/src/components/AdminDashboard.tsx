import React, { useState, useEffect, useCallback } from 'react';
import { Product, AdminUser, Category, HomeSlide, Order, Coupon, Setting } from '../types';
import { useAuth } from '../context/AuthContext';
import * as adminApi from '../services/adminApi';
import { AdminView, Period, Toast } from './admin/types';
import { Modal } from './admin/shared';
import { AdminSidebar } from './admin/Sidebar';
import {
    DashboardView,
    SlidesView,
    CategoriesView,
    ProductsView,
    OrdersView,
    UsersView,
    CouponsView,
    SettingsView,
    BlogsView,
    VideosView,
    BrandsView,
    FaqsView,
    NewsletterView,
} from './admin/views';
import {
    ProductForm,
    CategoryForm,
    SlideForm,
    OrderForm,
    UserForm,
    CouponForm,
    InvoiceView,
    BlogForm,
    VideoForm,
    BrandForm,
    FaqForm,
} from './admin/forms';

// --- MAIN ADMIN DASHBOARD COMPONENT ---
const AdminDashboard: React.FC<{ settings: Record<string, string> }> = ({ settings: appSettings }) => {
    const [view, setView] = useState<AdminView>('dashboard');
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, categories: 0 });
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [slides, setSlides] = useState<HomeSlide[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [statsPeriod, setStatsPeriod] = useState<Period>('all');
    const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HomeSlide | undefined>(undefined);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | undefined>(undefined);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<Order | undefined>(undefined);
    const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any | undefined>(undefined);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<any | undefined>(undefined);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any | undefined>(undefined);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any | undefined>(undefined);

    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: 'success' | 'error') => {
        const newToast: Toast = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 3000);
    };

    const fetchLowStockData = useCallback(async (threshold: number) => {
        try {
            const lowStockData = await adminApi.getLowStockProducts(threshold);
            setLowStockProducts(lowStockData);
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    }, []);

    useEffect(() => {
        // Debounce fetching to avoid spamming API on slider change
        const handler = setTimeout(() => {
            if (view === 'dashboard') {
                fetchLowStockData(lowStockThreshold);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [lowStockThreshold, view, fetchLowStockData]);

    const loadDataForView = useCallback(async (currentView: AdminView, period: Period, threshold: number) => {
        setLoading(true);
        setError(null);
        try {
            switch (currentView) {
                case 'dashboard':
                    const [statsData, lowStockData] = await Promise.all([
                        adminApi.getStats(period),
                        adminApi.getLowStockProducts(threshold)
                    ]);
                    setStats(statsData);
                    setLowStockProducts(lowStockData);
                    break;
                case 'users': setUsers(await adminApi.getUsers()); break;
                case 'products':
                    const [p, c] = await Promise.all([adminApi.getProducts(), adminApi.getCategories()]);
                    setProducts(p); setCategories(c); break;
                case 'categories': setCategories(await adminApi.getCategories()); break;
                case 'slides': setSlides(await adminApi.getSlides()); break;
                case 'orders': setOrders(await adminApi.getOrders()); break;
                case 'coupons': setCoupons(await adminApi.getCoupons()); break;
                case 'settings': setSettings(await adminApi.getSettings()); break;
                case 'blogs': setBlogs(await adminApi.getBlogs()); break;
                case 'videos': setVideos(await adminApi.getVideos()); break;
                case 'brands': setBrands(await adminApi.getBrands()); break;
                case 'faqs': setFaqs(await adminApi.getFaqs()); break;
                case 'newsletter': setNewsletterSubscribers(await adminApi.getNewsletterSubscribers()); break;
            }
        } catch (err: any) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDataForView(view, statsPeriod, lowStockThreshold);
    }, [view, statsPeriod, loadDataForView, lowStockThreshold]);

    // --- CRUD Handlers ---
    const createDeleteHandler = (noun: string, deleteFn: (id: string) => Promise<any>, refreshView: AdminView) => async (id: string) => {
        if (window.confirm(`Are you sure you want to delete this ${noun}? This action cannot be undone.`)) {
            try {
                await deleteFn(id);
                showToast(`${noun} deleted successfully.`, 'success');
                await loadDataForView(refreshView, statsPeriod, lowStockThreshold);
            } catch (err: any) { showToast(err.message, 'error'); }
        }
    };

    const handleDeleteUser = createDeleteHandler('user', adminApi.deleteUser, 'users');
    const handleDeleteProduct = createDeleteHandler('product', adminApi.deleteProduct, 'products');
    const handleDeleteCategory = createDeleteHandler('category', adminApi.deleteCategory, 'categories');
    const handleDeleteSlide = createDeleteHandler('slide', adminApi.deleteSlide, 'slides');
    const handleDeleteCoupon = createDeleteHandler('coupon', adminApi.deleteCoupon, 'coupons');
    const handleDeleteBlog = createDeleteHandler('blog post', adminApi.deleteBlog, 'blogs');
    const handleDeleteVideo = createDeleteHandler('video', adminApi.deleteVideo, 'videos');
    const handleDeleteBrand = createDeleteHandler('brand', adminApi.deleteBrand, 'brands');
    const handleDeleteFaq = createDeleteHandler('FAQ', adminApi.deleteFaq, 'faqs');
    const handleDeleteSubscriber = createDeleteHandler('subscriber', adminApi.deleteNewsletterSubscriber, 'newsletter');

    const handleSaveProduct = async (data: any) => {
        try {
            const action = editingProduct ? 'updated' : 'created';
            if (editingProduct) await adminApi.updateProduct(editingProduct.id, data);
            else await adminApi.createProduct(data);
            await loadDataForView('products', statsPeriod, lowStockThreshold);
            showToast(`Product ${action} successfully.`, 'success');
            setIsProductModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveCategory = async (data: any) => {
        try {
            const action = editingCategory ? 'updated' : 'created';
            if (editingCategory) await adminApi.updateCategory(editingCategory.id, data);
            else await adminApi.createCategory(data);
            await loadDataForView('categories', statsPeriod, lowStockThreshold);
            showToast(`Category ${action} successfully.`, 'success');
            setIsCategoryModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveSlide = async (data: any) => {
        try {
            const action = editingSlide ? 'updated' : 'created';
            if (editingSlide) await adminApi.updateSlide(editingSlide.id, data);
            else await adminApi.createSlide(data);
            await loadDataForView('slides', statsPeriod, lowStockThreshold);
            showToast(`Slide ${action} successfully.`, 'success');
            setIsSlideModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveOrder = async (data: any) => {
        if (!editingOrder) return;
        try {
            await adminApi.updateOrder(editingOrder.id, data);
            await loadDataForView('orders', statsPeriod, lowStockThreshold);
            showToast(`Order updated successfully.`, 'success');
            setIsOrderModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveUser = async (data: any) => {
        if (!editingUser) return;
        try {
            await adminApi.updateUser(editingUser.id, data);
            await loadDataForView('users', statsPeriod, lowStockThreshold);
            showToast(`User updated successfully.`, 'success');
            setIsUserModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveCoupon = async (data: any) => {
        try {
            const action = editingCoupon ? 'updated' : 'created';
            if (editingCoupon) await adminApi.updateCoupon(editingCoupon.id, data);
            else await adminApi.createCoupon(data);
            await loadDataForView('coupons', statsPeriod, lowStockThreshold);
            showToast(`Coupon ${action} successfully.`, 'success');
            setIsCouponModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveSettings = async (data: Setting[]) => {
        try {
            await adminApi.updateSettings(data);
            await loadDataForView('settings', statsPeriod, lowStockThreshold);
            showToast(`Settings updated successfully.`, 'success');
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveBlog = async (data: any) => {
        try {
            const action = editingBlog ? 'updated' : 'created';
            if (editingBlog) await adminApi.updateBlog(editingBlog.id, data);
            else await adminApi.createBlog(data);
            await loadDataForView('blogs', statsPeriod, lowStockThreshold);
            showToast(`Blog post ${action} successfully.`, 'success');
            setIsBlogModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveVideo = async (data: any) => {
        try {
            const action = editingVideo ? 'updated' : 'created';
            if (editingVideo) await adminApi.updateVideo(editingVideo.id, data);
            else await adminApi.createVideo(data);
            await loadDataForView('videos', statsPeriod, lowStockThreshold);
            showToast(`Video ${action} successfully.`, 'success');
            setIsVideoModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }
    const handleSaveBrand = async (data: any) => {
        try {
            const action = editingBrand ? 'updated' : 'created';
            if (editingBrand) await adminApi.updateBrand(editingBrand.id, data);
            else await adminApi.createBrand(data);
            await loadDataForView('brands', statsPeriod, lowStockThreshold);
            showToast(`Brand ${action} successfully.`, 'success');
            setIsBrandModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }

    const handleSaveFaq = async (data: any) => {
        try {
            const action = editingFaq ? 'updated' : 'created';
            if (editingFaq) await adminApi.updateFaq(editingFaq.id, data);
            else await adminApi.createFaq(data);
            await loadDataForView('faqs', statsPeriod, lowStockThreshold);
            showToast(`FAQ ${action} successfully.`, 'success');
            setIsFaqModalOpen(false);
        } catch (err: any) { showToast(err.message, 'error'); }
    }

    const openProductModal = (product?: Product) => { setEditingProduct(product); setIsProductModalOpen(true); }
    const openCategoryModal = (cat?: Category) => { setEditingCategory(cat); setIsCategoryModalOpen(true); }
    const openSlideModal = (slide?: HomeSlide) => { setEditingSlide(slide); setIsSlideModalOpen(true); }
    const openOrderModal = (order?: Order) => { setEditingOrder(order); setIsOrderModalOpen(true); }
    const openUserModal = (user?: AdminUser) => { setEditingUser(user); setIsUserModalOpen(true); }
    const openCouponModal = (coupon?: Coupon) => { setEditingCoupon(coupon); setIsCouponModalOpen(true); }
    const openInvoiceModal = (order: Order) => { setViewingOrder(order); setIsInvoiceModalOpen(true); }
    const openBlogModal = (blog?: any) => { setEditingBlog(blog); setIsBlogModalOpen(true); }
    const openVideoModal = (video?: any) => { setEditingVideo(video); setIsVideoModalOpen(true); }
    const openBrandModal = (brand?: any) => { setEditingBrand(brand); setIsBrandModalOpen(true); }
    const openFaqModal = (faq?: any) => { setEditingFaq(faq); setIsFaqModalOpen(true); }

    const handlePrintInvoice = () => {
        const printContents = document.getElementById('invoice-content')?.innerHTML;
        const originalContents = document.body.innerHTML;
        if (printContents) {
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to re-mount React app
        }
    };

    const renderView = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="h-9 w-9 rounded-full border-2 border-slate-200 border-t-primary animate-spin"></div>
                <p className="mt-4 text-sm font-medium">Loading…</p>
            </div>
        );
        if (error && view !== 'dashboard') return (
            <div className="max-w-lg mx-auto text-center bg-red-50 border border-red-200 text-red-600 rounded-2xl p-8 text-sm font-medium">{error}</div>
        );

        switch (view) {
            case 'dashboard': return <DashboardView stats={stats} lowStockProducts={lowStockProducts} period={statsPeriod} setPeriod={setStatsPeriod} onEditProduct={openProductModal} lowStockThreshold={lowStockThreshold} onThresholdChange={setLowStockThreshold} />;
            case 'slides': return <SlidesView slides={slides} onAdd={() => openSlideModal()} onEdit={openSlideModal} onDelete={handleDeleteSlide} />;
            case 'categories': return <CategoriesView categories={categories} onAdd={() => openCategoryModal()} onEdit={openCategoryModal} onDelete={handleDeleteCategory} />;
            case 'products': return <ProductsView products={products} categories={categories} onDelete={handleDeleteProduct} onAdd={() => openProductModal()} onEdit={openProductModal} />;
            case 'orders': return <OrdersView orders={orders} onEdit={openOrderModal} onViewInvoice={openInvoiceModal} />;
            case 'users': return <UsersView users={users} onEdit={openUserModal} onDelete={handleDeleteUser} />;
            case 'coupons': return <CouponsView coupons={coupons} onAdd={() => openCouponModal()} onEdit={openCouponModal} onDelete={handleDeleteCoupon} />;
            case 'settings': return <SettingsView settings={settings} onSave={handleSaveSettings} />;
            case 'blogs': return <BlogsView blogs={blogs} onAdd={() => openBlogModal()} onEdit={openBlogModal} onDelete={handleDeleteBlog} />;
            case 'videos': return <VideosView videos={videos} onAdd={() => openVideoModal()} onEdit={openVideoModal} onDelete={handleDeleteVideo} />;
            case 'brands': return <BrandsView brands={brands} onAdd={() => openBrandModal()} onEdit={openBrandModal} onDelete={handleDeleteBrand} />;
            case 'faqs': return <FaqsView faqs={faqs} onAdd={() => openFaqModal()} onEdit={openFaqModal} onDelete={handleDeleteFaq} />;
            case 'newsletter': return <NewsletterView subscribers={newsletterSubscribers} onDelete={handleDeleteSubscriber} />;
            default: return <DashboardView stats={stats} lowStockProducts={lowStockProducts} period={statsPeriod} setPeriod={setStatsPeriod} onEditProduct={openProductModal} lowStockThreshold={lowStockThreshold} onThresholdChange={setLowStockThreshold} />;
        }
    };

    const viewLabels: Record<AdminView, string> = {
        dashboard: 'Dashboard', slides: 'Home Slides', categories: 'Categories', products: 'Products',
        orders: 'Orders', users: 'Users', coupons: 'Coupons', settings: 'Settings',
        blogs: 'Blogs', videos: 'Videos', brands: 'Brands', faqs: 'FAQs', newsletter: 'Newsletter',
    };
    const initials = (user?.name || 'Admin').trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <AdminSidebar currentView={view} setView={setView} onLogout={logout} />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
                    <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate">{viewLabels[view]}</h1>
                            <p className="text-xs text-slate-400 hidden sm:block">Welcome back, {user?.name || 'Admin'} 👋</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-500">
                                {new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            <div className="flex items-center gap-2.5 pl-3 sm:border-l border-slate-200">
                                <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm shadow-soft">{initials}</div>
                                <div className="hidden sm:block leading-tight">
                                    <p className="text-sm font-semibold text-slate-700 truncate max-w-[10rem]">{user?.name || 'Admin'}</p>
                                    <p className="text-[11px] text-slate-400">Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] space-y-3">
                {toasts.map(toast => (
                    <div key={toast.id} className={`flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-xl bg-white shadow-soft-lg border animate-toast-in ${toast.type === 'success' ? 'border-emerald-200' : 'border-red-200'}`} role="alert">
                        <span className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {toast.type === 'success'
                                ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                        </span>
                        <div className="text-sm font-medium text-slate-700">{toast.message}</div>
                    </div>
                ))}
            </div>

            {isProductModalOpen && <Modal title={editingProduct ? 'Edit Product' : 'Add Product'} onClose={() => setIsProductModalOpen(false)}>
                <ProductForm product={editingProduct} categories={categories} onSave={handleSaveProduct} onCancel={() => setIsProductModalOpen(false)} />
            </Modal>}
            {isCategoryModalOpen && <Modal title={editingCategory ? 'Edit Category' : 'Add Category'} onClose={() => setIsCategoryModalOpen(false)}>
                <CategoryForm category={editingCategory} onSave={handleSaveCategory} onCancel={() => setIsCategoryModalOpen(false)} />
            </Modal>}
            {isSlideModalOpen && <Modal title={editingSlide ? 'Edit Slide' : 'Add Slide'} onClose={() => setIsSlideModalOpen(false)}>
                <SlideForm slide={editingSlide} onSave={handleSaveSlide} onCancel={() => setIsSlideModalOpen(false)} />
            </Modal>}
            {isOrderModalOpen && editingOrder && <Modal title={`Manage Order #${editingOrder.id.substring(0, 8)}`} onClose={() => setIsOrderModalOpen(false)}>
                <OrderForm order={editingOrder} onSave={handleSaveOrder} onCancel={() => setIsOrderModalOpen(false)} />
            </Modal>}
            {isUserModalOpen && editingUser && <Modal title={`Edit User: ${editingUser.name}`} onClose={() => setIsUserModalOpen(false)}>
                <UserForm user={editingUser} onSave={handleSaveUser} onCancel={() => setIsUserModalOpen(false)} />
            </Modal>}
            {isCouponModalOpen && <Modal title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'} onClose={() => setIsCouponModalOpen(false)}>
                <CouponForm coupon={editingCoupon} onSave={handleSaveCoupon} onCancel={() => setIsCouponModalOpen(false)} />
            </Modal>}
            {isInvoiceModalOpen && viewingOrder && <Modal title={`Invoice for Order #${viewingOrder.id.substring(0, 8)}`} onClose={() => setIsInvoiceModalOpen(false)} size="xl">
                <InvoiceView order={viewingOrder} settings={appSettings} onPrint={handlePrintInvoice} />
            </Modal>}
            {isBlogModalOpen && <Modal title={editingBlog ? 'Edit Blog Post' : 'Add Blog Post'} onClose={() => setIsBlogModalOpen(false)}>
                <BlogForm blog={editingBlog} onSave={handleSaveBlog} onCancel={() => setIsBlogModalOpen(false)} />
            </Modal>}
            {isVideoModalOpen && <Modal title={editingVideo ? 'Edit Video' : 'Add Video'} onClose={() => setIsVideoModalOpen(false)}>
                <VideoForm video={editingVideo} onSave={handleSaveVideo} onCancel={() => setIsVideoModalOpen(false)} />
            </Modal>}
            {isBrandModalOpen && <Modal title={editingBrand ? 'Edit Brand' : 'Add Brand'} onClose={() => setIsBrandModalOpen(false)}>
                <BrandForm brand={editingBrand} onSave={handleSaveBrand} onCancel={() => setIsBrandModalOpen(false)} />
            </Modal>}
            {isFaqModalOpen && <Modal title={editingFaq ? 'Edit FAQ' : 'Add FAQ'} onClose={() => setIsFaqModalOpen(false)}>
                <FaqForm faq={editingFaq} onSave={handleSaveFaq} onCancel={() => setIsFaqModalOpen(false)} />
            </Modal>}
        </div>
    );
};

export default AdminDashboard;
