import React from 'react';

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' | number }> = ({ rating, size = 'md' }) => {
    const stars = [];

    // Handle numeric custom size or predefined string sizes
    let sizeClass = 'h-5 w-5';
    let style = {};

    if (typeof size === 'number') {
        style = { width: size, height: size };
    } else {
        sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6';
    }

    for (let i = 1; i <= 5; i++) {
        stars.push(
            <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`${sizeClass} ${i <= rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`}
                style={style}
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        );
    }
    return <div className="flex gap-0.5">{stars}</div>;
};

export default StarRating;
