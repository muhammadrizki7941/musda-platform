import React, { useEffect, useState, useRef } from 'react';
import { HeroCountdown } from './HeroCountdown';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ArrowRight, Calendar, MapPin, Users, Sparkles } from 'lucide-react';
import { apiCall } from '../config/api';

export function HeroSection() {
  const [targetDate, setTargetDate] = useState<string>("2025-12-31T09:00:00"); // Default date
  // showVideo true => show intro video, false => show polygon logo
  const [showVideo, setShowVideo] = useState(true);
  const cycleRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const data = await apiCall('/countdown');
        if (data && (data.target_date || data.targetDate)) {
          const td = data.target_date || data.targetDate;
          // Ensure it's in ISO format for CountdownTimer
          const normalized = typeof td === 'string' ? td.replace(' ', 'T') : td;
          setTargetDate(normalized);
        }
      } catch (err) {
        console.log('Countdown API not available, using default date');
        // Tetap menggunakan default date yang sudah di-set
      }
    };

    fetchCountdown();

    // 10.015s cycle toggle between video and logo
    const CYCLE_MS = 10015; // user requested 10 detik 15 ms
    // Start interval to toggle states
    cycleRef.current = window.setInterval(() => {
      setShowVideo(prev => {
        const next = !prev;
        if (next) {
          // restarting video when it becomes visible again
          requestAnimationFrame(() => {
            if (videoRef.current) {
              try {
                videoRef.current.currentTime = 0;
                const p = videoRef.current.play();
                if (p && typeof p.then === 'function') p.catch(() => {});
              } catch {}
            }
          });
        }
        return next;
      });
    }, CYCLE_MS);

    return () => {
      if (cycleRef.current) window.clearInterval(cycleRef.current);
    };
  }, []);

  return (
    <section id="beranda" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 sm:px-6 py-12 sm:py-20">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        {/* Golden particles */}
        {Array.from({ length: 50 }).map((_, i) => (
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
        
        {/* Geometric patterns */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 border border-yellow-500/20 opacity-30"
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
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-yellow-400/20 opacity-20"
          style={{
            clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
          }}
        />
      </div>

  <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* HIMPERRA Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-400/50 rounded-full px-8 py-3 backdrop-blur-sm relative mt-2">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.3)',
                    '0 0 40px rgba(255, 215, 0, 0.6)',
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
                HIIMPERRA LAMPUNG
              </span>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-yellow-100"
          >
            SELAMAT DATANG
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-8 text-yellow-200"
          >
            PESERTA MUSDA II
          </motion.h2>

          {/* Alternating Video / Polygon Logo */}
          <div className="mb-12 flex justify-center relative w-80 h-96 mx-auto">
            {/* Video Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showVideo ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ pointerEvents: 'none' }}
            >
              <video
                ref={videoRef}
                key={showVideo ? 'video-visible' : 'video-hidden'}
                className="w-full h-full object-cover rounded-xl shadow-2xl"
                style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }}
                autoPlay
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  // Ensure it starts at 0 every initial mount
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
              >
                <source src="/videos/intro.mp4" type="video/mp4" />
              </video>
            </motion.div>

            {/* Polygon Logo Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showVideo ? 0 : 1, scale: showVideo ? 0.95 : 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 50px rgba(255, 215, 0, 0.5)',
                    '0 0 100px rgba(255, 215, 0, 0.8)',
                    '0 0 50px rgba(255, 215, 0, 0.5)',
                  ],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 flex flex-col items-center justify-center text-gray-900 font-bold"
                style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }}
              >
                <img
                  src="/images/logo-elephant.png"
                  alt="Logo MUSDA"
                  className="w-32 h-32 object-contain mb-4 drop-shadow-lg rounded-xl"
                  draggable={false}
                />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center">
                  <h3 className="text-3xl font-bold mb-2">MUSDA II</h3>
                  <h4 className="text-xl font-semibold mb-1">HIMPERRA</h4>
                  <p className="text-lg font-medium">LAMPUNG 2025</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-8 flex justify-center">
            <HeroCountdown targetDate={targetDate} />
          </div>

          {/* Event Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
          >
            {[
              { icon: Calendar, label: 'Tanggal', value: '28-29 Okt 2025', color: 'from-yellow-400 to-yellow-500' },
              { icon: Users, label: 'Peserta', value: '150+', color: 'from-yellow-500 to-yellow-600' },
              { icon: MapPin, label: 'Lokasi', value: 'Emersia Hotel, Lampung', color: 'from-yellow-600 to-yellow-700' }
            ].map(({ icon: Icon, label, value, color }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <motion.div
                  whileHover={{
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
                  }}
                  className="bg-gray-900/80 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 group-hover:border-yellow-400/60 transition-all duration-300"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mx-auto mb-3`}
                  >
                    <Icon className="text-gray-900" size={24} />
                  </motion.div>
                  <h3 className="text-yellow-300 font-bold text-xl">{value}</h3>
                  <p className="text-gray-400">{label}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 px-12 py-6 text-xl font-bold shadow-2xl group relative overflow-hidden"
                onClick={() => document.getElementById('daftar')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255, 215, 0, 0.5)',
                      '0 0 40px rgba(255, 215, 0, 0.8)',
                      '0 0 20px rgba(255, 215, 0, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  
                  className="absolute inset-0 rounded-lg"
                />
                <span className="relative z-10">Pendaftaran</span>
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform relative z-10" size={24} />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 px-12 py-6 text-xl font-semibold backdrop-blur-sm"
                onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Lihat Agenda
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
