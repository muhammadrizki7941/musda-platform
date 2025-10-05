import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function AdminProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    username: user.username || '',
    nama: user.nama || '',
    email: user.email || '',
    avatar: user.avatar || '',
    twoFactorEnabled: user.twoFactorEnabled || false,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/admins/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Profil berhasil diupdate');
        localStorage.setItem('user', JSON.stringify({ ...user, ...form }));
      } else {
        setError(data.error || 'Gagal update profil');
      }
    } catch (err) {
      setError('Gagal update profil');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="bg-gray-800/80 border-yellow-500/40 shadow-2xl max-w-lg w-full">
        <CardHeader className="flex flex-col items-center gap-2">
          <Avatar className="h-16 w-16 border border-yellow-500/30 mb-2">
            <AvatarImage src={form.avatar || '/placeholder-avatar.jpg'} alt={form.nama || form.username} />
            <AvatarFallback className="bg-yellow-500/20 text-yellow-500">
              {(form.nama || form.username || '').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-yellow-300 text-xl font-bold">Profil Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            {success && <div className="text-green-400 text-sm text-center">{success}</div>}
            <div>
              <Label htmlFor="username" className="text-yellow-400">Username</Label>
              <Input id="username" value={form.username} onChange={handleInputChange} className="mt-2 bg-gray-800 text-yellow-100 border-yellow-500/30" />
            </div>
            <div>
              <Label htmlFor="nama" className="text-yellow-400">Nama Lengkap</Label>
              <Input id="nama" value={form.nama} onChange={handleInputChange} className="mt-2 bg-gray-800 text-yellow-100 border-yellow-500/30" />
            </div>
            <div>
              <Label htmlFor="email" className="text-yellow-400">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={handleInputChange} className="mt-2 bg-gray-800 text-yellow-100 border-yellow-500/30" />
            </div>
            <div>
              <Label htmlFor="avatar" className="text-yellow-400">Avatar URL</Label>
              <Input id="avatar" value={form.avatar} onChange={handleInputChange} className="mt-2 bg-gray-800 text-yellow-100 border-yellow-500/30" />
            </div>
            <div>
              <Label htmlFor="password" className="text-yellow-400">Password Baru</Label>
              <Input id="password" type="password" value={form.password} onChange={handleInputChange} className="mt-2 bg-gray-800 text-yellow-100 border-yellow-500/30" placeholder="Kosongkan jika tidak ingin ganti" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Label htmlFor="twoFactorEnabled" className="text-yellow-400">Aktifkan 2FA</Label>
              <Switch id="twoFactorEnabled" checked={form.twoFactorEnabled} onCheckedChange={(checked: boolean) => setForm(f => ({ ...f, twoFactorEnabled: checked }))} />
            </div>
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-bold py-3 mt-4 shadow-lg hover:from-yellow-400 hover:to-yellow-500" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Memproses...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
