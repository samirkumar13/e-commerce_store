
import React, { useEffect, useState } from 'react';
import * as apiService from '../services/api';
import { HomeSlide } from '../types';

const Hero: React.FC = () => {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await apiService.fetchHomeSlides();
        setSlides(data);
      } catch (error) {
        console.error("Failed to fetch slides", error);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, currentIndex]); // Reset timer on manual interaction

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (slides.length === 0) {
    return (
      <div className="relative bg-slate-800 rounded-lg overflow-hidden my-8">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
            alt="Electronics workshop background"
          />
        </div>
        <div className="relative max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Your Source for Electronic Components
          </h1>
          <p className="mt-6 text-xl text-slate-300">
            From microcontrollers to sensors, find everything you need for your next project at Circuit Hub.
          </p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden my-8 h-[400px] group">
      <div className="absolute inset-0 transition-opacity duration-1000">
          <img
            key={currentSlide.imageUrl}
            className="w-full h-full object-cover opacity-50 animate-fade-in"
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
          />
      </div>
      <div className="relative h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 text-white z-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-lg animate-fade-in-up">
          {currentSlide.title}
        </h1>
         {currentSlide.linkUrl && (
             <a href={currentSlide.linkUrl} className="mt-8 px-8 py-3 bg-primary hover:bg-primary-focus text-white font-bold rounded-full transition shadow-lg transform hover:scale-105 animate-fade-in-up">
                 Shop Now
             </a>
         )}
      </div>
      
      {slides.length > 1 && (
          <>
            {/* Previous Button */}
            <button 
                onClick={goToPrevious} 
                className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300"
                aria-label="Previous Slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {/* Next Button */}
            <button 
                onClick={goToNext} 
                className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300"
                 aria-label="Next Slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
          </>
      )}
    </div>
  );
};

export default Hero;
