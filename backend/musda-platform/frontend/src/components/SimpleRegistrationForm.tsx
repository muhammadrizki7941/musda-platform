import React, { useState, useRef, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { QrCode, Mail, Phone, User, Building, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

type FormData = {
  nama: string;
  email: string;
  whatsapp: string;
  instansi: string;
};

type Guest = {
  id: number;
  nama: string;
  email: string;
  whatsapp: string;
  asal_instansi: string;
  verification_token: string;
};

type TicketData = {
  guest: Guest;
  qr: string;
};

export function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    email: '',
    whatsapp: '',
    instansi: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; whatsapp?: string }>({});
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Live validation
    if (field === 'email') {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      setFieldErrors(prev => ({
        ...prev,
        email: value && !emailRegex.test(value) ? 'Format email tidak valid' : undefined
      }));
    }
    
    if (field === 'whatsapp') {
      const phoneRegex = /^(\\+62|62|08|8)[0-9]{8,}$/;
      setFieldErrors(prev => ({
        ...prev,
        whatsapp: value && !phoneRegex.test(value) ? 'Format nomor WhatsApp tidak valid' : undefined
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowErrorModal(false);
    
    // Validasi field wajib
    if (!formData.nama.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      setErrorMsg('Semua field wajib diisi');
      setShowErrorModal(true);
      return;
    }
    
    // Validasi field errors
    if (fieldErrors.email || fieldErrors.whatsapp) {
      setErrorMsg('Mohon perbaiki data yang tidak valid');
      setShowErrorModal(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // Better error handling for JSON parsing
      let result;
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const text = await res.text();
        if (text.trim()) {
          try {
            result = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('Server returned invalid JSON');
          }
        } else {
          throw new Error('Server returned empty response');
        }
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      if (res.ok && result.id) {
        setTicketData({ 
          guest: result.guest, 
          qr: result.qr 
        });
        setShowTicket(true);
        
        // Reset form
        setFormData({
          nama: '',
          email: '',
          whatsapp: '',
          instansi: ''
        });
      } else {
        setErrorMsg(result.error || 'Gagal mendaftar.');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrorMsg(error.message || 'Terjadi kesalahan jaringan. Silakan coba lagi.');
      setShowErrorModal(true);
    }
    
    setLoading(false);
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        background: '#1f2937',
        // html2canvas type defs in this project don't include `scale`; cast to any to apply high-DPI rendering
        ...( { scale: 2 } as any )
      });
      
      const link = document.createElement('a');
      link.download = `e-ticket-${ticketData?.guest.nama.replace(/\\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (showTicket && ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full bg-gray-900/90 border-yellow-500/30 backdrop-blur-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
              <CheckCircle className="text-green-400" />
              E-Ticket MUSDA II
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div ref={ticketRef} className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-yellow-500/30">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white">{ticketData.guest.nama}</h3>
                <p className="text-gray-300">{ticketData.guest.asal_instansi}</p>
                <p className="text-gray-400 text-sm">{ticketData.guest.email}</p>
              </div>
              
              <div className="flex justify-center mb-4">
                <img src={ticketData.qr} alt="QR Code" className="w-32 h-32 bg-white p-2 rounded" />
              </div>
              
              <div className="text-center">
                <p className="text-yellow-400 font-semibold">HIMPERRA LAMPUNG</p>
                <p className="text-gray-300 text-sm">MUSDA II - 2025</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={downloadTicket}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                Download E-Ticket
              </Button>
              <Button 
                onClick={() => setShowTicket(false)}
                variant="outline"
                className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                Daftar Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 flex items-center justify-center">
      <Card className="max-w-lg w-full bg-gray-900/90 border-yellow-500/30 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
            <QrCode />
            Registrasi MUSDA II
          </CardTitle>
          <p className="text-gray-400">HIMPERRA LAMPUNG 2025</p>
        </CardHeader>
        
        <CardContent>
          {showErrorModal && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errorMsg}</p>
              <Button 
                onClick={() => setShowErrorModal(false)}
                className="mt-2 bg-red-600 hover:bg-red-700 text-xs"
              >
                Tutup
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="nama" className="text-gray-300 flex items-center gap-2">
                <User size={16} className="text-yellow-400" />
                Nama Lengkap *
              </Label>
              <Input
                id="nama"
                required
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                className="bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                <Mail size={16} className="text-yellow-400" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20 ${fieldErrors.email ? 'border-red-500' : ''}`}
                placeholder="email@example.com"
              />
              {fieldErrors.email && (
                <p className="text-red-400 text-sm">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="whatsapp" className="text-gray-300 flex items-center gap-2">
                <Phone size={16} className="text-yellow-400" />
                Nomor WhatsApp *
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                required
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className={`bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20 ${fieldErrors.whatsapp ? 'border-red-500' : ''}`}
                placeholder="0812XXXXXXX"
              />
              {fieldErrors.whatsapp && (
                <p className="text-red-400 text-sm">{fieldErrors.whatsapp}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="instansi" className="text-gray-300 flex items-center gap-2">
                <Building size={16} className="text-yellow-400" />
                Instansi/Perusahaan
              </Label>
              <Input
                id="instansi"
                value={formData.instansi}
                onChange={(e) => handleInputChange('instansi', e.target.value)}
                className="bg-gray-800/60 border-yellow-500/30 text-white focus:border-yellow-400 focus:ring-yellow-400/20"
                placeholder="Nama instansi (opsional)"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}