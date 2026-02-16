import React, { useState, useEffect } from 'react';
import { Play, MonitorPlay, ArrowRight, X } from 'lucide-react';
import { fetchVideos } from '../services/api';

interface VideoGalleryProps {
    type: 'full' | 'shorts';
    youtubeChannelUrl?: string;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ type, youtubeChannelUrl }) => {
    const isFull = type === 'full';
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [playingYoutubeId, setPlayingYoutubeId] = useState<string | null>(null);

    useEffect(() => {
        fetchVideos(isFull ? 'FULL' : 'SHORT').then(data => {
            setVideos(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isFull]);

    const fallbackVideos = [
        { id: '1', youtubeId: 'dQw4w9WgXcQ', title: 'Introduction to Robotics' },
        { id: '2', youtubeId: 'dQw4w9WgXcQ', title: 'Getting Started with Sensors' },
        { id: '3', youtubeId: 'dQw4w9WgXcQ', title: 'Advanced Motor Control' },
        { id: '4', youtubeId: 'dQw4w9WgXcQ', title: 'Wireless Communication Guide' },
    ];

    const items = videos.length > 0 ? videos : fallbackVideos;

    const handlePlay = (videoId: string, youtubeId: string) => {
        setPlayingVideoId(videoId);
        setPlayingYoutubeId(youtubeId);
    };

    const handleClose = () => {
        setPlayingVideoId(null);
        setPlayingYoutubeId(null);
    };

    const channelUrl = youtubeChannelUrl || 'https://www.youtube.com';

    return (
        <div className="py-16" id={isFull ? 'videos-section' : 'shorts-section'}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${isFull ? 'bg-red-100' : 'bg-pink-100'}`}>
                            {isFull ? <MonitorPlay className="w-6 h-6 text-red-600" /> : <Play className="w-6 h-6 text-pink-600" />}
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                {isFull ? 'Video Tutorials' : 'Quick Shorts'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {isFull ? 'In-depth guides and walkthroughs' : 'Quick tips and demos'}
                            </p>
                        </div>
                    </div>
                    <a
                        href={channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading...</div>
                ) : (
                    <div className={`grid gap-6 ${isFull ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                        {items.map((video, index) => {
                            const videoKey = video.id || index.toString();
                            return (
                                <div key={videoKey} className="group">
                                    <div
                                        className={`relative rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all cursor-pointer ${isFull ? 'aspect-video' : 'aspect-[9/16]'}`}
                                        onClick={() => handlePlay(videoKey, video.youtubeId)}
                                    >
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
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Video player modal — single player, no dual audio */}
            {playingVideoId && playingYoutubeId && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleClose}>
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
                            onClick={handleClose}
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

export default VideoGallery;
