import React, { useState, useEffect } from 'react';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Plus, Shield, User, Edit, Trash2, Key, Activity, Crown, Star, Award } from 'lucide-react';
import { apiCall } from '../../config/api';

interface Admin {
  id: number;
  username: string;
  nama: string;
  email: string;
  role: string;
  status: string;
  password?: string;
  twoFactorEnabled: boolean;
  avatar?: string;
}

interface Activity {
  id: number;
  admin: string;
  action: string;
  time: string;
}

const AdminManagement: React.FC = () => {

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    nama: '',
    email: '',
    role: '',
    status: 'active',
    password: '',
    twoFactorEnabled: false,
    avatar: ''
  });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAdmins();
    fetchActivities();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/admin/admins');
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Gagal mengambil data admin');
    }
    setLoading(false);
  };

  const fetchActivities = async () => {
    try {
      const data = await apiCall('/admin/admins/activities');
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Gagal mengambil aktivitas admin');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, role: value }));
  };

  const handleAddAdmin = async () => {
    setError('');
    // Trim semua input
    const payload = {
      username: form.username.trim(),
      nama: form.nama.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      status: form.status.trim(),
      password: form.password.trim(),
      twoFactorEnabled: form.twoFactorEnabled,
      avatar: form.avatar.trim()
    };
    // Validasi field wajib
    if (!payload.username || !payload.nama || !payload.email || !payload.role || !payload.password) {
      setError('Semua field wajib diisi');
      return;
    }
    if (payload.role === '' || payload.role === 'Pilih role') {
      setError('Role wajib dipilih');
      return;
    }
    setLoading(true);
    try {
      const data = await apiCall('/admin/admins', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (data.success) {
        setIsAddDialogOpen(false);
        setForm({ username: '', nama: '', email: '', role: '', status: 'active', password: '', twoFactorEnabled: false, avatar: '' });
        fetchAdmins();
      } else {
        setError(data.error || 'Gagal membuat admin');
      }
    } catch (err) {
      setError('Gagal membuat admin');
    }
    setLoading(false);
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus admin ini?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdmins();
      } else {
        setError(data.error || 'Gagal hapus admin');
      }
    } catch (err) {
      setError('Gagal hapus admin');
    }
    setLoading(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Crown className="w-3 h-3 mr-1" />
            Super Admin
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Star className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Award className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        );
      case 'viewer':
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <User className="w-3 h-3 mr-1" />
            Viewer
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Tidak Aktif</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  const activeAdminCount = admins.filter(a => a.status === 'active').length;
  const superAdminCount = admins.filter(a => a.role === 'super_admin').length;
  const twoFactorEnabledCount = admins.filter(a => a.twoFactorEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manajemen Admin</h1>
          <p className="text-gray-400">Kelola pengguna admin dan permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Admin Baru</DialogTitle>
              <DialogDescription className="text-gray-400">
                Buat akun admin baru dengan role dan permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/20 text-red-500 border border-red-500/30 rounded px-3 py-2 mb-2 text-sm">
                  {error}
                </div>
              )}
              {!error && loading && (
                <div className="bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded px-3 py-2 mb-2 text-sm">
                  Memproses...
                </div>
              )}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={handleInputChange}
                  placeholder="Masukkan username admin"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={form.nama}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="email@himperra.org"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={form.role} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Password Sementara</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-2fa">Wajib 2FA</Label>
                <Switch id="twoFactorEnabled" checked={form.twoFactorEnabled} onCheckedChange={(checked: boolean) => setForm(f => ({ ...f, twoFactorEnabled: checked }))} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Batal
                </Button>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleAddAdmin} disabled={loading}>
                  {loading ? 'Memproses...' : 'Buat Admin'}
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
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Admin</p>
                <p className="text-white text-xl font-bold">{admins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Admin Aktif</p>
                <p className="text-white text-xl font-bold">{activeAdminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Super Admin</p>
                <p className="text-white text-xl font-bold">{superAdminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Key className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">2FA Enabled</p>
                <p className="text-white text-xl font-bold">{twoFactorEnabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin List */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Daftar Admin</CardTitle>
              <CardDescription className="text-gray-400">
                Kelola akun admin dan permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admins.length === 0 && <div className="text-gray-400">Tidak ada data admin.</div>}
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 border border-gray-600">
                        <AvatarImage src={admin.avatar || 'https://via.placeholder.com/40'} alt={admin.nama} />
                        <AvatarFallback className="bg-gray-600 text-gray-300">
                          {admin.nama ? admin.nama.split(' ').map(n => n[0]).join('') : 'AD'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-medium">{admin.nama}</h3>
                          {admin.twoFactorEnabled && (
                            <Key className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{admin.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRoleBadge(admin.role)}
                          {getStatusBadge(admin.status)}
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Username: {admin.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Edit button can be implemented here */}
                      {admin.role !== 'super_admin' && (
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/20" onClick={() => handleDeleteAdmin(admin.id)} disabled={loading}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-500" />
                Aktivitas Admin
              </CardTitle>
              <CardDescription className="text-gray-400">
                Log aktivitas admin terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium text-yellow-500">{activity.admin}</span>
                        </p>
                        <p className="text-gray-300 text-sm">{activity.action}</p>
                        <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Permissions Matrix */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Permissions Matrix</CardTitle>
          <CardDescription className="text-gray-400">
            Overview permissions untuk setiap role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-300 py-3 px-4">Permission</th>
                  <th className="text-center text-gray-300 py-3 px-4">Super Admin</th>
                  <th className="text-center text-gray-300 py-3 px-4">Admin</th>
                  <th className="text-center text-gray-300 py-3 px-4">Moderator</th>
                  <th className="text-center text-gray-300 py-3 px-4">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'Manage Participants',
                  'Manage Agenda',
                  'Manage Sponsors',
                  'Manage Content',
                  'Manage Admins',
                  'System Settings',
                  'View Reports',
                  'Export Data'
                ].map((permission, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="text-gray-300 py-3 px-4">{permission}</td>
                    <td className="text-center py-3 px-4">
                      <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className={`w-4 h-4 rounded-full mx-auto ${
                        ['Manage Admins', 'System Settings'].includes(permission) 
                          ? 'bg-red-500' 
                          : 'bg-green-500'
                      }`}></div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className={`w-4 h-4 rounded-full mx-auto ${
                        ['Manage Participants', 'Manage Content', 'View Reports'].includes(permission)
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}></div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className={`w-4 h-4 rounded-full mx-auto ${
                        permission === 'View Reports'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminManagement;
