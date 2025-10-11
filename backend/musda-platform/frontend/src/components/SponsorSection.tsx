
import React from 'react';
type Sponsor = {
  id: number;
  name: string;
  logo_path: string;
  category: string;
  is_active?: number;
};
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { apiCall, FILE_BASE_URL } from '../config/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Crown, Award, Star, Handshake, Sparkles, Trophy, Gem } from 'lucide-react';

export function SponsorSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const sponsorTiers = [
    {
      key: 'emerald',
      title: 'Emerald Sponsors',
      icon: Sparkles,
      color: 'from-green-500 to-green-700',
      textColor: 'text-white',
      bgColor: 'bg-green-600',
      borderColor: 'border-green-400',
    },
    {
      key: 'platinum',
      title: 'Platinum Sponsors',
      icon: Crown,
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-white',
      bgColor: 'bg-gray-700',
      borderColor: 'border-gray-400',
    },
    {
      key: 'gold',
      title: 'Gold Sponsors',
      icon: Trophy,
      color: 'from-yellow-500 to-yellow-700',
      textColor: 'text-white',
      bgColor: 'bg-yellow-600',
      borderColor: 'border-yellow-400',
    },
    {
      key: 'silver',
      title: 'Silver Sponsors',
      icon: Gem,
      color: 'from-slate-500 to-slate-700',
      textColor: 'text-white',
      bgColor: 'bg-slate-700',
      borderColor: 'border-slate-400',
    },
    {
      key: 'bronze',
      title: 'Bronze Sponsors',
      icon: Award,
      color: 'from-orange-600 to-orange-800',
      textColor: 'text-white',
      bgColor: 'bg-orange-700',
      borderColor: 'border-orange-600',
    },
    {
      key: 'harmony',
      title: 'Harmony Sponsors',
      icon: Handshake,
      color: 'from-pink-500 to-pink-700',
      textColor: 'text-white',
      bgColor: 'bg-pink-700',
      borderColor: 'border-pink-500',
    },
  ];

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await apiCall('/sponsors');
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSponsors(list.filter((s: any) => s.is_active === 1 || s.status === 'active'));
      } catch (err) {
        console.log('Sponsors API not available');
      }
    };

    fetchSponsors();
  }, []);

  return (
  <section id="sponsor" className="py-10 sm:py-24 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden px-2 sm:px-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
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
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/6 left-1/12 w-80 h-80 border border-yellow-500/10 opacity-20"
          style={{
            clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
          }}
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/6 right-1/12 w-64 h-64 border border-yellow-400/15 opacity-15"
          style={{
            clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
          }}
        />
      </div>

  <div className="container mx-auto px-0 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-block mb-8"
          >
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-400/50 rounded-full px-8 py-3 backdrop-blur-sm relative">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.3)',
                    '0 0 40px rgba(7, 7, 7, 0.6)',
                    '0 0 20px rgba(255, 215, 0, 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-0 rounded-full"
              />
              <span className="relative text-yellow-300 font-semibold text-lg tracking-wide">
                DUKUNGAN & KEMITRAAN
              </span>
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-yellow-100 mb-8"
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 215, 0, 0.3)',
                '0 0 40px rgba(2, 2, 2, 0.6)',
                '0 0 20px rgba(255, 215, 0, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Sponsor & <span className="text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text">Partner</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Terima kasih kepada para sponsor dan partner yang telah mempercayai dan mendukung 
            terlaksananya MUSDA II HIMPERRA Lampung. Bersama-sama kita membangun masa depan hunian berkelanjutan.
          </motion.p>
        </motion.div>

        {/* Main sponsor showcase - Enhanced hexagonal design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 50px rgba(3, 3, 3, 0.3)',
                '0 0 100px rgba(14, 13, 13, 0.6)',
                '0 0 50px rgba(255, 215, 0, 0.3)',
              ],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-4 border-yellow-500/50 backdrop-blur-lg max-w-2xl mx-auto p-16 overflow-hidden"
            style={{
              clipPath: 'polygon(15% 6.7%, 85% 6.7%, 100% 30%, 100% 70%, 85% 93.3%, 15% 93.3%, 0% 70%, 0% 30%)',
            }}
          >
            {/* Background sparkles */}
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 1))',
                }}
              />
            ))}
            
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              {/* Central logo only, no polygon background */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10 mb-8"
              >
                <img
                  src="/images/logo-musda.png"
                  alt="Logo MUSDA II HIMPERRA Lampung"
                />
                
              </motion.div>
              
              <h3 className="text-3xl font-bold text-yellow-100 mb-4">
                Event Resmi 2024
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Didukung oleh organisasi dan perusahaan terpercaya dalam industri perumahan dan konstruksi berkelanjutan
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Sponsor tiers with enhanced hexagonal design */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-10 sm:mb-20">
          {sponsorTiers.map((tier, tierIndex) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: tierIndex * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gray-900/70 border-2 border-yellow-500/40 backdrop-blur-lg h-full hover:bg-gray-800/70 hover:border-yellow-400/60 transition-all duration-500 relative overflow-hidden">
                <motion.div
                  animate={{
                    background: [
                      `radial-gradient(circle at 50% 50%, ${tier.color.includes('yellow') ? 'rgba(189, 169, 58, 0.1)' : 'rgba(0, 79, 216, 0.1)'} 0%, transparent 70%)`,
                      `radial-gradient(circle at 50% 50%, ${tier.color.includes('yellow') ? 'rgba(172, 160, 97, 0.2)' : 'rgba(156, 163, 175, 0.2)'} 0%, transparent 70%)`,
                      `radial-gradient(circle at 50% 50%, ${tier.color.includes('yellow') ? 'rgba(255, 215, 0, 0.1)' : 'rgba(156, 163, 175, 0.1)'} 0%, transparent 70%)`,
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: tierIndex * 0.5,
                  }}
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                />
                <CardContent className="p-10 relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 bg-gradient-to-r ${tier.color} shadow-2xl flex items-center justify-center`}
                      style={{
                        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                      }}
                    >
                      <tier.icon className="text-white" size={28} />
                    </motion.div>
                    <h3 className={`text-2xl font-bold ${tier.textColor}`}>{tier.title}</h3>
                  </div>
                  <div className="space-y-5">
                    {sponsors.filter(s => s.category === tier.key).map((sponsor, index) => (
                      <motion.div
                        key={sponsor.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.03, x: 10 }}
                      >
                        <Card className={`${tier.bgColor} border ${tier.borderColor} p-3 cursor-pointer transition-all duration-300 hover:shadow-xl backdrop-blur-sm relative overflow-hidden group`}>
                          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div
                                key={i}
                                className={`absolute w-3 h-3 border ${tier.borderColor}`}
                                style={{
                                  left: `${20 + (i % 3) * 25}%`,
                                  top: `${25 + Math.floor(i / 3) * 25}%`,
                                  clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                sponsor.logo_path?.startsWith('http')
                                  ? sponsor.logo_path
                                  : sponsor.logo_path?.startsWith('/uploads')
                                    ? `${FILE_BASE_URL}${sponsor.logo_path}`
                                    : `${FILE_BASE_URL}/uploads/sponsor-logos/${sponsor.logo_path?.replace(/^.*[\\\/]/, '')}`
                              }
                              alt={sponsor.name + ' logo'}
                              className="w-10 h-10 object-contain bg-white border border-gray-300 rounded p-1"
                              style={{ minWidth: '2.5rem', minHeight: '2.5rem', background: '#fff' }}
                              onError={e => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://via.placeholder.com/40x40?text=No+Logo';
                              }}
                            />
                            <p className={`font-bold text-base relative z-10 ${tier.textColor}`}>{sponsor.name}</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Floating sponsor logos animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="relative h-40 mb-20 overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center">
            <motion.div
              animate={{ x: [-200, window.innerWidth + 200] }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="flex space-x-10 whitespace-nowrap"
            >
              {/* Show all sponsor logos in order from Emerald to Harmony */}
              {sponsorTiers
                .map(tier => sponsors.filter(s => s.category === tier.key))
                .flat()
                .map((sponsor, i) => (
                  <motion.div
                    key={sponsor.id || i}
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                    className="w-32 h-20 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm relative"
                    style={{
                      clipPath: 'polygon(15% 6.7%, 85% 6.7%, 100% 30%, 100% 70%, 85% 93.3%, 15% 93.3%, 0% 70%, 0% 30%)',
                    }}
                  >
                    <img
                      src={
                        sponsor.logo_path?.startsWith('http')
                          ? sponsor.logo_path
                          : sponsor.logo_path?.startsWith('/uploads')
                            ? `${FILE_BASE_URL}${sponsor.logo_path}`
                            : `${FILE_BASE_URL}/uploads/sponsor-logos/${sponsor.logo_path?.replace(/^.*[\\\/]/, '')}`
                      }
                      alt={sponsor.name + ' logo'}
                      className="w-12 h-12 object-contain bg-white border border-gray-300 rounded"
                      style={{ background: '#fff' }}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Logo';
                      }}
                    />
                    {/* Small decorative elements */}
                    <motion.div
                      animate={{
                        scale: [0.5, 1, 0.5],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"
                    />
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Partnership opportunities with enhanced design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 50px rgba(255, 215, 0, 0.3)',
                '0 0 100px rgba(255, 215, 0, 0.6)',
                '0 0 50px rgba(255, 215, 0, 0.3)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-4 border-yellow-500/50 backdrop-blur-lg max-w-4xl mx-auto p-12 relative overflow-hidden"
            style={{
              clipPath: 'polygon(8% 6.7%, 92% 6.7%, 100% 20%, 100% 80%, 92% 93.3%, 8% 93.3%, 0% 80%, 0% 20%)',
            }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 8 + i * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                  className="absolute w-3 h-3 border border-yellow-400"
                  style={{
                    left: `${10 + (i % 6) * 15}%`,
                    top: `${15 + Math.floor(i / 6) * 15}%`,
                    clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-8"
              >
                <Handshake className="text-yellow-400 mx-auto" size={80} />
              </motion.div>
              
              <h3 className="text-4xl font-bold text-yellow-100 mb-6">
                Menjadi Sponsor atau Partner?
              </h3>
              <p className="text-gray-300 mb-8 text-xl leading-relaxed">
                Bergabunglah dengan kami dan dapatkan eksposur maksimal kepada para profesional, 
                pengambil keputusan, dan pemangku kepentingan di industri perumahan. 
                Berbagai paket sponsorship tersedia sesuai kebutuhan perusahaan Anda.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { value: '500+', label: 'Peserta Profesional', icon: Crown },
          
                  { value: '100%', label: 'Target Audience', icon: Star }
                ].map(({ value, label, icon: Icon }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 10 + index * 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-3 flex items-center justify-center"
                      style={{
                        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                      }}
                    >
                      <Icon className="text-gray-900" size={20} />
                    </motion.div>
                    <div className="text-yellow-400 font-bold text-3xl">{value}</div>
                    <div className="text-gray-400 text-sm">{label}</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8 mb-2">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => document.getElementById('kontak')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 px-10 py-4 text-lg font-bold shadow-2xl"
                  >
                    Hubungi Kami
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 px-10 py-4 text-lg font-semibold backdrop-blur-sm"
                  >
                    Download Proposal
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}