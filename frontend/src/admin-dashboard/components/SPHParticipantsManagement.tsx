  // WhatsApp share only (admin will attach e-ticket manually)
  const handleSendWhatsApp = async (participant: SPHParticipant) => {
    try {
      // Normalize phone to Indonesian format for wa.me
      const raw = (participant.phone || '').trim();
      let phone = raw.replace(/[^0-9+]/g, '');
      if (phone.startsWith('+62')) phone = phone.slice(1); // +62 -> 62
      else if (phone.startsWith('0')) phone = '62' + phone.slice(1);
      // Build message caption
      const lines = [
        `Halo ${participant.full_name},`,
        '',
        'E-ticket SPH 2025 Anda sudah tersedia ✅',
        'Silakan cek pesan ini. Panitia akan melampirkan e-ticket (PDF/PNG) pada chat ini.',
        '',
        `Nama: ${participant.full_name}`,
        `Email: ${participant.email}`,
        `Instansi: ${participant.institution || '-'}`,
        '',
        'Mohon simpan e-ticket dan tunjukkan QR saat check-in. Terima kasih.'
      ];
      const message = lines.join('\n');
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    } catch (err) {
      alert('Gagal membuka WhatsApp.');
    }
  };
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { apiCall, getApiUrl } from '../../config/api';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Check, 
  X, 
  Eye, 
  Calendar,
  Phone,
  School,
  CreditCard,
  RefreshCw,
  UserCheck,
  Send,
  Trash2
} from 'lucide-react';

interface SPHParticipant {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  institution: string;
  experience_level: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_method: 'qris' | 'manual';
  payment_code: string;
  registration_date: string;
  payment_date: string | null;
  qr_code_path: string | null;
  notes: string | null;
  attendance_status?: 'hadir' | 'belum_hadir';
}

export function SPHParticipantsManagement() {
  const [participants, setParticipants] = useState<SPHParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<SPHParticipant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || '';
      const data = await apiCall('/sph-participants', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      if (data.success) {
        setParticipants(data.data);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPayment = async (participantId: number) => {
    try {
      const response = await fetch(getApiUrl(`/sph-participants/${participantId}/accept-payment`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Pembayaran berhasil diterima dan e-ticket telah dikirim!');
        fetchParticipants(); // Refresh data
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error accepting payment:', error);
      alert('Error accepting payment');
    }
  };

  const handleRejectPayment = async (participantId: number) => {
    try {
      const response = await fetch(getApiUrl(`/sph-participants/${participantId}/reject-payment`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Pembayaran ditolak');
        fetchParticipants(); // Refresh data
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Error rejecting payment');
    }
  };

  const handleSendTicket = async (participantId: number) => {
    try {
      const response = await fetch(getApiUrl(`/sph-participants/${participantId}/send-ticket`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        alert('E-ticket berhasil dikirim ulang!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending ticket:', error);
      alert('Error sending ticket');
    }
  };

  const handleDownloadQRTemplate = async (participantId: number, participantName: string) => {
    try {
      const response = await fetch(getApiUrl(`/sph-participants/${participantId}/download-qr-template`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SPH_QR_Template_${participantName}_${participantId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        alert('QR Template berhasil didownload!');
      } else {
        const data = await response.json();
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error downloading QR template:', error);
      alert('Error downloading QR template');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/sph-participants/export/csv'), {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sph_participants_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error exporting data');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data');
    }
  };

  const handleDeleteParticipant = async (participantId: number, participantName: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus peserta "${participantName}"? Tindakan ini tidak dapat dibatalkan.`);
    
    if (!confirmDelete) return;

    try {
      console.log(`Attempting to delete participant ${participantId}...`);
      
      const response = await fetch(getApiUrl(`/sph-participants/${participantId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
        }
      });
      
      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', response.headers.get('content-type'));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', await response.text());
        alert('Error: Server tidak memberikan response yang valid');
        return;
      }
      
      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (data.success) {
        alert('Peserta berhasil dihapus');
        fetchParticipants(); // Refresh data
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Error deleting participant: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || participant.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-200 transform hover:scale-105">
            <span className="flex items-center gap-1">
              ✅ <span className="font-medium">Lunas</span>
            </span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 transform hover:scale-105 animate-pulse">
            <span className="flex items-center gap-1">
              ⏳ <span className="font-medium">Pending</span>
            </span>
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105">
            <span className="flex items-center gap-1">
              ❌ <span className="font-medium">Dibatalkan</span>
            </span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg">
            <span className="font-medium">{status}</span>
          </Badge>
        );
    }
  };

  const getExperienceBadge = (level: string) => {
    const badgeConfigs = {
      pemula: {
        gradient: 'from-blue-500 to-cyan-500',
        hoverGradient: 'hover:from-blue-600 hover:to-cyan-600',
        shadowColor: 'hover:shadow-blue-500/25',
        icon: '🌱',
        label: 'Pemula'
      },
      menengah: {
        gradient: 'from-orange-500 to-amber-500',
        hoverGradient: 'hover:from-orange-600 hover:to-amber-600',
        shadowColor: 'hover:shadow-orange-500/25',
        icon: '⚡',
        label: 'Menengah'
      },
      lanjutan: {
        gradient: 'from-purple-500 to-pink-500',
        hoverGradient: 'hover:from-purple-600 hover:to-pink-600',
        shadowColor: 'hover:shadow-purple-500/25',
        icon: '🚀',
        label: 'Lanjutan'
      }
    };
    
    const config = badgeConfigs[level as keyof typeof badgeConfigs] || {
      gradient: 'from-gray-500 to-gray-600',
      hoverGradient: 'hover:from-gray-600 hover:to-gray-700',
      shadowColor: 'hover:shadow-gray-500/25',
      icon: '📚',
      label: level
    };
    
    return (
      <Badge className={`bg-gradient-to-r ${config.gradient} ${config.hoverGradient} text-white border-0 shadow-lg ${config.shadowColor} transition-all duration-200 transform hover:scale-105`}>
        <span className="flex items-center gap-1">
          {config.icon} <span className="font-medium">{config.label}</span>
        </span>
      </Badge>
    );
  };

  const getAttendanceBadge = (participant: SPHParticipant) => {
    const status = participant.attendance_status || (participant.notes && participant.notes.includes('[CHECK-IN]') ? 'hadir' : 'belum_hadir');
    if (status === 'hadir') {
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg hover:shadow-emerald-500/25">
          <span className="flex items-center gap-1"> 🟢 Hadir </span>
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
        <span className="flex items-center gap-1"> ⚪ Belum Hadir </span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-yellow-500" />
        <span className="ml-2 text-gray-400">Loading participants...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SPH Participants</h1>
          <p className="text-gray-400 mt-2">Kelola peserta Sekolah Properti Himperra</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchParticipants}
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            🔄 Refresh
          </Button>
          <Button 
            onClick={handleExportCSV}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 border-0 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
            title="Export Data CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            📊 Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 shadow-xl">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="🔍 Cari nama, email, atau nomor telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
              >
                <option value="all">📋 Semua Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="paid">✅ Lunas</option>
                <option value="cancelled">❌ Dibatalkan</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-blue-500/25">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white" />
              <div>
                <p className="text-sm text-blue-100">👥 Total Peserta</p>
                <p className="text-2xl font-bold text-white">{participants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500 shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-green-500/25">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-white" />
              <div>
                <p className="text-sm text-green-100">✅ Lunas</p>
                <p className="text-2xl font-bold text-white">
                  {participants.filter(p => p.payment_status === 'paid').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400 shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-yellow-500/25">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-white" />
              <div>
                <p className="text-sm text-yellow-100">⏳ Pending</p>
                <p className="text-2xl font-bold text-white">
                  {participants.filter(p => p.payment_status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-600 to-red-700 border-red-500 shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-red-500/25">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <X className="w-8 h-8 text-white" />
              <div>
                <p className="text-sm text-red-100">❌ Dibatalkan</p>
                <p className="text-2xl font-bold text-white">
                  {participants.filter(p => p.payment_status === 'cancelled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-600 border-b border-gray-600">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            📊 Daftar Peserta
          </CardTitle>
          <CardDescription className="text-gray-300">
            {filteredParticipants.length} peserta ditemukan dari total {participants.length} peserta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-500/30 bg-gradient-to-r from-gray-800 to-gray-700">
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    👤 Nama
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    📧 Email
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    📱 Telepon
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    🏢 Instansi
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    ✅ Kehadiran
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    📚 Level
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    💳 Status
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    📅 Tanggal Daftar
                  </th>
                  <th className="text-left p-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">
                    ⚡ Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant, index) => (
                  <tr key={participant.id} className="border-b border-gray-700 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30 transition-all duration-300 group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {participant.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium group-hover:text-yellow-300 transition-colors duration-200">
                          {participant.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                        {participant.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-200 font-mono">
                        {participant.phone}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                        {participant.institution || (
                          <span className="text-gray-500 italic">Tidak disebutkan</span>
                        )}
                      </span>
                    </td>
                    <td className="p-4">{getAttendanceBadge(participant)}</td>
                    <td className="p-4">{getExperienceBadge(participant.experience_level)}</td>
                    <td className="p-4">{getStatusBadge(participant.payment_status)}</td>
                    <td className="p-4">
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                        {new Date(participant.registration_date).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-400 border-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {participant.payment_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptPayment(participant.id)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                              title="Terima Pembayaran"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRejectPayment(participant.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                              title="Tolak Pembayaran"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {participant.payment_status === 'paid' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSendTicket(participant.id)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
                              title="Kirim Ulang E-ticket"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadQRTemplate(participant.id, participant.full_name)}
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                              title="Download QR Template Professional"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSendWhatsApp(participant)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                              title="Kirim via WhatsApp"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {/* Delete button - available for all statuses */}
                        <Button
                          size="sm"
                          onClick={() => handleDeleteParticipant(participant.id, participant.full_name)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-600/25"
                          title="Hapus Peserta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredParticipants.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Tidak ada peserta yang ditemukan
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detail Peserta</h3>
              <Button
                variant="ghost"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Nama Lengkap</Label>
                  <p className="text-white font-medium">{selectedParticipant.full_name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <p className="text-white">{selectedParticipant.email}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Nomor Telepon</Label>
                  <p className="text-white">{selectedParticipant.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Instansi</Label>
                  <p className="text-white">{selectedParticipant.institution || '-'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Level Pengalaman</Label>
                  <div className="mt-1">{getExperienceBadge(selectedParticipant.experience_level)}</div>
                </div>
                <div>
                  <Label className="text-gray-300">Status Pembayaran</Label>
                  <div className="mt-1">{getStatusBadge(selectedParticipant.payment_status)}</div>
                </div>
                <div>
                  <Label className="text-gray-300">Metode Pembayaran</Label>
                  <p className="text-white">{selectedParticipant.payment_method?.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Kode Pembayaran</Label>
                  <p className="text-white">{selectedParticipant.payment_code || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Tanggal Daftar</Label>
                  <p className="text-white">
                    {new Date(selectedParticipant.registration_date).toLocaleString('id-ID')}
                  </p>
                </div>
                {selectedParticipant.payment_date && (
                  <div>
                    <Label className="text-gray-300">Tanggal Bayar</Label>
                    <p className="text-white">
                      {new Date(selectedParticipant.payment_date).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {selectedParticipant.notes && (
              <div className="mt-6">
                <Label className="text-gray-300">Catatan</Label>
                <p className="text-white bg-gray-700 p-3 rounded mt-1">{selectedParticipant.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}