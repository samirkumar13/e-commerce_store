import React from 'react';
import { AdminView } from './types';
import {
    DashboardIcon,
    SlidesIcon,
    CategoryIcon,
    ProductIcon,
    OrderIcon,
    UserIcon,
    CouponIcon,
    SettingsIcon,
    LogoutIcon,
    StoreIcon,
    BlogIcon,
    VideoIcon,
    BrandIcon,
    FaqIcon,
    NewsletterIcon,
} from './icons';

const NavItem: React.FC<{ view: AdminView; label: string; icon: React.ReactNode; currentView: AdminView; setView: (view: AdminView) => void; }> = ({ view, label, icon, currentView, setView }) => {
    const isActive = currentView === view;
    return (
        <li>
            <button
                onClick={() => setView(view)}
                title={label}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400'}`}>{icon}</span>
                <span className="hidden md:inline">{label}</span>
            </button>
        </li>
    );
};

export const AdminSidebar: React.FC<{ currentView: AdminView; setView: (view: AdminView) => void; onLogout: () => void; }> = ({ currentView, setView, onLogout }) => {
    const navItems = [
        { view: 'dashboard' as AdminView, label: 'Dashboard', icon: <DashboardIcon /> },
        { view: 'slides' as AdminView, label: 'Home Slides', icon: <SlidesIcon /> },
        { view: 'categories' as AdminView, label: 'Categories', icon: <CategoryIcon /> },
        { view: 'products' as AdminView, label: 'Products', icon: <ProductIcon /> },
        { view: 'orders' as AdminView, label: 'Orders', icon: <OrderIcon /> },
        { view: 'users' as AdminView, label: 'Users', icon: <UserIcon /> },
        { view: 'coupons' as AdminView, label: 'Coupons', icon: <CouponIcon /> },
        { view: 'blogs' as AdminView, label: 'Blogs', icon: <BlogIcon /> },
        { view: 'videos' as AdminView, label: 'Videos', icon: <VideoIcon /> },
        { view: 'brands' as AdminView, label: 'Brands', icon: <BrandIcon /> },
        { view: 'faqs' as AdminView, label: 'FAQs', icon: <FaqIcon /> },
        { view: 'newsletter' as AdminView, label: 'Newsletter', icon: <NewsletterIcon /> },
        { view: 'settings' as AdminView, label: 'Settings', icon: <SettingsIcon /> },
    ];

    return (
        <aside className="w-16 md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 h-screen sticky top-0 border-r border-slate-800">
            <div className="flex items-center justify-center md:justify-start gap-3 h-20 px-4 border-b border-white/5 flex-shrink-0">
                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-glow">
                    <span className="text-white font-extrabold text-lg">Q</span>
                </div>
                <div className="hidden md:block leading-tight">
                    <h1 className="text-sm font-bold tracking-tight">Qurion Tech</h1>
                    <p className="text-[11px] text-slate-500">Admin Panel</p>
                </div>
            </div>
            <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="hidden md:block px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Menu</p>
                {navItems.map(item => <NavItem key={item.view} {...item} currentView={currentView} setView={setView} />)}
            </nav>
            <div className="px-2.5 py-4 mt-auto border-t border-white/5 space-y-1 flex-shrink-0">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Store"
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <span className="flex-shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors"><StoreIcon /></span>
                    <span className="hidden md:inline">View Store</span>
                </a>
                <button
                    onClick={onLogout}
                    title="Logout"
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                    <span className="flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors"><LogoutIcon /></span>
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </aside>
    );
};
