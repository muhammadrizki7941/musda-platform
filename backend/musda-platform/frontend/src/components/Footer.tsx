import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, ExternalLink, Clock, Users, Sparkles, Crown, Star } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' }
  ];

  const quickLinks = [
    { name: 'Tentang HIMPERRA', href: '#tentang' },
    { name: 'Agenda Lengkap', href: '#agenda' },
    { name: 'Pendaftaran', href: '#daftar' },
    { name: 'Informasi Sponsor', href: '#sponsor' },
    { name: 'Kontak Panitia', href: '#kontak' }
  ];

  const eventInfo = [

    { icon: Users, label: 'Anggota', value: '50+', detail: 'Peserta Terdaftar', color: 'from-yellow-400 to-yellow-500' },
    { icon: MapPin, label: 'Lokasi', value: 'Lampung', detail: 'Akan diumumkan', color: 'from-yellow-600 to-yellow-700' }
  ];

  return (
  <footer id="kontak" className="bg-gradient-to-b from-gray-950 to-black border-t-4 border-yellow-500/50 relative overflow-hidden px-4 sm:px-8 py-8 sm:py-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))',
            }}
          />
        ))}
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-0 sm:px-6 py-0 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand & Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-4">
              {/* Enhanced hexagonal logo */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  boxShadow: [
                    '0 0 30px rgba(255, 215, 0, 0.5)',
                    '0 0 60px rgba(255, 215, 0, 0.8)',
                    '0 0 30px rgba(255, 215, 0, 0.5)',
                  ],
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl"
                style={{
                  clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                }}
              >
                {/* Logo HIMPERRA from public/images */}
                <img
                  src="/images/logo-himperra.png"
                  alt="Logo HIMPERRA"
                  width={40}
                  height={40}
                  className="object-contain"
                  loading="lazy"
                />
                
                {/* Corner sparkles */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute -top-2 -right-2 text-yellow-300"
                >
                  <Sparkles size={16} />
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="absolute -bottom-2 -left-2 text-yellow-200"
                >
                  <Star size={14} />
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h3 
                  className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(255, 215, 0, 0.5)',
                      '0 0 20px rgba(255, 215, 0, 0.8)',
                      '0 0 10px rgba(255, 215, 0, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  HIMPERRA
                </motion.h3>
                <p className="text-yellow-300 font-semibold">PROVINSI LAMPUNG</p>
                <p className="text-gray-400 text-sm">2024</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Musyawarah Daerah II HIMPERRA Lampung menghadirkan kolaborasi strategis 
              untuk masa depan hunian berkelanjutan dan pertumbuhan ekonomi regional yang inklusif.
            </p>

            {/* Social Media with hexagonal design */}
            <div>
              <h4 className="text-yellow-300 font-bold mb-6 text-lg">Ikuti Kami</h4>
              <div className="flex space-x-4">
                {socialLinks.map(({ icon: Icon, href, label, color }, index) => (
                  <motion.a
                    key={label}
                    href={href}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.2, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 bg-gray-800 border-2 border-yellow-500/30 flex items-center justify-center text-gray-400 ${color} hover:text-white hover:border-transparent transition-all duration-300 relative`}
                    style={{
                      clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                    }}
                    aria-label={label}
                    viewport={{ once: true }}
                  >
                    <Icon size={20} />
                    <motion.div
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                      className="absolute inset-0 border-2 border-yellow-400"
                      style={{
                        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                      }}
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h4 className="text-yellow-300 font-bold text-xl mb-8 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500"
                style={{
                  clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                }}
              />
              Menu Cepat
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.a
                    href={link.href}
                    className="text-gray-300 hover:text-yellow-400 transition-all duration-300 flex items-center group text-lg"
                    whileHover={{ x: 5 }}
                  >
                    <span>{link.name}</span>
                    <ExternalLink size={16} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h4 className="text-yellow-300 font-bold text-xl mb-8 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-yellow-600"
                style={{
                  clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                }}
              />
              Kontak
            </h4>
            <div className="space-y-6">
              {[
                { icon: Mail, title: 'Email', content: 'himperralampung@mail.com', href: 'mailto:info@himperralampung.org', color: 'from-blue-500 to-blue-600' },
                { icon: Phone, title: 'Telepon', content: '+628978900708', href: 'tel:+628978900708', color: 'from-green-500 to-green-600' },
                { icon: MapPin, title: 'Alamat', content: 'Jl. sultan Haji, Sepang Jaya Kedaton Bandar Lampung\nLampung 35145', href: null, color: 'from-red-500 to-red-600' }
              ].map(({ icon: Icon, title, content, href, color }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className={`w-10 h-10 bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 mt-1 shadow-lg`}
                    style={{
                      clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                    }}
                  >
                    <Icon size={18} className="text-white" />
                  </motion.div>
                  <div>
                    <h5 className="text-yellow-300 font-semibold mb-1">{title}</h5>
                    {href ? (
                      <motion.a 
                        href={href}
                        className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm leading-relaxed"
                        whileHover={{ x: 3 }}
                      >
                        {content}
                      </motion.a>
                    ) : (
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {content}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h4 className="text-yellow-300 font-bold text-xl mb-8 flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-6 h-6 bg-gradient-to-r from-yellow-600 to-yellow-700"
                style={{
                  clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                }}
              />
              Info Event
            </h4>
            <div className="space-y-6">
              {eventInfo.map(({ icon: Icon, label, value, detail, color }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gray-900/60 border-2 border-yellow-500/30 backdrop-blur-sm p-6 relative overflow-hidden group"
                  style={{
                    clipPath: 'polygon(10% 6.7%, 90% 6.7%, 100% 25%, 100% 75%, 90% 93.3%, 10% 93.3%, 0% 75%, 0% 25%)',
                  }}
                >
                  {/* Background glow effect */}
                  <motion.div
                    animate={{
                      background: [
                        'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                        'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                        'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <div className="flex items-center gap-4 mb-3 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-8 h-8 bg-gradient-to-r ${color} flex items-center justify-center`}
                      style={{
                        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                      }}
                    >
                      <Icon className="text-white" size={16} />
                    </motion.div>
                    <span className="text-yellow-300 font-semibold text-lg">{label}</span>
                  </div>
                  <p className="text-yellow-200 font-bold text-xl mb-1 relative z-10">{value}</p>
                  <p className="text-gray-400 text-sm relative z-10">{detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom section with enhanced design */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="border-t-2 border-yellow-500/30 py-8 relative"
      >
        {/* Background decoration */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${5 + i * 6}%`,
                top: `${20 + (i % 3) * 20}%`,
                filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))',
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-8">
              <p className="text-gray-400">
                © 2025 HIMPERRA Lampung. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Privacy Policy
                </motion.a>
                <span className="text-gray-600">•</span>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                  whileHover={{ y: -2 }}
                >
                  Terms of Service
                </motion.a>
              </div>
            </div>
            
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-right flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center"
                style={{
                  clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                }}
              >
                <Crown className="text-gray-900" size={16} />
              </motion.div>
              <div>
                <p className="text-yellow-400 font-bold">HIMPERRA - 2025</p>
                <p className="text-gray-400 text-sm">Kolaborasi untuk Masa Depan</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}