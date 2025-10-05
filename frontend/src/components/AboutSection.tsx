import React from 'react';
import { motion } from 'motion/react';
import { Building, Target, Lightbulb, Handshake, Crown, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function AboutSection() {
  const features = [
    {
      icon: Building,
      title: 'Hunian Berkelanjutan',
      description: 'Mewujudkan hunian yang ramah lingkungan, modern, dan adaptif terhadap perkembangan global',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Target,
      title: 'Pertumbuhan Ekonomi',
      description: 'Mendorong sektor perumahan sebagai penggerak industri turunan dan pencipta lapangan kerja',
      color: 'from-yellow-400 to-yellow-500'
    },
    {
      icon: Lightbulb,
      title: 'Solusi Inovatif',
      description: 'Merumuskan strategi untuk mengatasi backlog perumahan dan keterjangkauan hunian',
      color: 'from-yellow-600 to-yellow-700'
    },
    {
      icon: Handshake,
      title: 'Kolaborasi Strategis',
      description: 'Menguatkan sinergi antara pemerintah, perbankan, developer, dan masyarakat',
      color: 'from-yellow-300 to-yellow-400'
    }
  ];

  return (
  <section id="tentang" className="py-12 sm:py-24 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden px-4 sm:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
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
              filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
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
                TENTANG MUSDA II
              </span>
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-yellow-100 mb-8"
            animate={{
              textShadow: [
                '0 0 20px rgba(255, 215, 0, 0.3)',
                '0 0 40px rgba(255, 215, 0, 0.6)',
                '0 0 20px rgba(255, 215, 0, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Kolaborasi untuk <span className="text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text">Hunian Rakyat</span>
          </motion.h2>
          <motion.h3 
            className="text-3xl md:text-4xl font-bold text-yellow-200 mb-8"
          >
            Ekonomi Tumbuh, dan Masa Depan Berkelanjutan
          </motion.h3>
          <motion.p 
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            MUSDA II HIMPERRA Lampung hadir sebagai forum penting untuk memperkuat konsolidasi, 
            menyelaraskan strategi, dan melahirkan terobosan dalam pemenuhan kebutuhan hunian rakyat. 
            Acara ini mempertemukan pemerintah, perbankan, developer, dan masyarakat untuk membangun 
            masa depan perumahan yang inklusif dan berkelanjutan.
          </motion.p>
        </motion.div>

        {/* ... bagian selanjutnya (visi, misi, visual, fitur) tetap sama */}
        {/* cuma list misi aku ubah biar sesuai proposal */}
        {/* Visi */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -left-4 w-8 h-8 text-yellow-400"
              >
                <Crown />
              </motion.div>
              <h3 className="text-3xl font-bold text-yellow-300 mb-6 pl-12">Visi Kami</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Menjadi wadah kolaborasi strategis dalam mempercepat pemenuhan kebutuhan hunian rakyat, 
                mendorong pertumbuhan ekonomi daerah, dan menghadirkan perumahan berkelanjutan di Lampung.
              </p>
            </div>
            
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -left-4 w-8 h-8 text-yellow-400"
              >
                <Star />
              </motion.div>
              <h3 className="text-3xl font-bold text-yellow-300 mb-6 pl-12">Misi Kami</h3>
              <ul className="space-y-4 text-gray-300 text-lg">
                {[
                  'Membangun kolaborasi antara pemerintah, perbankan, developer, dan stakeholder',
                  'Mendorong pertumbuhan ekonomi melalui sektor perumahan rakyat',
                  'Merumuskan solusi inovatif untuk backlog dan keterjangkauan hunian',
                  'Mewujudkan perumahan berkelanjutan yang ramah lingkungan dan adaptif'
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start group"
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        boxShadow: '0 0 15px rgba(255, 215, 0, 0.8)',
                      }}
                      className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2 mr-4 flex-shrink-0"
                      style={{
                        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                      }}
                    />
                    <span className="group-hover:text-yellow-200 transition-colors duration-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
          {/* kanan visual hexagonal tetap sama */}
        </div>

        {/* Features grid tetap, hanya teks sudah disesuaikan di atas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -10, scale: 1.02 }}>
              <Card className="bg-gray-900/60 border-yellow-500/30 backdrop-blur-sm hover:bg-gray-800/60 hover:border-yellow-400/60 transition-all duration-500 h-full group relative overflow-hidden">
                <CardContent className="p-8 text-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative`}
                    style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }}
                  >
                    <feature.icon className="text-gray-900" size={32} />
                  </motion.div>
                  <h3 className="text-yellow-300 font-bold text-xl mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
