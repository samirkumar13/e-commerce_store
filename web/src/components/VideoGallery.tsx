import React from 'react';
import { Play, MonitorPlay, ArrowRight } from 'lucide-react';

interface VideoGalleryProps {
    type: 'full' | 'shorts';
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ type }) => {
    const isFull = type === 'full';

    const videos = [
        { id: 'dQw4w9WgXcQ', title: 'Introduction to Robotics' },
        { id: 'dQw4w9WgXcQ', title: 'Getting Started with Sensors' },
        { id: 'dQw4w9WgXcQ', title: 'Advanced Motor Control' },
        { id: 'dQw4w9WgXcQ', title: 'Wireless Communication Guide' },
    ];

    const shorts = [
        { id: 'pP44EPBMb8A', title: 'Quick Tip: Soldering' },
        { id: 'pP44EPBMb8A', title: 'Blink an LED' },
        { id: 'pP44EPBMb8A', title: 'Voltage Divider' },
        { id: 'pP44EPBMb8A', title: 'Safe Batteries' },
    ];

    return (
        <section className={`py-16 ${isFull ? 'bg-slate-50' : 'bg-white border-t border-slate-100'}`}>
            <div className="container mx-auto px-4">
                {isFull ? (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center">
                                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                                    <MonitorPlay className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Our Videos</h2>
                            </div>
                            <button className="text-primary font-semibold flex items-center gap-2 hover:underline">
                                View All Videos <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {videos.map((video, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-slate-100 group">
                                    <div className="aspect-video relative pt-[56.25%] overflow-hidden">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${video.id}?modestbranding=1&rel=0`}
                                            title={video.title}
                                            className="absolute top-0 left-0 w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center">
                                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                                    <Play className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Our Short Videos</h2>
                            </div>
                            <button className="text-primary font-semibold flex items-center gap-2 hover:underline">
                                View All Shorts <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {shorts.map((video, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-slate-100">
                                    <div className="relative pt-[177%] bg-black overflow-hidden">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${video.id}?modestbranding=1&rel=0`}
                                            title={video.title}
                                            className="absolute top-0 left-0 w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-bold text-sm text-slate-800 line-clamp-2">{video.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default VideoGallery;
