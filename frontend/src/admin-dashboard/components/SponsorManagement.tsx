import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Building2, DollarSign, Phone, Mail, Edit, Trash2, Crown, Star, Award, Medal, ThumbsUp } from 'lucide-react';
import { apiCall, FILE_BASE_URL, getApiUrl } from '../../config/api';

// EditSponsorDialog component
function EditSponsorDialog({ sponsor, onEdit }: { sponsor: any, onEdit: Function }) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: sponsor.name, tier: sponsor.tier, logo: sponsor.logo });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Sponsor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nama Perusahaan</Label>
            <Input id="edit-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <div>
            <Label htmlFor="edit-tier">Kategori Sponsor</Label>
            <Select value={form.tier} onValueChange={(val: string) => setForm(f => ({ ...f, tier: val }))}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="supporting">Supporting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-logo">Logo Perusahaan (URL atau Upload)</Label>
            <div className="flex gap-2 items-center">
              <Input id="edit-logo" value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} className="bg-gray-700 border-gray-600 text-white" />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'inline-block', background: '#222', color: '#fff', borderRadius: 4 }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('logo', file);
                  const token = localStorage.getItem('token');
                  const res = await fetch(getApiUrl('/sponsor/upload-logo'), {
                    method: 'POST',
                    headers: {
                      'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: formData
                  });
                  const data = await res.json();
                  if (data.url) {
                    setForm(f => ({ ...f, logo: data.url }));
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">Batal</Button>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={async () => {
              await onEdit(sponsor.id, form);
              setOpen(false);
            }}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SponsorManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [newSponsor, setNewSponsor] = useState({ name: '', tier: 'supporting', logo: '' });

  // Revenue breakdown by tier
  const tierList = [
    { key: 'platinum', label: 'Platinum' },
    { key: 'gold', label: 'Gold' },
    { key: 'silver', label: 'Silver' },
    { key: 'bronze', label: 'Bronze' },
    { key: 'supporting', label: 'Supporting' }
  ];
  const revenueByTier: Record<string, number> = {};
  tierList.forEach(t => {
    revenueByTier[t.key] = sponsors.filter(s => s.tier === t.key).reduce((total, s) => total + (s.amount || 0), 0);
  });

  // Fetch sponsor data from backend
  const mapCategoryToUiTier = (cat: string) => (cat === 'harmony' ? 'supporting' : cat);
  const mapUiTierToCategory = (tier: string) => (tier === 'supporting' ? 'harmony' : tier);

  React.useEffect(() => {
    apiCall('/sponsors')
      .then(response => {
        console.log('Sponsors API response:', response);
        if (response.success && Array.isArray(response.data)) {
          setSponsors(response.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            tier: mapCategoryToUiTier(s.category || 'bronze'),
            logo: s.logo_path,
            amount: 0,
            contact: '',
            phone: '',
            email: '',
            status: s.is_active === 1 ? 'active' : 'inactive',
            benefits: []
          })));
        } else {
          console.error('Invalid sponsors data:', response);
          setSponsors([]);
        }
      })
      .catch(err => {
        console.error('Error fetching sponsors:', err);
        setSponsors([]);
      });
  }, []);

  // Create sponsor
  const handleAddSponsor = async (data: { name: string; logo: string; tier: string }) => {
    try {
      const authHeader = {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
      };
      const response = await apiCall('/sponsor', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ 
          name: data.name,
          category: mapUiTierToCategory(data.tier),
          logo_path: data.logo,
          website_url: '#',
          is_active: 1,
          sort_order: 0
        })
      });
      
      console.log('Add sponsor result:', response);
      
      // Refresh list
      const refreshData = await apiCall('/sponsors');
      if (refreshData.success && Array.isArray(refreshData.data)) {
        setSponsors(refreshData.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          tier: mapCategoryToUiTier(s.category || 'bronze'),
          logo: s.logo_path,
          amount: 0,
          contact: '',
          phone: '',
          email: '',
          status: s.is_active === 1 ? 'active' : 'inactive',
          benefits: []
        })));
      }
    } catch (error) {
      console.error('Error adding sponsor:', error);
    }
  };

  // Edit sponsor
  const handleEditSponsor = async (id: number, data: { name: string; logo: string; tier: string }) => {
    try {
      const authHeader = {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
      };
      const response = await apiCall(`/sponsor/${id}`, {
        method: 'PUT',
        headers: authHeader,
        body: JSON.stringify({ 
          name: data.name,
          category: mapUiTierToCategory(data.tier),
          logo_path: data.logo,
          website_url: '#',
          is_active: 1,
          sort_order: 0
        })
      });
      
      console.log('Edit sponsor result:', response);
      
      // Refresh list
      const refreshData = await apiCall('/sponsors');
      if (refreshData.success && Array.isArray(refreshData.data)) {
        setSponsors(refreshData.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          tier: mapCategoryToUiTier(s.category || 'bronze'),
          logo: s.logo_path,
          amount: 0,
          contact: '',
          phone: '',
          email: '',
          status: s.is_active === 1 ? 'active' : 'inactive',
          benefits: []
        })));
      }
    } catch (error) {
      console.error('Error editing sponsor:', error);
    }
  };

  // Delete sponsor
  const handleDeleteSponsor = async (id: number) => {
    try {
      const authHeader = {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken') || ''}`
      };
      const response = await apiCall(`/sponsor/${id}`, { method: 'DELETE', headers: authHeader });
      
      console.log('Delete sponsor result:', response);
      
      // Remove from local state
      setSponsors(sponsors.filter((s: any) => s.id !== id));
    } catch (error) {
      console.error('Error deleting sponsor:', error);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Crown className="w-3 h-3 mr-1" />
            Platinum
          </Badge>
        );
      case 'gold':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Star className="w-3 h-3 mr-1" />
            Gold
          </Badge>
        );
      case 'silver':
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <Award className="w-3 h-3 mr-1" />
            Silver
          </Badge>
        );
      case 'bronze':
        return (
          <Badge className="bg-orange-700/20 text-orange-400 border-orange-700/30">
            <Medal className="w-3 h-3 mr-1" />
            Bronze
          </Badge>
        );
      case 'supporting':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <ThumbsUp className="w-3 h-3 mr-1" />
            Supporting
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
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Tidak Aktif</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalRevenue = sponsors.reduce((total, sponsor) => total + sponsor.amount, 0);
  const activeSponsorCount = sponsors.filter(s => s.status === 'active').length;
  const pendingSponsorCount = sponsors.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Breakdown Revenue */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manajemen Sponsor</h1>
          <p className="text-gray-400">Kelola sponsor dan partnership MUSDA II</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Sponsor Baru</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tambahkan sponsor/partner baru untuk MUSDA II
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Perusahaan</Label>
                <Input
                  id="name"
                  placeholder="Nama perusahaan"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={newSponsor.name}
                  onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tier">Kategori Sponsor</Label>
                <Select
                  value={newSponsor.tier}
                  onValueChange={(val: string) => setNewSponsor({ ...newSponsor, tier: val })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="supporting">Supporting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="logo">Logo Perusahaan (URL atau Upload)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="logo"
                    placeholder="https://domain.com/logo.png"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={newSponsor.logo}
                    onChange={e => setNewSponsor({ ...newSponsor, logo: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'inline-block', background: '#222', color: '#fff', borderRadius: 4 }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('logo', file);
                      const token = localStorage.getItem('token');
                      const res = await fetch(getApiUrl('/sponsor/upload-logo'), {
                        method: 'POST',
                        headers: {
                          'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: formData
                      });
                      const data = await res.json();
                      if (data.url) {
                        setNewSponsor(s => ({ ...s, logo: data.url }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Batal
                </Button>
                <Button
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                  onClick={async () => {
                    await handleAddSponsor(newSponsor);
                    setIsAddDialogOpen(false);
                    setNewSponsor({ name: '', tier: 'supporting', logo: '' });
                  }}
                >
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
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-white text-lg font-bold">Rp 1.1B</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Sponsor Aktif</p>
                <p className="text-white text-lg font-bold">{activeSponsorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-white text-lg font-bold">{pendingSponsorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tier Tertinggi</p>
                <p className="text-white text-lg font-bold">Platinum</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sponsors.map((sponsor) => (
          <Card key={sponsor.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {sponsor.logo ? (
                      <img
                        src={
                          sponsor.logo.startsWith('http')
                            ? sponsor.logo
                            : sponsor.logo.startsWith('/uploads')
                              ? `${FILE_BASE_URL}${sponsor.logo}`
                              : `${FILE_BASE_URL}/uploads/sponsor-logos/${sponsor.logo.replace(/^.*[\\\/]/, '')}`
                        }
                        alt={sponsor.name + ' logo'}
                        className="w-14 h-14 object-contain bg-white border border-gray-300 rounded p-2"
                        style={{ display: 'block', margin: 'auto', minWidth: '2.5rem', minHeight: '2.5rem', background: '#fff' }}
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://via.placeholder.com/56x56?text=No+Logo';
                        }}
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{sponsor.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTierBadge(sponsor.tier)}
                      {getStatusBadge(sponsor.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <EditSponsorDialog sponsor={sponsor} onEdit={handleEditSponsor} />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={() => {
                      if (window.confirm('Yakin hapus sponsor ini?')) {
                        handleDeleteSponsor(sponsor.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Nilai Sponsorship:</span>
                  <span className="text-yellow-500 font-semibold">{formatCurrency(sponsor.amount)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {sponsor.contact} - {sponsor.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {sponsor.email}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Benefits:</h4>
                  <div className="flex flex-wrap gap-1">
                    {sponsor.benefits.map((benefit: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-gray-700/50 text-gray-300 border-gray-600"
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 mb-2">
        <div className="flex items-center mb-2">
          <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
          <h2 className="text-xl font-bold text-white">Breakdown Revenue</h2>
        </div>
        <p className="text-gray-400 mb-4">Distribusi revenue berdasarkan tier sponsorship</p>
        <div className="space-y-3">
          {tierList.map(tier => {
            const sponsorCount = sponsors.filter(s => s.tier === tier.key).length;
            const revenue = revenueByTier[tier.key];
            const percent = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
            return (
              <div key={tier.key} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  {getTierBadge(tier.key)}
                  <span className="text-gray-300 font-medium">{sponsorCount} sponsor</span>
                  <span className="ml-auto text-yellow-400 font-bold">{formatCurrency(revenue)}</span>
                  <span className="ml-2 text-gray-400 text-xs">{percent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded">
                  <div
                    className="h-2 rounded bg-yellow-500"
                    style={{ width: `${percent}%`, transition: 'width 0.3s' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}