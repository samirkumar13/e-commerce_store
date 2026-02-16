import React, { useState, useEffect } from 'react';
import { Award, ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchBrands } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const BrandsListPage: React.FC = () => {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrands().then(data => {
            setBrands(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <button
                        onClick={() => window.location.hash = '#/'}
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-amber-100">
                            <Award className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Our Brands</h1>
                            <p className="text-slate-500 mt-1">Trusted names in electronics and robotics</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading...</div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
                            <Award className="w-10 h-10 text-amber-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No brands listed yet</h3>
                        <p className="text-sm text-slate-400">Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {brands.map((brand, index) => (
                            <a
                                key={brand.id || index}
                                href={brand.website || '#'}
                                target={brand.website ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center"
                            >
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 overflow-hidden p-3 group-hover:scale-105 transition-transform">
                                    {brand.logoUrl ? (
                                        <img src={getImageUrl(brand.logoUrl)} alt={brand.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Award className="w-10 h-10 text-amber-400" />
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">{brand.name}</h3>
                                {brand.website && (
                                    <span className="mt-2 text-xs text-slate-400 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                                        Visit <ExternalLink className="w-3 h-3" />
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandsListPage;
