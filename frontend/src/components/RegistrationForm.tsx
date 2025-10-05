import React, { useState, useRef, FormEvent, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { QrCode, Mail, Phone, User, Building, MapPin, Briefcase, CheckCircle, ArrowLeft, Crown, Star, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';


type FormData = {
  nama: string;
  email: string;
  whatsapp: string;
  instansi: string;
  province?: string;
  kota?: string;
  kategori?: string;
};

type Guest = {
  id: number;
  nama: string;
  instansi: string;
  asal_instansi?: string;
  whatsapp: string;
  email: string;
  position: string;
  city: string;
  category: string;
  experience: string;
  expectations: string;
  booking_date: string;
  kota?: string;
  kategori?: string;
};

type TicketData = {
  guest: Guest;
  qr: string;
};

export function RegistrationForm() {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; whatsapp?: string }>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  // Fungsi kirim e-tiket ke email
  const handleSendEmail = async () => {
    if (!ticketData?.guest) return;
    setLoading(true);
    setSending(true);
    try {
      const res = await fetch(`/api/send-ticket/${ticketData.guest.id}`, {
        method: 'POST',
      });
      let result: any = null;
      try {
        result = await res.json();
      } catch {}
      if (res.ok && result && result.success) {
        setSuccessMessage('E-Tiket berhasil dikirim ke email Anda!');
        setShowSuccessPopup(true);
        setShowTicket(false);
      } else {
        setErrorMsg(result?.error || 'Gagal mengirim e-tiket ke email.');
        setShowErrorModal(true);
      }
    } catch (e: any) {
      setErrorMsg('Terjadi error saat mengirim e-tiket: ' + (e.message || 'Network error'));
      setShowErrorModal(true);
    }
    setLoading(false);
    setSending(false);
  };
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    whatsapp: '',
    instansi: '',
    province: '',
    kota: '',
    kategori: ''
  });
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [registrationDateStr, setRegistrationDateStr] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowErrorModal(false);
    
    // Validasi field wajib yang sesuai dengan database
    if (!formData.nama.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      setErrorMsg('Nama, email, dan WhatsApp wajib diisi');
      setShowErrorModal(true);
      return;
    }
    
    setLoading(true);
    try {
      // Kirim data ke backend - hanya field yang ada di database
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          email: formData.email,
          whatsapp: formData.whatsapp,
          instansi: formData.instansi || 'Tidak disebutkan',
          kota: formData.kota || undefined,
          kategori: formData.kategori || undefined
        })
      });
      
      // Check if response has content before parsing JSON
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await res.text();
        if (text) {
          try {
            result = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'Response text:', text);
            throw new Error('Server returned invalid JSON');
          }
        } else {
          throw new Error('Empty response from server');
        }
      } else {
        const errorText = await res.text();
        console.error('Non-JSON response:', errorText);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      if (res.ok && result.id) {
        // Set ticket data dari response registrasi
        setTicketData({ 
          guest: result.guest, 
          qr: result.qr 
        });
        // Capture waktu daftar pada saat sukses
        try {
          const ts = result?.guest?.created_at ? new Date(result.guest.created_at) : new Date();
          // Tampilkan format lokal Indonesia lengkap (tanggal + jam) dari server
          setRegistrationDateStr(ts.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }));
        } catch {
          setRegistrationDateStr('');
        }
        setShowTicket(true);
        setSuccessMessage('Registrasi berhasil! E-ticket telah dibuat.');
        setShowSuccessPopup(true);
      } else {
        setErrorMsg(result.error || 'Gagal mendaftar.');
        // Tampilkan alert inline merah yang jelas jika sudah terdaftar
        if (result.error && /sudah terdaftar|kehilangan tiket/i.test(result.error)) {
          setShowErrorModal(true);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrorMsg(error.message || 'Terjadi kesalahan jaringan. Silakan coba lagi.');
      setShowErrorModal(true);
    }
    setLoading(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Live validation
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setFieldErrors(prev => ({
        ...prev,
        email: value && !emailRegex.test(value)
          ? 'Format email tidak valid'
          : undefined
      }));
    }
    if (field === 'whatsapp') {
      // Validasi nomor HP Indonesia (mulai 08, 628, 62, 8, dan panjang minimal 10 digit)
      const phoneRegex = /^(\+62|62|08|8)[0-9]{8,}$/;
      setFieldErrors(prev => ({
        ...prev,
        whatsapp: value && !phoneRegex.test(value)
          ? 'Format nomor HP tidak valid'
          : undefined
      }));
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Load provinces at mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/locations/provinces');
        const data = await res.json();
        if (Array.isArray(data.provinces)) setProvinces(data.provinces);
      } catch {}
    })();
  }, []);

  // When province changes, load cities
  useEffect(() => {
    (async () => {
      if (!formData.province) { setCities([]); return; }
      try {
        const res = await fetch(`/api/locations/cities?province=${encodeURIComponent(formData.province)}`);
        const data = await res.json();
        if (Array.isArray(data.cities)) setCities(data.cities);
      } catch {
        setCities([]);
      }
    })();
  }, [formData.province]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.nama && formData.email && formData.whatsapp;
      case 2:
        return formData.instansi;
      default:
        return false;
    }
  };

  const handleDownload = async () => {
    // replaced by handleScreenshot
  };

  const handleScreenshot = async () => {
    if (ticketRef.current) {
      // Ensure the ticket is fully visible and rendered
      ticketRef.current.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 500));
      // Use a white background for best contrast
      const canvas = await html2canvas(ticketRef.current, {
        background: '#fff',
        useCORS: true
      });
      // Convert to JPEG for compatibility
      const image = canvas.toDataURL('image/jpeg', 0.98);
      // Create a download link and trigger
      const link = document.createElement('a');
      link.download = 'e-tiket-musda.jpg';
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (showTicket && ticketData) {
    const { guest, qr } = ticketData;
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 py-20 flex items-center justify-center relative overflow-hidden">
        {sending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-yellow-500/40 rounded-lg p-6 text-center max-w-sm">
              <div className="animate-spin h-8 w-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
              <div className="text-yellow-300 font-semibold">Mengirim E‑Tiket…</div>
              <div className="text-gray-300 text-sm mt-2">Mohon tunggu sejenak dan jangan tutup halaman ini<br/>hingga e‑tiket berhasil dikirim.</div>
            </div>
          </div>
        )}
        {/* Background particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={`bg-particle-${i}`}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5],
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

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.5, type: "spring", stiffness: 100 }}
          className="max-w-lg mx-auto relative z-10"
        >
          <div ref={ticketRef}>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-yellow-500 shadow-2xl relative overflow-hidden">
              {/* Golden glow effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 50px rgba(255, 215, 0, 0.5)',
                    '0 0 100px rgba(255, 215, 0, 0.8)',
                    '0 0 50px rgba(255, 215, 0, 0.5)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0"
              />
              
              {/* Animated sparkles */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.5, 1.2, 0.5],
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
                    filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 1))',
                  }}
                />
              ))}

              <CardHeader className="text-center pb-6 relative z-10">
                {/* Logo MUSDA */}
                <div className="flex justify-center mb-4">
                  <img src="/images/logo-musda.png" alt="Logo MUSDA" style={{ height: 56 }} />
                </div>
                {/* QR Unik tamu, besar, tanpa poligon */}
                <div className="flex justify-center mb-6">
                  <img src={qr} alt="QR Tamu" style={{ width: 180, height: 180, background: '#fff', borderRadius: 16, boxShadow: '0 0 24px #fbbf24' }} />
                </div>
                <CardTitle className="text-yellow-400 text-2xl mb-3 font-bold">
                  E-Ticket MUSDA II
                </CardTitle>
                <p className="text-yellow-300 font-semibold text-lg">HIMPERRA Lampung 2024</p>
                <motion.p 
                  className="text-gray-400 text-sm mt-2"
                  animate={{
                    color: ['#9ca3af', '#fbbf24', '#9ca3af'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  Tiket Resmi - Jangan Hilangkan
                </motion.p>
              </CardHeader>
              
              <CardContent className="text-center space-y-6 relative z-10">
                {/* Participant info with hexagonal container */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-500/50 p-8 relative overflow-hidden"
                  style={{
                    clipPath: 'polygon(10% 6.7%, 90% 6.7%, 100% 25%, 100% 75%, 90% 93.3%, 10% 93.3%, 0% 75%, 0% 25%)',
                  }}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={`pattern-${i}`}
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 10 + i,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.5,
                        }}
                        className="absolute w-3 h-3 border border-yellow-400"
                        style={{
                          left: `${15 + (i % 4) * 20}%`,
                          top: `${20 + Math.floor(i / 4) * 20}%`,
                          clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="mb-4"
                    >
                      <Crown className="text-yellow-400 mx-auto mb-3" size={32} />
                    </motion.div>
                    
                    <h3 className="text-yellow-100 font-bold text-xl mb-2">{guest.nama}</h3>
                    <p className="text-yellow-300 font-semibold text-lg mb-1">{guest.instansi || guest.asal_instansi}</p>
                    
                    <div className="border-t-2 border-yellow-500/30 border-dashed my-4 pt-4">
                      <p className="text-gray-400 text-sm mb-1">{guest.email}</p>
                      <p className="text-gray-400 text-sm">{guest.whatsapp}</p>
                      <p className="text-gray-400 text-sm mt-2">Tanggal Daftar: {registrationDateStr || '—'}</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Additional info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
                    <p className="text-yellow-400 font-semibold mb-1">Kategori</p>
                    <p className="text-gray-300">{ticketData?.guest?.kategori || '-'}</p>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
                    <p className="text-yellow-400 font-semibold mb-1">Kota</p>
                    <p className="text-gray-300">{ticketData?.guest?.kota || '-'}</p>
                  </div>
                </div>
                
                {/* Status */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 20px rgba(34, 197, 94, 0.5)',
                      '0 0 40px rgba(34, 197, 94, 0.8)',
                      '0 0 20px rgba(34, 197, 94, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="flex items-center justify-center gap-3 text-green-400 font-bold border-t-2 border-yellow-500/30 border-dashed pt-6"
                >
                  <CheckCircle size={24} />
                  <span className="text-lg">Registrasi Berhasil</span>
                </motion.div>
                
                {/* Action buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={() => setShowTicket(false)}
                      variant="outline"
                      className="w-full border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Kembali
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleSendEmail}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold"
                    >
                      Kirim E-Tiket ke Email
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSendTicketUlang = async () => {
    setLoading(true);
    setSending(true);
    try {
      // Cari id tamu berdasarkan email/whatsapp
      const res = await fetch(`/api/guests?email=${encodeURIComponent(formData.email)}&whatsapp=${encodeURIComponent(formData.whatsapp)}`);
      const data = await res.json();
      if (data.id) {
        const sendRes = await fetch(`/api/send-ticket/${data.id}`, { method: 'POST' });
        let result: any = null;
        try {
          result = await sendRes.json();
        } catch {}
        if (sendRes.ok && result && result.success) {
          setSuccessMessage('E-Tiket berhasil dikirim ulang ke email Anda!');
          setShowSuccessPopup(true);
        } else {
          setErrorMsg(result?.error || 'Gagal mengirim ulang e-tiket.');
          setShowErrorModal(true);
        }
      } else {
        setErrorMsg('Data tamu tidak ditemukan.');
        setShowErrorModal(true);
      }
    } catch (e) {
      setErrorMsg('Terjadi error saat mengirim ulang e-tiket: ' + (e instanceof Error ? e.message : 'Network error'));
      setShowErrorModal(true);
    }
    setLoading(false);
    setSending(false);
  };

  return (
    <>
      {sending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-yellow-500/40 rounded-lg p-6 text-center max-w-sm">
            <div className="animate-spin h-8 w-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
            <div className="text-yellow-300 font-semibold">Mengirim E‑Tiket…</div>
            <div className="text-gray-300 text-sm mt-2">Mohon tunggu sejenak dan jangan tutup halaman ini<br/>hingga e‑tiket berhasil dikirim.</div>
          </div>
        </div>
      )}
      {/* Custom Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-green-600 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              className="bg-green-500 rounded-full p-4 mb-4 shadow-lg"
            >
              <CheckCircle size={48} className="text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">E-Tiket Berhasil Dikirim!</h2>
            <p className="text-white text-lg mb-4">{successMessage}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 px-6 py-2 bg-green-500 text-white rounded-lg font-bold shadow hover:bg-green-700 transition"
              onClick={() => setShowSuccessPopup(false)}
            >
              Tutup
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Modal Error Elegan */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative animate-fadeIn mt-8">
            {/* Icon email melayang di atas modal */}
            <div style={{ position: 'absolute', top: '-38px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
              <div className="bg-white rounded-full p-3 shadow-lg flex items-center justify-center" style={{ border: '3px solid #FFD700' }}>
                <Mail className="text-yellow-500" size={28} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 mt-8">Pendaftaran Gagal</h2>
            <p className="text-white text-lg mb-6">{errorMsg}</p>
            <Button
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-lg shadow-lg mb-4"
              onClick={handleSendTicketUlang}
            >
              Kirim Ulang E-Tiket
            </Button>
            <a
              href="https://wa.me/628978900708?text=Halo%20HIMPERRA%2C%20saya%20butuh%20bantuan%20terkait%20E-Tiket%20MUSDA%20Lampung."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg mb-2 transition-all"
            >
              <Phone className="text-white" size={20} />
              WhatsApp Bantuan HIMPERRA
            </a>
            <div className="text-gray-400 text-sm mt-2">Pusat Bantuan: 0897-8900-708</div>
            <button
              className="absolute top-3 right-3 text-yellow-400 hover:text-yellow-300 text-xl font-bold"
              onClick={() => setShowErrorModal(false)}
              aria-label="Tutup"
            >×</button>
          </div>
        </div>
      )}
      <section id="daftar" className="py-24 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={`bg-decor-${i}`}
              animate={{
                y: [0, -25, 0],
                opacity: [0.1, 0.4, 0.1],
                scale: [0.5, 1, 0.5],
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
                filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))',
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
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
                PENDAFTARAN
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
            Pendaftaran Tamu dan Peserta <span className="text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text">Musda II Himperra Lampung</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Silahkan isi formulir pendaftaran di bawah ini untuk mendapatkan E-tiket tamu atau peserta dalam acara Musda II Himperra Lampung 2025. Pastikan data yang Anda masukkan sudah benar sebelum mengirimkan formulir.
          </motion.p>
        </motion.div>

        {/* Progress indicator with hexagonal design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <div className="flex items-center space-x-6">
            {[1, 2].map((step, idx) => (
              <React.Fragment key={`progress-step-${step}`}>
                <motion.div
                  key={`progress-circle-${step}`}
                  animate={{
                    scale: currentStep === step ? 1.2 : 1,
                    boxShadow: currentStep >= step 
                      ? [
                          '0 0 20px rgba(255, 215, 0, 0.5)',
                          '0 0 40px rgba(255, 215, 0, 0.8)',
                          '0 0 20px rgba(255, 215, 0, 0.5)',
                        ]
                      : '0 0 0px rgba(255, 215, 0, 0)',
                  }}
                  transition={{
                    scale: { duration: 0.3 },
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                  className={`w-14 h-14 flex items-center justify-center text-white font-bold border-2 transition-all duration-300 ${
                    currentStep >= step 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400' 
                      : 'bg-gray-800 border-gray-600'
                  }`}
                  style={{
                    clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                  }}
                >
                  {currentStep > step ? <CheckCircle size={24} /> : step}
                </motion.div>
                {step < 3 && (
                  <div
                    key={`progress-bar-${step}`}
                    className={`w-16 h-1 transition-all duration-500 ${
                      currentStep > step 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg' 
                        : 'bg-gray-700'
                    }`}
                    style={{
                      filter: currentStep > step ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' : 'none',
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Form with enhanced design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gray-900/80 border-2 border-yellow-500/50 backdrop-blur-lg shadow-2xl relative overflow-hidden">
            {/* Animated background glow */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                  'radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                  'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-yellow-100 text-center flex items-center justify-center gap-4 text-2xl">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                  }}
                >
                  <User className="text-gray-900" size={20} />
                </motion.div>
                <span>
                  {currentStep === 1 && 'Informasi Personal'}
                  {currentStep === 2 && 'Informasi Profesional'}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {errorMsg && (
                  <div className="bg-red-900/80 border border-red-500 text-red-200 rounded-lg px-6 py-4 text-center font-semibold mb-4 animate-pulse">
                    {errorMsg}
                  </div>
                )}
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-8"
                  >
                    <div className="space-y-3">
                      <Label htmlFor="nama" className="text-gray-300 flex items-center gap-3 text-lg">
                        <User size={20} className="text-yellow-400" />
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="nama"
                        required
                        value={formData.nama}
                        onChange={(e) => handleInputChange('nama', e.target.value)}
                        className="bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20 h-14 text-lg backdrop-blur-sm"
                        placeholder="Masukkan nama lengkap Anda"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-gray-300 flex items-center gap-3 text-lg">
                          <Mail size={20} className="text-yellow-400" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20 h-14 text-lg backdrop-blur-sm ${fieldErrors.email ? 'border-red-500' : ''}`}
                          placeholder="email@example.com"
                        />
                        {fieldErrors.email && (
                          <div style={{color: '#ef4444'}} className="text-red-500 text-sm mt-1 text-left font-semibold">{fieldErrors.email}</div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="whatsapp" className="text-gray-300 flex items-center gap-3 text-lg">
                          <Phone size={20} className="text-yellow-400" />
                          Nomor WhatsApp *
                        </Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          required
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                          className={`bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20 h-14 text-lg backdrop-blur-sm ${fieldErrors.whatsapp ? 'border-red-500' : ''}`}
                          placeholder="0812XXXXXXX"
                        />
                        {fieldErrors.whatsapp && (
                          <div style={{color: '#ef4444'}} className="text-red-500 text-sm mt-1 text-left font-semibold">{fieldErrors.whatsapp}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Professional Information */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-center">
                      <div className="w-full max-w-2xl space-y-8">
                        <Label htmlFor="instansi" className="text-gray-300 flex items-center gap-3 text-lg">
                          <Building size={20} className="text-yellow-400" />
                          Instansi/Perusahaan *
                        </Label>
                        <Input
                          id="instansi"
                          required
                          value={formData.instansi}
                          onChange={(e) => handleInputChange('instansi', e.target.value)}
                          className="bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20 h-14 text-lg backdrop-blur-sm"
                          placeholder="Nama instansi atau perusahaan"
                        />

                        {/* Kategori & Lokasi */}
                        <div className="grid md:grid-cols-2 gap-8 pt-2">
                          {/* Kategori (pakai Select sederhana) */}
                          <div className="space-y-3 relative">
                            <Label htmlFor="kategori" className="text-gray-300 flex items-center gap-3 text-lg">
                              <Briefcase size={20} className="text-yellow-400" />
                              Kategori (opsional)
                            </Label>
                            <Select value={formData.kategori} onValueChange={(v: string) => handleInputChange('kategori', v)}>
                              <SelectTrigger className="bg-gray-800/60 border-yellow-500/30 h-14 text-lg text-white">
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-yellow-500/30 text-white">
                                <SelectItem value="asosiasi">Asosiasi</SelectItem>
                                <SelectItem value="perusahaan">Perusahaan</SelectItem>
                                <SelectItem value="pemerintah">Pemerintah</SelectItem>
                                <SelectItem value="komunitas">Komunitas</SelectItem>
                                <SelectItem value="umum">Umum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Provinsi (autocomplete) */}
                          <ProvinceAutocomplete
                            provinces={provinces}
                            value={formData.province || ''}
                            onChange={(province) => {
                              setFormData(prev => ({ ...prev, province, kota: '' }));
                            }}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Kota (autocomplete) */}
                          <CityAutocomplete
                            cities={cities}
                            disabled={!formData.province}
                            value={formData.kota || ''}
                            onChange={(kota) => handleInputChange('kota', kota)}
                            placeholder={formData.province ? 'Ketik nama kota…' : 'Pilih provinsi dulu'}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between pt-8 border-t border-yellow-500/30">
                  <motion.div
                    whileHover={{ scale: currentStep === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentStep === 1 ? 1 : 0.95 }}
                  >
                    <Button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      variant="outline"
                      className="border-2 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 px-8 py-3 text-lg"
                    >
                      <ArrowLeft size={20} className="mr-2" />
                      Sebelumnya
                    </Button>
                  </motion.div>

                  {currentStep < 2 ? (
                    <motion.div
                      whileHover={{ scale: isStepValid(currentStep) ? 1.05 : 1 }}
                      whileTap={{ scale: isStepValid(currentStep) ? 0.95 : 1 }}
                    >
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!isStepValid(currentStep)}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 disabled:opacity-50 px-8 py-3 text-lg font-bold"
                      >
                        Selanjutnya
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="ml-2"
                        >
                          →
                        </motion.div>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      whileHover={{ scale: isStepValid(currentStep) ? 1.05 : 1 }} 
                      whileTap={{ scale: isStepValid(currentStep) ? 0.95 : 1 }}
                    >
                      <Button
                        type="submit"
                        disabled={!isStepValid(currentStep)}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 px-12 py-3 text-lg font-bold disabled:opacity-50 relative overflow-hidden"
                      >
                        <motion.div
                          animate={{
                            background: [
                              'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                              'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 80%, transparent 130%)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="absolute inset-0"
                        />
                        <span className="relative z-10 flex items-center">
                          <CheckCircle size={20} className="mr-2" />
                          Daftar Sekarang
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </section>
    </>
  );
}

// --- Searchable Autocomplete Inputs (Dark Theme) ---
function ProvinceAutocomplete({ provinces, value, onChange }: { provinces: string[]; value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Filtered list (memoized)
  const list = useMemo(() => provinces.filter(p => p.toLowerCase().includes(query.toLowerCase())), [provinces, query]);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const highlight = (text: string, q: string) => {
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1 || !q) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, i)}
        <span style={{ background: 'rgba(250, 204, 21, 0.25)', color: '#fde68a' }}>{text.slice(i, i + q.length)}</span>
        {text.slice(i + q.length)}
      </span>
    );
  };

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <Label className="text-gray-300 flex items-center gap-3 text-lg">
        <MapPin size={20} className="text-yellow-400" />
        Provinsi
      </Label>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHoverIndex(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { setOpen(true); return; }
          if (e.key === 'ArrowDown') { setHoverIndex(prev => Math.min(prev + 1, list.length - 1)); e.preventDefault(); }
          if (e.key === 'ArrowUp') { setHoverIndex(prev => Math.max(prev - 1, 0)); e.preventDefault(); }
          if (e.key === 'Enter') {
            if (hoverIndex >= 0 && list[hoverIndex]) { onChange(list[hoverIndex]); setQuery(list[hoverIndex]); setOpen(false); }
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Ketik nama provinsi…"
        className="w-full h-14 px-4 rounded-md bg-gray-800/60 border border-yellow-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
      />
      {open && list.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full max-h-56 overflow-auto bg-gray-900 border border-yellow-500/30 rounded-md shadow-lg text-white">
          {list.map((p, idx) => (
            <li
              key={p}
              className={`px-4 py-2 cursor-pointer ${idx === hoverIndex ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(p); setQuery(p); setOpen(false); }}
            >
              {highlight(p, query)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CityAutocomplete({ cities, value, onChange, disabled, placeholder }: { cities: string[]; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(value || ''); }, [value]);
  const list = useMemo(() => (cities || []).filter(c => c.toLowerCase().includes(query.toLowerCase())), [cities, query]);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);
  const highlight = (text: string, q: string) => {
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1 || !q) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, i)}
        <span style={{ background: 'rgba(250, 204, 21, 0.25)', color: '#fde68a' }}>{text.slice(i, i + q.length)}</span>
        {text.slice(i + q.length)}
      </span>
    );
  };
  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <Label className="text-gray-300 flex items-center gap-3 text-lg">
        <MapPin size={20} className="text-yellow-400" />
        Kota
      </Label>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHoverIndex(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { setOpen(true); return; }
          if (e.key === 'ArrowDown') { setHoverIndex(prev => Math.min(prev + 1, list.length - 1)); e.preventDefault(); }
          if (e.key === 'ArrowUp') { setHoverIndex(prev => Math.max(prev - 1, 0)); e.preventDefault(); }
          if (e.key === 'Enter') {
            if (hoverIndex >= 0 && list[hoverIndex]) { onChange(list[hoverIndex]); setQuery(list[hoverIndex]); setOpen(false); }
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        disabled={disabled}
        placeholder={placeholder || 'Ketik nama kota…'}
        className={`w-full h-14 px-4 rounded-md ${disabled ? 'opacity-60' : ''} bg-gray-800/60 border border-yellow-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400`}
      />
      {open && !disabled && list.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full max-h-56 overflow-auto bg-gray-900 border border-yellow-500/30 rounded-md shadow-lg text-white">
          {list.map((c, idx) => (
            <li
              key={c}
              className={`px-4 py-2 cursor-pointer ${idx === hoverIndex ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(c); setQuery(c); setOpen(false); }}
            >
              {highlight(c, query)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}