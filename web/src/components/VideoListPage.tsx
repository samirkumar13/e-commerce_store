import React, { useState, useEffect } from 'react';
import { Play, MonitorPlay, ArrowLeft, X } from 'lucide-react';
import { fetchVideos } from '../services/api';
import Breadcrumbs from './Breadcrumbs';

const VideoListPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'FULL' | 'SHORT'>('FULL');
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingYoutubeId, setPlayingYoutubeId] = useState<string | null>(null);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('type=shorts')) setActiveTab('SHORT');
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchVideos(activeTab).then(data => {
            setVideos(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [activeTab]);

    const isFull = activeTab === 'FULL';

    return (
        <div className="py-8" style={{ minHeight: 'calc(100vh - 72px)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: isFull ? 'Video Tutorials' : 'Quick Shorts' }]} />

                <div className="mb-8">
                    <button
                        onClick={() => window.location.hash = '#/'}
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Videos</h1>
                    <p className="text-slate-500">Watch tutorials, walkthroughs, and quick tips from our channel.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('FULL')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'FULL'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <MonitorPlay className="w-4 h-4" /> Video Tutorials
                    </button>
                    <button
                        onClick={() => setActiveTab('SHORT')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'SHORT'
                                ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Play className="w-4 h-4" /> Quick Shorts
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading...</div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20">
                        <div className={`w-20 h-20 rounded-3xl ${isFull ? 'bg-red-50' : 'bg-pink-50'} flex items-center justify-center mx-auto mb-6`}>
                            {isFull
                                ? <MonitorPlay className="w-10 h-10 text-red-300" />
                                : <Play className="w-10 h-10 text-pink-300" />}
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No {isFull ? 'tutorials' : 'shorts'} yet</h3>
                        <p className="text-sm text-slate-400">Check back soon for new content!</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${isFull ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
                        {videos.map((video, index) => (
                            <div key={video.id || index} className="group cursor-pointer" onClick={() => setPlayingYoutubeId(video.youtubeId)}>
                                <div className={`relative rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all ${isFull ? 'aspect-video' : 'aspect-[9/16]'}`}>
                                    <img
                                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                            <Play className="w-6 h-6 text-red-600 ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 text-sm">{video.title}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal player */}
            {playingYoutubeId && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPlayingYoutubeId(null)}>
                    <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
                        <iframe
                            src={`https://www.youtube.com/embed/${playingYoutubeId}?autoplay=1&rel=0`}
                            title="Video player"
                            className="w-full h-full rounded-2xl"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        <button
                            onClick={() => setPlayingYoutubeId(null)}
                            className="absolute -top-10 right-0 text-white hover:text-red-400 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoListPage;
