import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Trophy, Star, BookOpen, TrendingUp, DollarSign, Sparkles, Target, Award, Building, PieChart } from 'lucide-react';
import SekolahPropertiSlider from './SekolahPropertiSlider';
import SekolahPropertiForm from './SekolahPropertiForm';
import SekolahPropertiGallery from './SekolahPropertiGallery';
import PaymentModal from './PaymentModal';
import { SponsoredBySection } from './SponsoredBySection';
import PosterFlyerSection from './PosterFlyerSection';

// Komponen Countdown Timer untuk Sekolah Properti dengan MUSDA style
function PropertyCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 justify-center mt-8">
      {Object.entries(timeLeft).map(([key, value]) => (
        <motion.div 
          key={key} 
          className="text-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6 min-w-[90px] shadow-2xl"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)' }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))' }}
        >
          <div className="text-4xl font-bold text-yellow-300 mb-1">{value}</div>
          <div className="text-sm uppercase tracking-wide text-gray-300">{key}</div>
        </motion.div>
      ))}
    </div>
  );
}

interface Participant {
  id: number;
  paymentCode: string;
  status: string;
  amount: number;
  message: string;
  ticketUrl?: string;
}

const SekolahPropertiPage: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [participantData, setParticipantData] = useState<Participant | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'manual'>('manual');
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<any>({
    can_register: true,
    current_participants: 0,
    max_participants: 50,
    registration_open: true,
    quota_full: false,
    remaining_slots: 50
  });

  // Target date untuk countdown - dynamic dari API atau fallback
  const getTargetDate = () => {
    if (content.countdown_target_date) {
      const s = String(content.countdown_target_date).replace(' ', 'T');
      const d = new Date(s);
      return isNaN(d.getTime()) ? new Date('2025-11-15T08:00:00') : d;
    }
    return new Date('2025-11-15T08:00:00');
  };
  
  const targetDate = getTargetDate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch integrated content dengan settings
      const response = await fetch('/api/sph-settings/frontend-content');
      const data = await response.json();
      if (data.success) {
        setContent(data.data);
        if (data.data.registration_status) {
          setRegistrationStatus(data.data.registration_status);
        }
      } else {
        console.log('API returned non-success response, using fallback');
        setFallbackContent();
        await fetchRegistrationStatus();
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setFallbackContent();
      await fetchRegistrationStatus();
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch('/api/sph-settings/registration-status');
      const data = await response.json();
      if (data.success) {
        setRegistrationStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching registration status:', error);
    }
  };

  const setFallbackContent = () => {
    // Fallback to default content if API fails
    setContent({
      hero: {
        title: 'Sekolah Properti Himperra',
        subtitle: 'Membangun Masa Depan Properti Indonesia',
        description: 'Program pendidikan terdepan untuk mengembangkan pengetahuan dan keterampilan di bidang properti dengan standar internasional.',
        cta_text: 'Daftar Sekarang'
      },
      about: {
        title: 'Tentang Sekolah Properti',
        description: 'Sekolah Properti Himperra adalah institusi pendidikan yang fokus pada pengembangan SDM di bidang properti.',
        vision: 'Menjadi pusat pendidikan properti terdepan di Indonesia',
        mission: 'Menghasilkan profesional properti yang kompeten dan berintegritas'
      },
      features: {
        title: 'Keunggulan Program',
        feature_1_title: 'Kurikulum Terkini',
        feature_1_desc: 'Materi pembelajaran yang selalu update dengan trend industri',
        feature_2_title: 'Instruktur Berpengalaman',
        feature_2_desc: 'Diajar oleh praktisi dan akademisi berpengalaman',
        feature_3_title: 'Sertifikasi Resmi',
        feature_3_desc: 'Mendapat sertifikat yang diakui industri'
      },
      registration: {
        price: 2500000,
        early_bird_price: 2000000,
        show_early_bird: true,
        title: 'Pendaftaran',
        description: 'Bergabunglah dengan program Sekolah Properti dan kembangkan karier Anda di bidang properti'
      },
      settings: {
        is_registration_open: true,
        max_participants: 100
      }
    });
  };

  const handleRegistrationSuccess = (data: Participant, method: 'manual') => {
    setParticipantData(data);
    setPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setParticipantData(null);
  };

  // Dynamic benefits array dari API atau fallback
  const getBenefits = () => {
    const benefitsFromAPI = [];
    
    for (let i = 1; i <= 4; i++) {
      const titleKey = `benefit_${i}_title`;
      const descKey = `benefit_${i}_description`;
      
      if (content.features?.[titleKey] && content.features?.[descKey]) {
        let icon;
        switch(i) {
          case 1: icon = <Target className="w-8 h-8" />; break;
          case 2: icon = <PieChart className="w-8 h-8" />; break;
          case 3: icon = <DollarSign className="w-8 h-8" />; break;
          case 4: icon = <Building className="w-8 h-8" />; break;
          default: icon = <Target className="w-8 h-8" />;
        }
        
        benefitsFromAPI.push({
          icon,
          title: content.features[titleKey],
          description: content.features[descKey]
        });
      }
    }
    
    // Fallback to hardcoded benefits if API data not available
    if (benefitsFromAPI.length === 0) {
      return [
        {
          icon: <Target className="w-8 h-8" />,
          title: "Strategi Investasi Terpilih",
          description: "Pelajari teknik-teknik investasi properti yang terbukti menguntungkan dari para ahli berpengalaman."
        },
        {
          icon: <PieChart className="w-8 h-8" />,
          title: "Analisis Pasar Mendalam",
          description: "Dapatkan wawasan tentang tren pasar properti Lampung dan cara mengidentifikasi peluang terbaik."
        },
        {
          icon: <DollarSign className="w-8 h-8" />,
          title: "Simulasi Pembiayaan",
          description: "Pelajari skema pembiayaan KPR, perhitungan cash flow, dan strategi leverage yang optimal."
        },
        {
          icon: <Building className="w-8 h-8" />,
          title: "Study Kasus Nyata",
          description: "Analisis proyek-proyek properti sukses di Lampung dengan ROI tinggi dan risiko terukur."
        }
      ];
    }
    
    return benefitsFromAPI;
  };

  const benefits = getBenefits();

  // Helper function to get icon component from string name
  const getIconComponent = (iconName: string) => {
    const iconMap: any = {
      Users, Clock, Award, BookOpen, Trophy, Star, Target, Building, 
      TrendingUp, DollarSign, Sparkles, PieChart
    };
    return iconMap[iconName] || Users;
  };

  // Dynamic features array dari API atau fallback
  const getFeatures = () => {
    const features = [];
    
    for (let i = 1; i <= 4; i++) {
      const textKey = `feature_${i}_text`;
      const iconKey = `feature_${i}_icon`;
      
      if (content[textKey]) {
        const IconComponent = getIconComponent(content[iconKey] || 'Users');
        let featureText = content[textKey];
        
        // Update participant text with dynamic data
        if (i === 1 && featureText.includes('Peserta')) {
          featureText = `${registrationStatus.remaining_slots}+ Sisa Kuota`;
        }
        
        features.push({
          icon: <IconComponent className="w-6 h-6" />,
          text: featureText
        });
      }
    }
    
    // Fallback jika tidak ada data dari API
    if (features.length === 0) {
      return [
        { icon: <Users className="w-6 h-6" />, text: `${registrationStatus.remaining_slots}+ Sisa Kuota` },
        { icon: <Clock className="w-6 h-6" />, text: "6 Jam Intensif" },
        { icon: <Award className="w-6 h-6" />, text: "Sertifikat Resmi" },
        { icon: <BookOpen className="w-6 h-6" />, text: "Modul Lengkap" }
      ];
    }
    
    return features;
  };

  const features = getFeatures();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-yellow-300 text-lg">Memuat konten...</p>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Animated background particles */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
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

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gray-950/95 backdrop-blur-xl shadow-2xl border-b border-yellow-500/20 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => window.history.back()}
                className="text-yellow-400 hover:text-yellow-300 transition-colors p-2 rounded-lg hover:bg-yellow-400/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={24} />
              </motion.button>
              <div className="flex items-center gap-3">
                <img
                  src="/image/LOGO-SPH.png"
                  alt="Logo Sekolah Properti HIMPERRA"
                  className="w-16 h-16 rounded-lg shadow-lg border-2 border-yellow-400/50 bg-white/10 backdrop-blur-sm object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    (target as any).onerror = null;
                    target.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-yellow-200">
                    {content.hero?.title || 'Sekolah Properti Himperra Lampung'}
                  </h1>
                  <p className="text-yellow-100/40 text-sm">{content.hero?.subtitle || 'Investasi Cerdas untuk Masa Depan'}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-yellow-300"></p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section dengan Countdown */}
      <section className="py-16 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo SPH Besar di Hero Section */}
            <div className="lg-4 flex justify-center">
              <motion.img
                src="/images/LOGO-SPH.png"
                alt="Logo Sekolah Properti HIMPERRA"
                className="h-48 w-auto drop-shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  (target as any).onerror = null;
                  target.style.display = 'none';
                }}
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-400/50 rounded-full px-6 py-3 backdrop-blur-sm mb-8">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-semibold text-lg tracking-wide">
                Event Eksklusif by HIMPERRA Lampung
              </span>
            </div>


            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent leading-tight">
              {content.hero?.title || 'Sekolah Properti Himperra'}
            </h1>

            <p className="text-xl mb-8 max-w-4xl mx-auto text-gray-300 leading-relaxed">
              {content.hero?.description || 'Belajar strategi investasi properti yang menguntungkan dari para ahli dan praktisi berpengalaman. Wujudkan impian memiliki aset properti yang berkualitas dengan panduan yang tepat!'}
            </p>

            {/* Features Pills */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-yellow-400">{feature.icon}</div>
                  <span className="text-gray-300 text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-3xl font-semibold mb-6 text-yellow-300">
              {content.countdown_title || 'Acara Dimulai Dalam:'}
            </h3>
            {content.countdown_subtitle && (
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                {content.countdown_subtitle}
              </p>
            )}
            <PropertyCountdown targetDate={targetDate} />
          </motion.div>

          {/* Poster/Flyer Section */}
          <PosterFlyerSection />

          <motion.div 
            className="flex gap-6 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.a
              href={registrationStatus.can_register ? "#registration" : "#"}
              className={`font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-2xl ${
                registrationStatus.can_register 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 cursor-pointer'
                  : 'bg-gradient-to-r from-red-600/80 to-red-700/80 text-red-200 cursor-not-allowed border border-red-400/30'
              }`}
              whileHover={registrationStatus.can_register ? { 
                scale: 1.05,
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)'
              } : {}}
              whileTap={registrationStatus.can_register ? { scale: 0.95 } : {}}
              style={registrationStatus.can_register ? { filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.7))' } : {}}
            >
              {registrationStatus.can_register 
                ? (content.hero?.cta_text || 'Daftar Sekarang')
                : registrationStatus.quota_full 
                  ? 'Kuota Penuh' 
                  : 'Pendaftaran Ditutup'
              }
            </motion.a>
            <motion.a
              href="#about"
              className="border-2 border-yellow-400/50 hover:bg-yellow-400/10 hover:border-yellow-400 text-yellow-300 hover:text-yellow-200 font-bold py-4 px-10 rounded-xl transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pelajari Lebih Lanjut
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Sponsored By Section */}
      <SponsoredBySection />

      {/* Slider Banner */}
      <section className="py-8 bg-gray-900/50">
        <SekolahPropertiSlider />
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gradient-to-b from-gray-900 to-gray-950 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-400/50 rounded-full px-6 py-3 backdrop-blur-sm mb-8">
                <Building className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-semibold">Tentang Program</span>
              </div>
              
              <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-6">
                {content.about?.title || 'Tentang Sekolah Properti'}
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                {content.about?.description || 'Properti merupakan salah satu instrumen investasi paling stabil dengan potensi return yang menarik. Dapatkan panduan lengkap dari para ahli untuk memulai perjalanan investasi properti Anda.'}
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 hover:border-yellow-400/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)'
                  }}
                >
                  <div className="text-yellow-400 mb-4">{benefit.icon}</div>
                  <h3 className="text-2xl font-semibold text-yellow-300 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-6">
              Galeri Event Sebelumnya
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Lihat dokumentasi kegiatan Sekolah Properti HIMPERRA sebelumnya
            </p>
          </motion.div>
          <SekolahPropertiGallery />
        </div>
      </section>

      {/* Registration Section */}
      <section id="registration" className="py-16 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-6">
              {registrationStatus.can_register ? 'Daftar Sekarang' : 'Pendaftaran'}
            </h2>
            
            {/* Quota Status */}
            <div className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm border border-yellow-400/30 rounded-xl max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-300 font-semibold">Kuota Peserta:</span>
                <span className="text-white font-bold">
                  {registrationStatus.current_participants} / {registrationStatus.max_participants}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    registrationStatus.quota_full ? 'bg-red-500' : 
                    (registrationStatus.current_participants / registrationStatus.max_participants) > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((registrationStatus.current_participants / registrationStatus.max_participants) * 100, 100)}%` }}
                ></div>
              </div>
              <p className={`text-sm font-medium ${registrationStatus.quota_full ? 'text-red-400' : 'text-green-400'}`}>
                {registrationStatus.quota_full 
                  ? '⚠️ Kuota sudah penuh' 
                  : `✅ Tersisa ${registrationStatus.remaining_slots} slot`
                }
              </p>
            </div>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {registrationStatus.can_register 
                ? 'Jangan lewatkan kesempatan emas untuk mempelajari investasi properti dari para ahli!'
                : 'Maaf, pendaftaran sudah ditutup. Nantikan event selanjutnya!'
              }
            </p>
          </motion.div>
          
          <div className="max-w-2xl mx-auto">
            {registrationStatus.can_register ? (
              <SekolahPropertiForm onSuccess={handleRegistrationSuccess} />
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-sm border border-red-400/30 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold text-red-300 mb-4 drop-shadow-lg">
                  {registrationStatus.quota_full ? '🔥 Kuota Penuh' : '🚫 Pendaftaran Ditutup'}
                </h3>
                <p className="text-red-200/90 leading-relaxed">
                  {registrationStatus.quota_full 
                    ? '✨ Semua slot peserta sudah terisi. Terima kasih atas antusiasme Anda! Ikuti media sosial kami untuk update kegiatan selanjutnya.'
                    : '⏰ Pendaftaran untuk event ini telah ditutup oleh admin. Nantikan kesempatan berikutnya!'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && participantData && (
        <PaymentModal
          participant={participantData}
          paymentMethod={paymentMethod}
          onClose={handleClosePaymentModal}
        />
      )}
        </>
      )}
    </div>
  );
};

export default SekolahPropertiPage;