import React, { useRef, useState } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt }) => {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl bg-white cursor-zoom-in select-none w-full h-full"
      style={{}}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-100"
        style={
          zoomed
            ? { transform: 'scale(2.2)', transformOrigin: `${pos.x}% ${pos.y}%` }
            : { transform: 'scale(1)', transformOrigin: 'center center' }
        }
        draggable={false}
      />
      {!zoomed && (
        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
          Hover to zoom
        </div>
      )}
    </div>
  );
};

export default ImageZoom;
