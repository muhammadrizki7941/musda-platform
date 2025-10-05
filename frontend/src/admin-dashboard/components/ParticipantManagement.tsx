import React, { useState, useEffect } from 'react';
import { apiCall } from '../../config/api';
import QRScanner from './QRScanner';

interface Participant {
  id: number;
  nama: string;
  email: string;
  whatsapp: string;
  asal_instansi?: string;
  kota?: string | null;
  kategori?: string | null;
  status_kehadiran: 'hadir' | 'tidak_hadir' | 'pending';
  qr_code?: string;
  verification_token?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const ParticipantManagement: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Participant>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newParticipant, setNewParticipant] = useState({
    nama: '',
    email: '',
    whatsapp: '',
    asal_instansi: ''
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/participants', { method: 'GET' });
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      alert('Gagal memuat data peserta');
    } finally {
      setLoading(false);
    }
  };

  // Handle inline edit
  const handleEditClick = (participant: Participant) => {
    setEditId(participant.id);
    setEditData({ ...participant });
  };

  const handleEditChange = (field: keyof Participant, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editId) return;
    
    try {
      await apiCall(`/participants/${editId}`, { 
        method: 'PUT', 
        body: JSON.stringify(editData) 
      });
      setEditId(null);
      setEditData({});
      fetchParticipants();
    } catch (error) {
      console.error('Error updating participant:', error);
      alert('Gagal mengupdate data peserta');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus peserta ini?')) return;

    const prevScrollY = window.scrollY;
    setDeletingId(id);
    try {
      await apiCall(`/participants/${id}`, { method: 'DELETE' });
      // Optimistic update agar tidak scroll ke atas
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      // Kembalikan posisi scroll agar tetap smooth di lokasi yang sama
      requestAnimationFrame(() => {
        window.scrollTo({ top: prevScrollY, behavior: 'auto' });
      });
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Gagal menghapus peserta');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle add new participant
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await apiCall('/participants', { 
        method: 'POST', 
        body: JSON.stringify(newParticipant) 
      });
      
      setNewParticipant({ nama: '', email: '', whatsapp: '', asal_instansi: '' });
      setShowAddForm(false);
      fetchParticipants();
      
      // Show success message with QR info
      alert(`Peserta berhasil ditambahkan!\nNama: ${result.nama}\nQR Code: ${result.qr_code}`);
      
    } catch (error: any) {
      console.error('Error adding participant:', error);
      if (error.message.includes('sudah terdaftar')) {
        const shouldResend = confirm(`${error.message}\nApakah ingin mengirim ulang e-ticket?`);
        if (shouldResend && error.participantId) {
          handleResendTicket(error.participantId);
        }
      } else {
        alert('Gagal menambah peserta: ' + error.message);
      }
    }
  };

  // Handle resend e-ticket
  const handleResendTicket = async (participantId: number) => {
    try {
      const result = await apiCall(`/participants/${participantId}/resend-ticket`, {
        method: 'POST'
      });
      alert('E-ticket berhasil dikirim ulang!');
    } catch (error: any) {
      console.error('Error resending ticket:', error);
      alert('Gagal mengirim ulang e-ticket: ' + error.message);
    }
  };

  // Handle QR Scan Success
  const handleQRScanSuccess = async (participantId: string) => {
    try {
      const response = await apiCall('/participants/scan-qr', {
        method: 'POST',
        body: JSON.stringify({ participant_id: participantId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        alert(`Error: ${response.error}`);
        return;
      }

      alert(response.message || 'Absensi berhasil dicatat!');
      fetchParticipants(); // Refresh data
      setShowQRScanner(false);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses QR scan');
    }
  };

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.whatsapp.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || participant.status_kehadiran === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hadir':
        return <Badge className="bg-green-500 text-white">Hadir</Badge>;
      case 'tidak_hadir':
        return <Badge className="bg-red-500 text-white">Tidak Hadir</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
    }
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified 
      ? <Badge className="bg-blue-500 text-white">Terverifikasi</Badge>
      : <Badge className="bg-gray-500 text-white">Belum Verifikasi</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Manajemen Peserta</h1>
          <p className="text-gray-400">Kelola data peserta MUSDA dengan QR absensi</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowQRScanner(!showQRScanner)}
            className="bg-green-600 hover:bg-green-700"
          >
            📱 {showQRScanner ? 'Tutup' : 'Scan QR'}
          </Button>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showAddForm ? 'Tutup Form' : 'Tambah Peserta'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Peserta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{participants.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Hadir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {participants.filter(p => p.status_kehadiran === 'hadir').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tidak Hadir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {participants.filter(p => p.status_kehadiran === 'tidak_hadir').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {participants.filter(p => p.status_kehadiran === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner */}
      {showQRScanner && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <QRScanner 
            onScanSuccess={handleQRScanSuccess}
            onClose={() => setShowQRScanner(false)}
          />
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Tambah Peserta Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nama *</label>
                  <Input
                    type="text"
                    value={newParticipant.nama}
                    onChange={(e) => setNewParticipant({...newParticipant, nama: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <Input
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp *</label>
                  <Input
                    type="text"
                    value={newParticipant.whatsapp}
                    onChange={(e) => setNewParticipant({...newParticipant, whatsapp: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="+6285xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Asal Instansi</label>
                  <Input
                    type="text"
                    value={newParticipant.asal_instansi}
                    onChange={(e) => setNewParticipant({...newParticipant, asal_instansi: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nama instansi"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Simpan
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Cari nama, email, atau WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="tidak_hadir">Tidak Hadir</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Daftar Peserta ({filteredParticipants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">ID</TableHead>
                  <TableHead className="text-gray-300">Nama</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">WhatsApp</TableHead>
                  <TableHead className="text-gray-300">Instansi</TableHead>
                  <TableHead className="text-gray-300">Kota</TableHead>
                  <TableHead className="text-gray-300">Kategori</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Verifikasi</TableHead>
                  <TableHead className="text-gray-300">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id} className="border-gray-700">
                    <TableCell className="text-gray-300">{participant.id}</TableCell>
                    
                    {editId === participant.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editData.nama || ''}
                            onChange={(e) => handleEditChange('nama', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.email || ''}
                            onChange={(e) => handleEditChange('email', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.whatsapp || ''}
                            onChange={(e) => handleEditChange('whatsapp', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.asal_instansi || ''}
                            onChange={(e) => handleEditChange('asal_instansi', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={editData.status_kehadiran || participant.status_kehadiran} 
                            onValueChange={(value: string) => handleEditChange('status_kehadiran', value)}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="hadir">Hadir</SelectItem>
                              <SelectItem value="tidak_hadir">Tidak Hadir</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{getVerificationBadge(participant.is_verified)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              onClick={handleEditSave}
                              className="bg-green-600 hover:bg-green-700 text-xs"
                            >
                              ✓
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => setEditId(null)}
                              className="bg-gray-600 hover:bg-gray-700 text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-gray-300">{participant.nama}</TableCell>
                        <TableCell className="text-gray-300">{participant.email}</TableCell>
                        <TableCell className="text-gray-300">{participant.whatsapp}</TableCell>
                        <TableCell className="text-gray-300">{participant.asal_instansi || '-'}</TableCell>
                        <TableCell className="text-gray-300">{participant.kota || '-'}</TableCell>
                        <TableCell className="text-gray-300">{participant.kategori || '-'}</TableCell>
                        <TableCell>{getStatusBadge(participant.status_kehadiran)}</TableCell>
                        <TableCell>{getVerificationBadge(participant.is_verified)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Button 
                              size="sm" 
                              onClick={() => handleEditClick(participant)}
                              className="bg-blue-600 hover:bg-blue-700 text-xs"
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleResendTicket(participant.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-400/40 text-xs text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                              title="Kirim ulang e-ticket"
                            >
                              📧 Kirim Ulang
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleDelete(participant.id)}
                              className="bg-red-600 hover:bg-red-700 border border-red-400/40 text-xs text-white focus:ring-2 focus:ring-red-400 focus:outline-none"
                              disabled={deletingId === participant.id}
                            >
                              {deletingId === participant.id ? 'Menghapus...' : '🗑️ Hapus'}
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredParticipants.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Tidak ada data peserta ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantManagement;
export { ParticipantManagement };