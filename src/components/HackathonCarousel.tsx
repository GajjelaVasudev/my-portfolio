import React, { useState } from 'react';

export interface CarouselImage {
  src: string;
  alt: string;
  caption: string;
}

interface HackathonCarouselProps {
  images: CarouselImage[];
}

export const HackathonCarousel: React.FC<HackathonCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const currentImage = images[currentIndex];

  return (
    <div
      className="hackathon-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="JPMorgan Code for Good photos"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="carousel-frame">
        <img
          key={currentImage.src}
          src={currentImage.src}
          alt={currentImage.alt}
          className="carousel-image"
          loading="lazy"
        />

        {/* Carousel Arrow Controls */}
        <button
          type="button"
          onClick={handlePrev}
          className="carousel-nav-btn carousel-nav-prev"
          aria-label="Previous photo"
          title="Previous photo"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="carousel-nav-btn carousel-nav-next"
          aria-label="Next photo"
          title="Next photo"
        >
          <span aria-hidden="true">›</span>
        </button>

        {/* Counter Tag */}
        <div className="carousel-counter" aria-live="polite">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Caption & Pagination Dots Bar */}
      <div className="carousel-footer-bar">
        <p className="carousel-caption">{currentImage.caption}</p>
        <div className="carousel-dots" role="tablist" aria-label="Photo pagination">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to photo ${idx + 1}: ${img.caption}`}
              className={`carousel-dot ${idx === currentIndex ? 'is-active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
