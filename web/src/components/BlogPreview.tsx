import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { fetchBlogs } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const BlogPreview: React.FC<{ type: 'blogs' | 'tutorials' }> = ({ type }) => {
    const isBlog = type === 'blogs';
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const blogType = isBlog ? 'BLOG' : 'TUTORIAL';
        fetchBlogs(4, blogType).then(data => {
            setContent(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isBlog]);

    const fallbackContent = isBlog ? [
        {
            id: 1,
            title: "Getting Started with Arduino in 2024",
            excerpt: "Everything you need to know to start your first electronics project using the world's most popular microcontroller platform.",
            publishedAt: "2024-02-10",
            imageUrl: "",
            category: "Guide",
        },
        {
            id: 2,
            title: "Raspberry Pi vs Arduino: A Comparison",
            excerpt: "Understand the key differences between two of the most popular maker boards.",
            publishedAt: "2024-01-28",
            imageUrl: "",
            category: "Guide",
        },
    ] : [
        {
            id: 1,
            title: "Build a Line-Following Robot",
            excerpt: "Step-by-step guide to building your first autonomous robot using IR sensors.",
            publishedAt: "2024-02-05",
            imageUrl: "",
            category: "Robotics",
        },
        {
            id: 2,
            title: "IoT Weather Station Project",
            excerpt: "Create a connected weather station that reports data to the cloud.",
            publishedAt: "2024-01-15",
            imageUrl: "",
            category: "IoT",
        },
    ];

    const items = content.length > 0 ? content : fallbackContent;

    return (
        <div className="py-16" id={isBlog ? 'blogs-section' : 'tutorials-section'}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${isBlog ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                            {isBlog ? <BookOpen className="w-6 h-6 text-indigo-600" /> : <GraduationCap className="w-6 h-6 text-emerald-600" />}
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{isBlog ? 'Latest Articles' : 'Tutorials'}</h2>
                            <p className="text-sm text-slate-500 mt-1">{isBlog ? 'Insights and news from the maker world' : 'Learn by building real projects'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.hash = `#/blogs?type=${isBlog ? 'BLOG' : 'TUTORIAL'}`}
                        className={`hidden sm:flex items-center gap-1 text-sm font-semibold ${isBlog ? 'text-indigo-600 hover:text-indigo-700' : 'text-emerald-600 hover:text-emerald-700'} transition-colors`}
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-slate-100 flex flex-col items-stretch h-full"
                                onClick={() => window.location.hash = `#/blog/${item.slug || item.id}`}>
                                <div className="relative h-44 overflow-hidden shrink-0">
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
                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-base mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 flex-grow">{item.excerpt}</p>
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

export default BlogPreview;
