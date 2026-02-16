import React from 'react';
import { ArrowRight, Award } from 'lucide-react';

const FeaturedBrands: React.FC = () => {
    const brands = [
        { name: 'Arduino', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Arduino_Logo.svg/1200px-Arduino_Logo.svg.png' },
        { name: 'Raspberry Pi', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Raspberry_Pi_Logo.svg/1200px-Raspberry_Pi_Logo.svg.png' },
        { name: 'SparkFun', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/SparkFun_Logo.svg/1200px-SparkFun_Logo.svg.png' },
        { name: 'Adafruit', logo: 'https://vignette.wikia.nocookie.net/logopedia/images/4/47/Adafruit_Industries_logo.png/revision/latest?cb=20150917024316' },
        { name: 'Pololu', logo: 'https://upload.wikimedia.org/wikipedia/en/2/23/Pololu_logo.png' },
        { name: 'STMicroelectronics', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/STMicroelectronics_logo.svg/1200px-STMicroelectronics_logo.svg.png' },
        { name: 'Texas Instruments', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Texas_Instruments_logo.svg/1200px-Texas_Instruments_logo.svg.png' },
        { name: 'Microchip', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microchip_Technology_logo.svg/1200px-Microchip_Technology_logo.svg.png' },
    ];

    return (
        <section className="bg-white py-16 border-t border-slate-100">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Award className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Our Featured Brands</h2>
                    </div>
                    <button className="text-primary font-bold hover:underline flex items-center gap-2 group">
                        View All Brands <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 px-2">
                    {brands.map((brand, index) => (
                        <div key={index} className="flex items-center justify-center p-6 h-32 bg-white border border-slate-100 rounded-2xl hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer grayscale hover:grayscale-0 opacity-60 hover:opacity-100 group">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-h-16 max-w-full object-contain filter transition-all duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedBrands;
