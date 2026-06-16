import React from 'react';
import { AdminView } from './types';
import { User } from '../../types';
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
    BellIcon,
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

const CsvIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const FlashIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

const WalletIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
);

const ReturnIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);

const StaffIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);

export const AdminSidebar: React.FC<{ currentView: AdminView; setView: (view: AdminView) => void; onLogout: () => void; user?: User | null }> = ({ currentView, setView, onLogout, user }) => {
    const isAdmin = user?.isAdmin || user?.role === 'ADMIN';
    const perms = (user?.permissions as Record<string, boolean>) || {};
    const can = (p: string) => isAdmin || perms[p];

    type NavItemDef = { view: AdminView; label: string; icon: React.ReactNode; show: boolean };

    const navItems: NavItemDef[] = [
        { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, show: true },
        { view: 'slides', label: 'Home Slides', icon: <SlidesIcon />, show: can('slides') },
        { view: 'categories', label: 'Categories', icon: <CategoryIcon />, show: can('categories') },
        { view: 'products', label: 'Products', icon: <ProductIcon />, show: can('products') },
        { view: 'orders', label: 'Orders', icon: <OrderIcon />, show: can('orders') },
        { view: 'users', label: 'Users', icon: <UserIcon />, show: can('users') },
        { view: 'coupons', label: 'Coupons', icon: <CouponIcon />, show: can('coupons') },
        { view: 'blogs', label: 'Blogs', icon: <BlogIcon />, show: can('blog') },
        { view: 'videos', label: 'Videos', icon: <VideoIcon />, show: can('blog') },
        { view: 'brands', label: 'Brands', icon: <BrandIcon />, show: can('slides') },
        { view: 'faqs', label: 'FAQs', icon: <FaqIcon />, show: can('blog') },
        { view: 'newsletter', label: 'Newsletter', icon: <NewsletterIcon />, show: can('users') },
        { view: 'stock-notifications', label: 'Stock Alerts', icon: <BellIcon />, show: can('products') },
        { view: 'flash-sales', label: 'Flash Sales', icon: <FlashIcon />, show: can('products') },
        { view: 'csv-import', label: 'CSV Import', icon: <CsvIcon />, show: can('products') },
        { view: 'wallet', label: 'Wallet / Points', icon: <WalletIcon />, show: can('users') },
        { view: 'returns', label: 'Returns', icon: <ReturnIcon />, show: can('orders') },
        { view: 'staff', label: 'Staff & Roles', icon: <StaffIcon />, show: isAdmin },
        { view: 'settings', label: 'Settings', icon: <SettingsIcon />, show: can('settings') },
    ];

    const visible = navItems.filter(i => i.show);

    return (
        <aside className="w-16 md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 h-screen sticky top-0 border-r border-slate-800">
            <div className="flex items-center justify-center md:justify-start gap-3 h-20 px-4 border-b border-white/5 flex-shrink-0">
                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-glow">
                    <span className="text-white font-extrabold text-lg">Q</span>
                </div>
                <div className="hidden md:block leading-tight">
                    <h1 className="text-sm font-bold tracking-tight">Qurion Tech</h1>
                    <p className="text-[11px] text-slate-500">{isAdmin ? 'Admin Panel' : 'Staff Panel'}</p>
                </div>
            </div>
            <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="hidden md:block px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Menu</p>
                {visible.map(item => <NavItem key={item.view} view={item.view} label={item.label} icon={item.icon} currentView={currentView} setView={setView} />)}
            </nav>
            <div className="px-2.5 py-4 mt-auto border-t border-white/5 space-y-1 flex-shrink-0">
                {user && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{user.name || user.email}</p>
                            <p className="text-[10px] text-slate-500">{user.role || (user.isAdmin ? 'ADMIN' : 'STAFF')}</p>
                        </div>
                    </div>
                )}
                <a href="/" target="_blank" rel="noopener noreferrer" title="View Store"
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <span className="flex-shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors"><StoreIcon /></span>
                    <span className="hidden md:inline">View Store</span>
                </a>
                <button onClick={onLogout} title="Logout"
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                    <span className="flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors"><LogoutIcon /></span>
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </aside>
    );
};
