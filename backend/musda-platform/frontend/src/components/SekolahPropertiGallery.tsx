import React, { useState, useEffect } from 'react';
import { getFileUrl } from '../config/api';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

interface GalleryItem {
  id: number;
  image_url: string;
  description: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const SekolahPropertiGallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch gallery items from API
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          // Handle API response structure (array or wrapped)
          if (Array.isArray(data)) {
            setGalleryItems(data);
          } else if (data.success && Array.isArray(data.data)) {
            setGalleryItems(data.data);
          } else {
            console.error('Invalid gallery data structure:', data);
            setGalleryItems([]);
          }
        } else {
          console.error('Failed to fetch gallery items');
          setGalleryItems([]);
        }
      } catch (error) {
        console.error('Error fetching gallery items:', error);
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  // Convert API data to gallery images format
  const images: GalleryImage[] = galleryItems.map(item => ({
    id: item.id,
    src: item.image_url.startsWith('http') ? item.image_url : getFileUrl(item.image_url),
    alt: item.description,
    caption: item.description
  }));

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const prevImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Gallery Sekolah Properti</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Loading gallery...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Gallery Sekolah Properti</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              No gallery items available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="group relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm cursor-pointer shadow-2xl"
            onClick={() => openModal(image)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  (target as any).onerror = null;
                  target.src = `https://via.placeholder.com/600x400/1f2937/facc15?text=${encodeURIComponent(image.alt)}`;
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/50 rounded-full p-4 mb-3">
                    <ZoomIn className="w-8 h-8 text-yellow-300" />
                  </div>
                  <p className="text-yellow-300 font-medium text-sm">Lihat Detail</p>
                </motion.div>
              </div>
            </div>
            
            {/* Caption */}
            <div className="p-4">
              <p className="text-gray-300 text-sm font-medium">{image.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className="relative max-w-5xl max-h-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-yellow-400/30 rounded-2xl overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-gray-900/80 hover:bg-yellow-500/20 text-yellow-300 hover:text-yellow-200 p-2 rounded-full border border-yellow-400/30 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Previous Button */}
              <motion.button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-900/80 hover:bg-yellow-500/20 text-yellow-300 hover:text-yellow-200 p-3 rounded-full border border-yellow-400/30 transition-all duration-300"
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              {/* Next Button */}
              <motion.button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-900/80 hover:bg-yellow-500/20 text-yellow-300 hover:text-yellow-200 p-3 rounded-full border border-yellow-400/30 transition-all duration-300"
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Image */}
              <div className="p-4">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    (target as any).onerror = null;
                    target.src = `https://via.placeholder.com/800x600/1f2937/facc15?text=${encodeURIComponent(selectedImage.alt)}`;
                  }}
                />
              </div>

              {/* Caption */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-t border-yellow-400/30 backdrop-blur-sm p-6">
                <p className="text-center font-medium text-yellow-300 text-lg">{selectedImage.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SekolahPropertiGallery;