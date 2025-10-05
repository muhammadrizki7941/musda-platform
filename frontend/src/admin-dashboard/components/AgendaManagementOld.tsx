import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { apiCall } from '../../config/api';
type AgendaItem = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  agenda_date: string;
  location: string;
  speaker: string;
  category?: string;
  status?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Clock, MapPin, User, Edit, Trash2, Calendar } from 'lucide-react';

export function AgendaManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    speaker: '',
    category: '',
    status: 'upcoming',
    is_active: true
  });
  const [editForm, setEditForm] = useState({
    id: 0,
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    speaker: '',
    category: '',
    status: 'upcoming',
    is_active: true
  });
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  // Fetch agenda from backend
  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/agendas');
      // backend now returns camelCase date field 'date'; adapt to local item shape expecting agenda_date
      const normalized = Array.isArray(data) ? data.map((a: any) => ({
        ...a,
        start_time: a.startTime || a.start_time,
        end_time: a.endTime || a.end_time,
        agenda_date: a.date || a.agenda_date,
        is_active: a.is_active
      })) : [];
      setAgendaItems(normalized);
    } catch (err) {
      setAgendaItems([]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchAgendas();
  }, []);

  // Add agenda
  const handleAddAgenda = async () => {
    setAddError('');
    if (!form.title || !form.startTime || !form.endTime || !form.date) {
      setAddError('Judul, waktu mulai, waktu selesai, dan tanggal wajib diisi');
      return;
    }
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const payload = {
        ...form,
        date: form.date ? (form.date.match(/\d{4}-\d{2}-\d{2}/)?.[0] || form.date) : '',
        is_active: form.is_active ? 1 : 0
      };
      const responseData = await apiCall('/agendas', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });
      
      if (responseData.error) {
        throw new Error(responseData.error || 'Gagal tambah agenda');
      }
      
      setIsAddDialogOpen(false);
      setForm({
        title: '', 
        description: '', 
        startTime: '', 
        endTime: '', 
        date: '', 
        location: '', 
        speaker: '', 
        category: '',
        status: 'upcoming',
        is_active: true
      });
      fetchAgendas();
    } catch (err) {
      console.error('Error adding agenda:', err);
      setAddError((err as Error).message || 'Gagal tambah agenda');
    }
  };

  // Edit agenda
  const openEditDialog = (item: AgendaItem) => {
    setEditForm({
      id: item.id,
      title: item.title,
      description: item.description,
      startTime: item.start_time,
      endTime: item.end_time,
      date: item.agenda_date,
      location: item.location,
      speaker: item.speaker,
      category: item.category || '',
      status: item.status || 'upcoming',
      is_active: Boolean(item.is_active)
    });
    setIsEditDialogOpen(true);
    setEditError('');
  };

  const handleEditAgenda = async () => {
    setEditError('');
    if (!editForm.title || !editForm.startTime || !editForm.endTime || !editForm.date) {
      setEditError('Judul, waktu mulai, waktu selesai, dan tanggal wajib diisi');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/agendas/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          ...editForm,
          date: editForm.date ? (editForm.date.match(/\d{4}-\d{2}-\d{2}/)?.[0] || editForm.date) : '',
          is_active: editForm.is_active ? 1 : 0
        })
      });
      if (!res.ok) throw new Error('Gagal update agenda');
      setIsEditDialogOpen(false);
      fetchAgendas();
    } catch (err) {
      setEditError('Gagal update agenda');
    }
  };

  // Delete agenda
  const handleDeleteAgenda = async (id: number) => {
    if (!window.confirm('Hapus agenda ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/agendas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      fetchAgendas();
    } catch (err) {}
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Terjadwal</Badge>;
      case 'in-progress':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Berlangsung</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Selesai</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Dibatalkan</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ceremony':
        return '🎤';
      case 'speech':
        return '🗣️';
      case 'presentation':
        return '📊';
      case 'workshop':
        return '🛠️';
      case 'discussion':
        return '💬';
      case 'break':
        return '☕';
      default:
        return '📅';
    }
  };

  const totalDuration = agendaItems.reduce((total, item) => {
    const start = new Date(`2024-01-01 ${item.start_time}`);
    const end = new Date(`2024-01-01 ${item.end_time}`);
    return total + (end.getTime() - start.getTime()) / (1000 * 60);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manajemen Agenda</h1>
          <p className="text-gray-400">Kelola jadwal acara MUSDA II HIMPERRA Lampung</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Agenda
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Agenda Baru</DialogTitle>
              <DialogDescription className="text-gray-400">
                Buat agenda baru untuk MUSDA II
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Agenda</Label>
                <Input
                  id="title"
                  placeholder="Masukkan judul agenda"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi agenda"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Waktu Mulai</Label>
                  <Input
                    id="startTime"
                    type="time"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Waktu Selesai</Label>
                  <Input
                    id="endTime"
                    type="time"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={form.date ? (form.date.includes('T') ? form.date.split('T')[0] : form.date) : ''}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  placeholder="Lokasi acara"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="speaker">Pembicara</Label>
                <Input
                  id="speaker"
                  placeholder="Nama pembicara"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={form.speaker}
                  onChange={e => setForm({ ...form, speaker: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={form.category} onValueChange={(value: string) => setForm({ ...form, category: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="ceremony">Upacara</SelectItem>
                    <SelectItem value="speech">Sambutan</SelectItem>
                    <SelectItem value="presentation">Presentasi</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="discussion">Diskusi</SelectItem>
                    <SelectItem value="break">Istirahat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Batal
                </Button>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleAddAgenda}>
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Agenda</p>
                <p className="text-white text-xl font-bold">{agendaItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Durasi Total</p>
                <p className="text-white text-xl font-bold">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <User className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pembicara</p>
                <p className="text-white text-xl font-bold">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Lokasi</p>
                <p className="text-white text-xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline View */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-500" />
            Timeline Agenda
          </CardTitle>
          <CardDescription className="text-gray-400">
            Jadwal lengkap MUSDA II - 15 Februari 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agendaItems.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline line */}
                {index < agendaItems.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-20 bg-yellow-500/30"></div>
                )}
                
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center text-lg">
                    {getCategoryIcon(item.category || 'ceremony')}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {item.start_time} - {item.end_time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {item.location}
                          </div>
                          {item.speaker !== '-' && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {item.speaker}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusBadge(item.status || 'upcoming')}
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20" onClick={() => openEditDialog(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/20" onClick={() => handleDeleteAgenda(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Edit Agenda Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Agenda</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ubah data agenda MUSDA II
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Judul Agenda</Label>
              <Input
                id="edit-title"
                placeholder="Masukkan judul agenda"
                className="bg-gray-700 border-gray-600 text-white"
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                placeholder="Deskripsi agenda"
                className="bg-gray-700 border-gray-600 text-white"
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startTime">Waktu Mulai</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={editForm.startTime}
                  onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endTime">Waktu Selesai</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={editForm.endTime}
                  onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-date">Tanggal</Label>
              <Input
                id="edit-date"
                type="date"
                className="bg-gray-700 border-gray-600 text-white"
                value={editForm.date ? (editForm.date.includes('T') ? editForm.date.split('T')[0] : editForm.date) : ''}
                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Lokasi</Label>
              <Input
                id="edit-location"
                placeholder="Lokasi acara"
                className="bg-gray-700 border-gray-600 text-white"
                value={editForm.location}
                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-speaker">Pembicara</Label>
              <Input
                id="edit-speaker"
                placeholder="Nama pembicara"
                className="bg-gray-700 border-gray-600 text-white"
                value={editForm.speaker}
                onChange={e => setEditForm({ ...editForm, speaker: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Select value={editForm.category} onValueChange={(value: string) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="ceremony">Upacara</SelectItem>
                  <SelectItem value="speech">Sambutan</SelectItem>
                  <SelectItem value="presentation">Presentasi</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="discussion">Diskusi</SelectItem>
                  <SelectItem value="break">Istirahat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Batal
              </Button>
              <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleEditAgenda}>
                Simpan Perubahan
              </Button>
            </div>
            {editError && <div className="text-red-400 text-sm pt-2">{editError}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}