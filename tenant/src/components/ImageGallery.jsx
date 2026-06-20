import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export default function ImageGallery({ images = [], alt = 'Property image' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 md:h-96 bg-surface-tertiary rounded-xl flex items-center justify-center">
        <div className="text-center text-muted">
          <ImageOff className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const prev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full h-64 md:h-96 bg-surface-tertiary rounded-xl overflow-hidden group">
        <img
          src={images[currentIndex]?.url}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-dropdown opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-dropdown opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-900" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.public_id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
