"use client";

import { useState, useEffect } from "react";

export function Carousel({ slides, autoplayInterval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!autoplayInterval) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [currentIndex, autoplayInterval]);

  return (
    <div className="testimonial w-slider">
      <div className="testimonial-mask w-slider-mask" style={{ overflow: "hidden" }}>
        <div
          className="testimonial-track"
          style={{
            display: "flex",
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: "transform 400ms ease",
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="testimonial-slide w-slide"
              style={{ minWidth: "100%", flexShrink: 0 }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      <div
        className="testimonial-arrow-area left w-slider-arrow-left"
        onClick={prevSlide}
        style={{ cursor: "pointer" }}
      >
        <div className="testimonial-arrow-wrap">
          <img
            src="/images/testimonial-left-arrow.svg"
            loading="lazy"
            alt="Testimonial left arrow"
            className="testimonial-arrow"
          />
        </div>
      </div>
      <div
        className="testimonial-arrow-area w-slider-arrow-right"
        onClick={nextSlide}
        style={{ cursor: "pointer" }}
      >
        <div className="testimonial-arrow-wrap">
          <img
            src="/images/testimonial-right-arrow.svg"
            loading="lazy"
            alt="Testimonial right arrow"
            className="testimonial-arrow"
          />
        </div>
      </div>
    </div>
  );
}
