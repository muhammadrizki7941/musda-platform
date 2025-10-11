import React, { useState, useEffect } from 'react';
import { getApiUrl, getFileUrl, FILE_BASE_URL } from '../config/api';
import { motion } from 'motion/react';

type Sponsor = {
  id: number;
  name: string;
  logo_path: string;
  category?: string;
  status?: string;
  is_active?: boolean;
};

// Use unified FILE_BASE_URL (derived from VITE_API_BASE) instead of deprecated VITE_API_BASE_URL
const BASE = FILE_BASE_URL || (import.meta as any).env.VITE_API_BASE || '';

export function SponsoredBySection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    // Fetch active sponsors from backend
    fetch(getApiUrl('/sponsors'))
      .then(res => res.json())
      .then(response => {
        console.log('Sponsors API response in SponsoredBySection:', response);
        const sponsorData = response?.data ?? [];
        const activeSponsors = Array.isArray(sponsorData)
          ? sponsorData.filter((s: any) => s.is_active === 1 || s.status === 'active')
          : [];
        setSponsors(activeSponsors);
      })
      .catch(err => {
        console.error('Error fetching sponsors:', err);
        setSponsors([]);
      });
  }, []);

  if (sponsors.length === 0) {
    return null; // Don't show section if no sponsors
  }

  return (
    <section className="py-8 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
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

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Title */}
          <motion.h2
            className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent"
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 215, 0, 0.3)',
                '0 0 30px rgba(255, 215, 0, 0.5)',
                '0 0 20px rgba(255, 215, 0, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Sponsored by :
          </motion.h2>

          {/* Sponsor Logos */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -5,
                  boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)'
                }}
                className="group"
              >
                <div className="relative bg-white/10 backdrop-blur-sm border-2 border-yellow-400/30 rounded-xl p-4 hover:border-yellow-400/60 transition-all duration-300 hover:bg-white/20">
                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      background: [
                        'linear-gradient(90deg, rgba(255,215,0,0.1) 0%, rgba(255,193,7,0.1) 100%)',
                        'linear-gradient(90deg, rgba(255,193,7,0.2) 0%, rgba(255,215,0,0.2) 100%)',
                        'linear-gradient(90deg, rgba(255,215,0,0.1) 0%, rgba(255,193,7,0.1) 100%)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Logo */}
                  <div className="relative z-10 w-24 h-16 md:w-32 md:h-20 flex items-center justify-center">
                    <img
                      src={
                        sponsor.logo_path?.startsWith('http')
                          ? sponsor.logo_path
                          : sponsor.logo_path?.startsWith('/uploads')
                            ? `${BASE}${sponsor.logo_path}`
                            : `${BASE}/uploads/sponsor-logos/${sponsor.logo_path?.replace(/^.*[\\\/]/, '')}`
                      }
                      alt={`${sponsor.name} logo`}
                      className="max-w-full max-h-full object-contain filter drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
                      style={{ 
                        background: 'white',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 215, 0, 0.2)'
                      }}
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/120x80?text=No+Logo';
                      }}
                    />
                  </div>

                  {/* Hover label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-400/30 whitespace-nowrap"
                  >
                    {sponsor.name}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Decoration line */}
          <motion.div
            className="mt-8 w-32 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent mx-auto"
            animate={{
              scaleX: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}