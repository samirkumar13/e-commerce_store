import React, { useState, useEffect } from 'react';
import { ArrowRight, Award } from 'lucide-react';
import { fetchBrands } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const FeaturedBrands: React.FC = () => {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrands().then(data => {
            setBrands(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const fallbackBrands = [
        { name: 'Arduino', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Arduino_Logo.svg/1200px-Arduino_Logo.svg.png', website: 'https://www.arduino.cc' },
        { name: 'Raspberry Pi', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Raspberry_Pi_Logo.svg/1200px-Raspberry_Pi_Logo.svg.png', website: 'https://www.raspberrypi.com' },
        { name: 'SparkFun', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/SparkFun_Logo.svg/1200px-SparkFun_Logo.svg.png', website: 'https://www.sparkfun.com' },
        { name: 'Adafruit', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Adafruit_logo.svg/1200px-Adafruit_logo.svg.png', website: 'https://www.adafruit.com' },
    ];

    const items = brands.length > 0 ? brands : fallbackBrands;

    return (
        <div className="py-16" id="brands-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-100">
                            <Award className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Brands</h2>
                            <p className="text-sm text-slate-500 mt-1">Trusted names in electronics and robotics</p>
                        </div>
                    </div>
                    <a
                        href="#/brands"
                        className="hidden sm:flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 px-2">
                        {items.map((brand, index) => (
                            <a
                                key={brand.id || index}
                                href={brand.website || '#'}
                                target={brand.website ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-6 h-32 bg-white border border-slate-100 rounded-2xl hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer grayscale hover:grayscale-0 opacity-60 hover:opacity-100 group"
                            >
                                <img
                                    src={brand.logoUrl?.startsWith('http') ? brand.logoUrl : getImageUrl(brand.logoUrl)}
                                    alt={brand.name}
                                    className="max-h-14 max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                                <span className="mt-2 text-xs text-slate-400 group-hover:text-slate-600 font-medium transition-colors">{brand.name}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturedBrands;
