import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Beranda', href: '#beranda', type: 'scroll' },
    { name: 'Tentang', href: '#tentang', type: 'scroll' },
    { name: 'Agenda', href: '#agenda', type: 'scroll' },
    { name: 'Daftar', href: '#daftar', type: 'scroll' },
    { name: 'Berita', href: '/news', type: 'navigate' },
    { name: 'Sekolah Properti', href: '/sekolah-properti', type: 'navigate' },
    { name: 'Sponsor', href: '#sponsor', type: 'scroll' },
    { name: 'Kontak', href: '#kontak', type: 'scroll' }
  ];

  const handleMenuClick = (item: any) => {
    if (item.type === 'navigate') {
      navigate(item.href);
    } else if (item.type === 'scroll') {
      const hash = item.href; // e.g. #agenda
      if (location.pathname !== '/') {
        navigate('/' + hash);
      } else {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for hash changes after navigation to root and then scroll smoothly
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      // small timeout to ensure DOM sections rendered
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  }, [location.pathname, location.hash]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gray-950/95 backdrop-blur-xl shadow-2xl border-b border-yellow-500/20' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between w-full h-12">
          {/* Logo + Title, satu baris simetris */}
          <div className={`flex items-center gap-3 ${isScrolled ? 'scale-90' : ''}`} style={{ minWidth: 0 }}>
            <img
              src="/images/logo-himperra.png"
              alt="Logo Himperra"
              className={`w-10 h-10 rounded-lg shadow-lg border-2 bg-white object-cover transition-all duration-300 ${isScrolled ? 'w-8 h-8' : ''}`}
              style={{ flexShrink: 0 }}
            />
            <div className="flex flex-col justify-center min-w-0 pl-2 h-10">
              {/* Judul/brand bisa ditambah di sini jika perlu */}
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => handleMenuClick(item)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 relative group font-medium bg-transparent border-none cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                {item.name}
                <motion.span 
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300 group-hover:w-full"
                  whileHover={{
                    boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
                  }}
                ></motion.span>
              </motion.button>
            ))}
          </div>
          {/* Mobile Menu Button & Dropdown */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-yellow-400 p-2 relative"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </motion.button>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 bg-gray-950/80 backdrop-blur-lg flex flex-col items-center justify-center z-50"
              >
                <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto">
                  <button
                    className="mb-8 self-end text-yellow-400 bg-gray-900/80 rounded-full p-3 shadow-md z-10"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Tutup Menu"
                  >
                    <X size={28} />
                  </button>
                  {menuItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleMenuClick(item)}
                      className="block w-full text-center text-gray-300 hover:text-yellow-400 text-xl font-bold py-4 px-2 rounded-2xl transition-all duration-200 bg-gray-900/90 mb-6 shadow-lg border-none cursor-pointer"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </nav>
    </motion.header>
  );
}