import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Building, MessageSquare, CreditCard, Smartphone, ArrowLeft, Home } from 'lucide-react';

interface FormData {
  nama: string;
  email: string;
  whatsapp: string;
  kategori: 'umum' | 'mahasiswa';
  asal_instansi: string;
  alasan_ikut: string;
  paymentMethod: 'manual';
}

interface PaymentSettings {
  general: number;
  student: number;
  qris_enabled: boolean;
  manual_enabled: boolean;
  is_free?: boolean;
}

interface BankInfo {
  bank_name: string;
  account_number: string;
  account_name: string;
  instructions: string;
  contact_admin: string;
}

interface FormData {
  nama: string;
  email: string;
  whatsapp: string;
  kategori: 'umum' | 'mahasiswa';
  asal_instansi: string;
  alasan_ikut: string;
  paymentMethod: 'manual';
}

interface Participant {
  id: number;
  paymentCode: string;
  status: string;
  amount: number;
  message: string;
  ticketUrl?: string;
}

interface Props {
  onSuccess: (participant: Participant, paymentMethod: 'manual') => void;
}

const SekolahPropertiForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    email: '',
    whatsapp: '',
    kategori: 'umum',
    asal_instansi: '',
    alasan_ikut: '',
    paymentMethod: 'manual'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    general: 150000,
    student: 100000,
    qris_enabled: true,
    manual_enabled: true,
    is_free: false
  });
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bank_name: 'Bank Mandiri',
    account_number: '1234567890',
    account_name: 'Himperra Lampung',
    instructions: 'Transfer ke rekening di atas dan konfirmasi pembayaran',
    contact_admin: '+62 812-3456-7890'
  });

  // Fetch payment settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const [pricingResponse, bankResponse] = await Promise.all([
          fetch('/api/sph-payment-settings/pricing'),
          fetch('/api/sph-payment-settings/bank-info')
        ]);

        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          if (pricingData.success) {
            setPaymentSettings(pricingData.data);
          }
        }

        if (bankResponse.ok) {
          const bankData = await bankResponse.json();
          if (bankData.success) {
            setBankInfo(bankData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      }
    };

    fetchPaymentSettings();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama lengkap wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Format nomor WhatsApp tidak valid';
    }

    // Optional validation - tidak wajib diisi
    if (formData.alasan_ikut.trim() && formData.alasan_ikut.trim().length < 20) {
      newErrors.alasan_ikut = 'Jika diisi, alasan minimal 20 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sph-participants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.nama,
          email: formData.email,
          phone: formData.whatsapp,
          institution: formData.asal_instansi,
          experience_level: formData.kategori === 'mahasiswa' ? 'pemula' : 'menengah',
          payment_method: 'manual'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess(result.data, 'manual');
      } else {
        alert(result.message || 'Terjadi kesalahan saat mendaftar');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getPricing = () => {
    if (paymentSettings.is_free) return 0;
    return formData.kategori === 'mahasiswa' ? paymentSettings.student : paymentSettings.general;
  };

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
      <motion.div 
        className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-4 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-yellow-300 hover:text-yellow-200 transition-colors duration-300 group"
            >
              <div className="bg-yellow-500/20 rounded-lg p-2 group-hover:bg-yellow-500/30 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Kembali ke MUSDA</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 rounded-lg p-2">
              <Home className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-yellow-300 font-medium text-sm">MUSDA II HIMPERRA</p>
              <p className="text-yellow-200/70 text-xs">Program Sekolah Properti</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Registration Form */}
      <motion.div 
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Lengkap */}
        <div>
          <label htmlFor="nama" className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-3">
            <User className="w-4 h-4" />
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${
              errors.nama ? 'border-red-500' : 'border-yellow-400/30'
            }`}
            placeholder="Masukkan nama lengkap Anda"
          />
          {errors.nama && <p className="text-red-400 text-sm mt-1">{errors.nama}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-3">
            <Mail className="w-4 h-4" />
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${
              errors.email ? 'border-red-500' : 'border-yellow-400/30'
            }`}
            placeholder="nama@email.com"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-3">
            <Phone className="w-4 h-4" />
            Nomor WhatsApp *
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${
              errors.whatsapp ? 'border-red-500' : 'border-yellow-400/30'
            }`}
            placeholder="08123456789"
          />
          {errors.whatsapp && <p className="text-red-400 text-sm mt-1">{errors.whatsapp}</p>}
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="kategori" className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-3">
            <Building className="w-4 h-4" />
            Kategori Peserta *
          </label>
          <select
            id="kategori"
            name="kategori"
            value={formData.kategori}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-900/50 border border-yellow-400/30 rounded-xl text-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
          >
            <option value="umum" className="bg-gray-900 text-gray-300">
              Umum - Rp {paymentSettings.general.toLocaleString('id-ID')}
            </option>
            <option value="mahasiswa" className="bg-gray-900 text-gray-300">
              Mahasiswa - Rp {paymentSettings.student.toLocaleString('id-ID')}
            </option>
          </select>
          <p className="text-sm text-gray-300 mt-1 opacity-90">
            {formData.kategori === 'mahasiswa' 
              ? '🎓 Khusus untuk mahasiswa aktif (dibutuhkan verifikasi)'
              : '👔 Untuk profesional, praktisi, dan masyarakat umum'
            }
          </p>
        </div>

        {/* Asal Instansi */}
        <div>
          <label htmlFor="asal_instansi" className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-3">
            <Building className="w-4 h-4" />
            Asal Instansi/Sekolah/Perguruan Tinggi *
          </label>
          <input
            type="text"
            id="asal_instansi"
            name="asal_instansi"
            value={formData.asal_instansi}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${
              errors.asal_instansi ? 'border-red-500' : 'border-yellow-400/30'
            }`}
            placeholder="Contoh: Universitas Lampung, PT. ABC, SMA Negeri 1, dll"
          />
          {errors.asal_instansi && <p className="text-red-400 text-sm mt-1">{errors.asal_instansi}</p>}
        </div>

        {/* Alasan Ikut */}
        <div>
          <label htmlFor="alasan_ikut" className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-3">
            <MessageSquare className="w-4 h-4" />
            Alasan Mengikuti Sekolah Properti HIMPERRA *
          </label>
          <textarea
            id="alasan_ikut"
            name="alasan_ikut"
            value={formData.alasan_ikut}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 ${
              errors.alasan_ikut ? 'border-red-500' : 'border-yellow-400/30'
            }`}
            placeholder="Ceritakan alasan Anda ingin mengikuti Sekolah Properti HIMPERRA. Misalnya: ingin belajar investasi properti, mengembangkan bisnis, dll. (minimal 20 karakter)"
          />
          {errors.alasan_ikut && <p className="text-red-400 text-sm mt-1">{errors.alasan_ikut}</p>}
          <p className="text-sm text-white mt-1">📝 {formData.alasan_ikut.length} karakter</p>
        </div>

        {/* Metode Pembayaran (Manual Only) */}
        {!paymentSettings.is_free && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-yellow-300 mb-4">
              <CreditCard className="w-4 h-4" />
              Metode Pembayaran
            </label>
            <div className="border rounded-xl p-4 border-yellow-400/30">
              <div className="text-yellow-300 font-medium">Transfer Manual - {bankInfo.bank_name}</div>
              <p className="text-sm text-white">🏦 {bankInfo.instructions}</p>
              <div className="mt-1 text-xs text-white">📱 Kontak: {bankInfo.contact_admin}</div>
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-400/50 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-yellow-300">Total Pembayaran</p>
              <p className="text-sm text-white">
                📊 Kategori: {formData.kategori === 'mahasiswa' ? 'Mahasiswa' : 'Umum'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-yellow-300">
                Rp {getPricing().toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
            loading
              ? 'bg-gray-700/80 cursor-not-allowed text-gray-300 border border-gray-600'
              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 shadow-2xl'
          }`}
          whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          style={!loading ? { filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))' } : {}}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300 mr-2"></div>
              Memproses...
            </div>
          ) : (
            paymentSettings.is_free
              ? 'Daftar Sekarang (Gratis)'
              : `Daftar Sekarang - Rp ${getPricing().toLocaleString('id-ID')}`
          )}
        </motion.button>

        <p className="text-sm text-white">
          📋 Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku.
        </p>
      </form>
      </motion.div>
    </div>
  );
};

export default SekolahPropertiForm;