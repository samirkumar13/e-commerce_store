import React from 'react';
import { Calendar, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

const BlogPreview: React.FC<{ type: 'blogs' | 'tutorials' }> = ({ type }) => {
    const isBlog = type === 'blogs';

    const content = isBlog ? [
        {
            id: 1,
            title: "Getting Started with Arduino in 2024",
            excerpt: "Everything you need to know to start your first electronics project using the world's most popular microcontroller platform.",
            date: "Feb 10, 2024",
            image: "https://images.unsplash.com/photo-1555664424-778a69fdb6b8?q=80&w=800&auto=format&fit=crop",
            category: "Tutorials"
        },
        {
            id: 2,
            title: "Top 10 Essential Robotics Components",
            excerpt: "Discover the must-have sensors, motors, and controllers for building your next advanced walking or rolling robot.",
            date: "Feb 05, 2024",
            image: "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?q=80&w=800&auto=format&fit=crop",
            category: "Guides"
        },
        {
            id: 3,
            title: "Understanding LiPo Battery Safety",
            excerpt: "Learn how to properly handle, charge, and store Lithium Polymer batteries to ensure maximum life and safety for your projects.",
            date: "Jan 28, 2024",
            image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop",
            category: "Technical"
        },
        {
            id: 4,
            title: "Internet of Things: A Beginner's Guide",
            excerpt: "Connect your devices to the web. A complete introduction to IoT technologies for makers and engineers.",
            date: "Jan 20, 2024",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
            category: "IoT"
        }
    ] : [
        {
            id: 1,
            title: "Servo Motor Control with ESP32",
            excerpt: "Step-by-step guide to controlling multiple servo motors using the ESP32 and PWM signals.",
            date: "Feb 12, 2024",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
            category: "ESP32"
        },
        {
            id: 2,
            title: "Custom PCB Design with KiCad",
            excerpt: "From schematic to fabrication. Learn the full workflow of designing professional quality printed circuit boards.",
            date: "Feb 08, 2024",
            image: "https://images.unsplash.com/photo-1580584126903-c17d41830450?q=80&w=800&auto=format&fit=crop",
            category: "PCB Design"
        },
        {
            id: 3,
            title: "I2C Communication Protocol Deep Dive",
            excerpt: "Master the Inter-Integrated Circuit protocol to connect multiple sensors and displays to your microcontroller.",
            date: "Feb 01, 2024",
            image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop",
            category: "Protocol"
        },
        {
            id: 4,
            title: "Python for Hardware Interaction",
            excerpt: "Learn how to use Python and MicroPython to program hardware, read data, and build desktop controllers.",
            date: "Jan 25, 2024",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
            category: "Python"
        }
    ];

    return (
        <section className={`py-16 ${isBlog ? 'bg-white' : 'bg-slate-50 border-t border-slate-100'}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                {isBlog ? <BookOpen className="w-5 h-5 text-primary" /> : <GraduationCap className="w-5 h-5 text-primary" />}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{isBlog ? 'Latest Blogs' : 'Technical Tutorials'}</h2>
                        </div>
                        <p className="text-slate-500 max-w-2xl">
                            {isBlog ? 'Learn, build, and innovate with our latest news and guides.' : 'Step-by-step technical walkthroughs for your engineering projects.'}
                        </p>
                    </div>
                    <button className="text-primary font-bold hover:underline flex items-center gap-2 group">
                        View All {isBlog ? 'Posts' : 'Tutorials'} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-slate-100 flex flex-col items-stretch h-full">
                            <div className="relative h-44 overflow-hidden shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm uppercase tracking-wider">
                                    {item.category}
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex items-center text-slate-400 text-xs mb-3 font-medium">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {item.date}
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
                                    {item.excerpt}
                                </p>
                                <div className="flex items-center text-primary font-bold text-sm mt-auto group/btn">
                                    Read More <ArrowRight className="w-4 h-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogPreview;
