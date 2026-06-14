import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';
import { fetchBlogs } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import Breadcrumbs from './Breadcrumbs';

const BlogListPage: React.FC = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'BLOG' | 'TUTORIAL'>('BLOG');

    // Read initial tab from URL query params
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('type=TUTORIAL')) {
            setActiveTab('TUTORIAL');
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchBlogs(undefined, activeTab).then(data => {
            setBlogs(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [activeTab]);

    const isBlog = activeTab === 'BLOG';

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: isBlog ? 'Blog' : 'Tutorials' }]} />
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => window.location.hash = '#/'}
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Blog & Tutorials</h1>
                    <p className="text-slate-500">Explore our latest articles, guides, and hands-on tutorials.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('BLOG')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'BLOG'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" /> Articles
                    </button>
                    <button
                        onClick={() => setActiveTab('TUTORIAL')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'TUTORIAL'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <GraduationCap className="w-4 h-4" /> Tutorials
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading...</div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className={`w-20 h-20 rounded-3xl ${isBlog ? 'bg-indigo-50' : 'bg-emerald-50'} flex items-center justify-center mx-auto mb-6`}>
                            {isBlog ? <BookOpen className="w-10 h-10 text-indigo-300" /> : <GraduationCap className="w-10 h-10 text-emerald-300" />}
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No {isBlog ? 'articles' : 'tutorials'} yet</h3>
                        <p className="text-sm text-slate-400">Check back soon for new content!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-slate-100 flex flex-col"
                                onClick={() => window.location.hash = `#/blog/${item.slug || item.id}`}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className={`w-full h-full ${isBlog ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'} flex items-center justify-center`}>
                                            {isBlog ? <BookOpen className="w-12 h-12 text-white/50" /> : <GraduationCap className="w-12 h-12 text-white/50" />}
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${isBlog ? 'bg-indigo-600/80 text-white' : 'bg-emerald-600/80 text-white'}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className={`font-bold text-slate-900 ${isBlog ? 'group-hover:text-indigo-600' : 'group-hover:text-emerald-600'} transition-colors line-clamp-2 text-base mb-2`}>{item.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 flex-grow">{item.excerpt}</p>
                                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogListPage;
