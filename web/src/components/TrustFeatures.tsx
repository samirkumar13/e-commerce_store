import React from 'react';
import { Truck, ShieldCheck, Box } from 'lucide-react';

const TrustFeatures: React.FC = () => {
    const features = [
        {
            icon: <Truck className="w-10 h-10 text-primary mb-3" />,
            title: "Same Day Shipping",
            description: "For orders placed before 2 PM"
        },
        {
            icon: <ShieldCheck className="w-10 h-10 text-primary mb-3" />,
            title: "Dedicated Support",
            description: "Expert technical assistance"
        },
        {
            icon: <Box className="w-10 h-10 text-primary mb-3" />,
            title: "140+ Brands",
            description: "Authentic components globally"
        }
    ];

    return (
        <section className="bg-white py-8 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-slate-50 transition-colors duration-300 border border-transparent hover:border-slate-100"
                        >
                            <div className="bg-primary/5 p-4 rounded-full mb-3">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{feature.title}</h3>
                            <p className="text-slate-500 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustFeatures;
