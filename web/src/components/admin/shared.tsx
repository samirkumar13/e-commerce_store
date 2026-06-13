import React from 'react';
import { Product } from '../../types';

const statusStyles: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    INACTIVE: 'bg-slate-100 text-slate-500 ring-slate-500/20',
    DRAFT: 'bg-slate-100 text-slate-500 ring-slate-500/20',
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    PROCESSING: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    SHIPPED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20',
    FAILED: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    const key = (status || '').toUpperCase();
    const cls = statusStyles[key] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset capitalize ${cls}`}>{(status || '—').toLowerCase()}</span>;
};

export const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="group bg-white p-5 rounded-2xl border border-slate-200/70 shadow-soft flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg">
        <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl ${color} ring-1 ring-inset ring-white/40`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        </div>
    </div>
);

export const LowStockWidget: React.FC<{ products: Product[]; onEdit: (p: Product) => void; threshold: number; onThresholdChange: (t: number) => void; }> = ({ products, onEdit, threshold, onThresholdChange }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Low Stock Alerts</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto max-w-sm">
                <label htmlFor="stockThreshold" className="text-sm font-medium text-slate-600 whitespace-nowrap">Threshold: <span className="font-bold text-primary">{threshold}</span></label>
                <input
                    id="stockThreshold"
                    type="range"
                    min="0"
                    max="50"
                    value={threshold}
                    onChange={(e) => onThresholdChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

        {products.length > 0 ? (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
                {products.map(p => (
                    <li key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-50">
                        <div>
                            <p className="font-medium text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.category.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{p.stock} left</span>
                            <button onClick={() => onEdit(p)} className="admin-act admin-act-edit">Manage</button>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-500 text-center py-8">No products are below the selected threshold. Great job!</p>
        )}
    </div>
);

export const Modal: React.FC<{ children: React.ReactNode, title: string, onClose: () => void, size?: 'lg' | 'xl' }> = ({ children, title, onClose, size = 'lg' }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start pt-16 px-4" onClick={onClose}>
        <div className={`bg-white rounded-2xl shadow-soft-lg w-full max-w-${size} animate-modal-in`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
                <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);
