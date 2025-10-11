import React from 'react';
import { motion } from 'motion/react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const SekolahPropertiSlider: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    dotsClass: "slick-dots custom-dots",
  };

  const slides = [
    {
      id: 1,
      title: "Belajar dari Para Ahli",
      subtitle: "Instruktur berpengalaman 15+ tahun di industri properti",
      description: "Dapatkan insight eksklusif dari praktisi properti terbaik di Lampung",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
      bgColor: "from-yellow-600/20 to-yellow-800/30"
    },
    {
      id: 2,
      title: "Strategi Investasi Terbukti",
      subtitle: "Metode analisis properti yang telah terbukti menguntungkan",
      description: "Pelajari teknik evaluasi lokasi, cashflow, dan ROI yang akurat",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop",
      bgColor: "from-yellow-500/20 to-yellow-700/30"
    },
    {
      id: 3,
      title: "Networking Berkualitas",
      subtitle: "Terhubung dengan komunitas investor properti Lampung",
      description: "Bangun relasi dengan sesama investor dan developer terpercaya",
      image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&h=600&fit=crop",
      bgColor: "from-yellow-400/20 to-yellow-600/30"
    },
    {
      id: 4,
      title: "Studi Kasus Real",
      subtitle: "Analisis project properti nyata di Bandar Lampung",
      description: "Pembelajaran dengan case study properti yang sedang berkembang",
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&h=600&fit=crop",
      bgColor: "from-yellow-600/20 to-yellow-800/30"
    }
  ];

  return (
    <div className="w-full sekolah-properti-slider">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id} className="outline-none">
            <motion.div 
              className={`relative h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden border border-yellow-400/20 rounded-2xl mx-2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              
              {/* Golden Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor}`} />
              
              {/* Content */}
              <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                <motion.div 
                  className="max-w-2xl text-white"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                    {slide.title}
                  </h3>
                  <h4 className="text-xl font-semibold mb-4 text-yellow-300">{slide.subtitle}</h4>
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed">{slide.description}</p>
                  
                  <motion.div 
                    className="mt-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <motion.a 
                      href="#registration" 
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 px-8 rounded-xl transition-all duration-300 inline-block shadow-2xl"
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      style={{ filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.7))' }}
                    >
                      Daftar Sekarang
                    </motion.a>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 1, 0.2],
                      scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                    }}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SekolahPropertiSlider;