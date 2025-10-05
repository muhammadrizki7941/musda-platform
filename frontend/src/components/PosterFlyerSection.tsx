import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl, getFileUrl } from '../config/api';

interface Poster {
  id: number;
  image_url: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PosterFlyerSection: React.FC = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchActivePosters();
  }, []);

  const fetchActivePosters = async () => {
    try {
      console.log('🖼️ Fetching active posters...');
      setLoading(true);
      setError(null);

  const response = await fetch(getApiUrl('/poster/active'));
      const data = await response.json();

      if (data.success) {
        // Handle both single object and array responses
        const posterData = Array.isArray(data.data) ? data.data : [data.data];
        console.log(`✅ Found ${posterData.length} active posters`);
        setPosters(posterData.filter((poster: any) => poster && poster.id)); // Filter out null/undefined
      } else {
        console.error('❌ Failed to fetch posters:', data.message);
        setError(data.message || 'Gagal memuat poster');
      }
    } catch (error) {
      console.error('❌ Error fetching posters:', error);
      setError('Gagal memuat poster');
    } finally {
      setLoading(false);
    }
  };

  // auto-rotate when multiple posters are available
  useEffect(() => {
    if (posters.length > 1 && !isHovered) {
      const id = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % posters.length);
      }, 5000); // 5s per slide
      return () => clearInterval(id);
    }
  }, [posters.length, isHovered]);

  // reset index when data changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [posters.length]);

  const getImageUrl = (imageUrl: string) => {
    return getFileUrl(imageUrl);
  };

  if (loading) {
    return (
      <div className="w-full py-2 flex justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-lg w-100 h-100"></div>
          <div className="animate-pulse bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded h-4 w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8 flex justify-center">
        <div className="text-center text-red-400">
          <p>Error: {error}</p>
          <button 
            onClick={fetchActivePosters}
            className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (posters.length === 0) {
    return null; // Don't show anything if no posters
  }

  const poster = posters[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-8 px-4"
    >
      <div className="max-w-6xl mx-auto flex justify-center">
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Poster Container */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-1 rounded-2xl">
              <div className="bg-gray-900 rounded-xl h-full w-full"></div>
            </div>

            {/* Main Content with crossfade */}
            <div className="relative p-1">
              <div className="relative overflow-hidden rounded-xl aspect-square w-64 md:w-80 lg:w-96">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={poster?.id ?? currentIndex}
                    src={getImageUrl(poster.image_url)}
                    alt={poster.title}
                    className="w-full h-full object-cover rounded-xl absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    onError={(e) => {
                      console.error('❌ Error loading poster image:', poster.image_url);
                      const target = e.target as HTMLImageElement;
                      (target as any).onerror = null;
                      target.src = 'https://via.placeholder.com/400x400/1f2937/facc15?text=Poster+Not+Found';
                    }}
                  />
                </AnimatePresence>

                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold mb-2">{poster.title}</h3>
                    {poster.description && (
                      <p className="text-sm opacity-90 line-clamp-3">{poster.description}</p>
                    )}
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg"
          >
            Eksklusif
          </motion.div>

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
        </motion.div>
      </div>

      {/* Title and Description below poster (optional) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center mt-6 max-w-md mx-auto"
      >
        <h3 className="text-xl font-bold text-white mb-2">{poster.title}</h3>
        {poster.description && (
          <p className="text-gray-300 text-sm leading-relaxed">{poster.description}</p>
        )}
      </motion.div>

      {/* Indicators (dots) */}
      {posters.length > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {posters.map((p, i) => (
            <button
              key={p.id}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentIndex ? 'bg-yellow-400' : 'bg-gray-600'}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PosterFlyerSection;