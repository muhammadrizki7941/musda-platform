import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, FileText, Image, Video, Edit, Trash2, Eye, Save, Monitor, Tablet, Smartphone } from 'lucide-react';

export function ContentManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  const contentItems = [
    {
      id: 1,
      title: 'Halaman Utama - Hero Section',
      type: 'page',
      status: 'published',
      lastModified: '2024-01-20',
      author: 'Admin',
      views: 1250
    },
    {
      id: 2,
      title: 'Tentang MUSDA II',
      type: 'page',
      status: 'published',
      lastModified: '2024-01-19',
      author: 'Admin',
      views: 890
    },
    {
      id: 3,
      title: 'Panduan Pendaftaran',
      type: 'article',
      status: 'draft',
      lastModified: '2024-01-18',
      author: 'Content Writer',
      views: 0
    },
    {
      id: 4,
      title: 'Gallery MUSDA I',
      type: 'gallery',
      status: 'published',
      lastModified: '2024-01-17',
      author: 'Admin',
      views: 567
    },
    {
      id: 5,
      title: 'Video Profil HIMPERRA',
      type: 'video',
      status: 'published',
      lastModified: '2024-01-16',
      author: 'Media Team',
      views: 2340
    }
  ];

  const mediaItems = [
    { id: 1, name: 'hero-background.jpg', type: 'image', size: '2.5 MB', uploaded: '2024-01-20' },
    { id: 2, name: 'logo-himperra.png', type: 'image', size: '1.2 MB', uploaded: '2024-01-19' },
    { id: 3, name: 'musda-promo.mp4', type: 'video', size: '15.8 MB', uploaded: '2024-01-18' },
    { id: 4, name: 'sponsor-banner.jpg', type: 'image', size: '3.1 MB', uploaded: '2024-01-17' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Archived</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <FileText className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'gallery':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manajemen Konten</h1>
          <p className="text-gray-400">Kelola konten website MUSDA II</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Buat Konten
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Konten Baru</DialogTitle>
              <DialogDescription className="text-gray-400">
                Buat halaman atau artikel baru untuk website
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  placeholder="Masukkan judul konten"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipe Konten</Label>
                <Select>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Pilih tipe konten" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="page">Halaman</SelectItem>
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Konten</Label>
                <Textarea
                  id="content"
                  placeholder="Tulis konten di sini..."
                  className="bg-gray-700 border-gray-600 text-white min-h-32"
                />
              </div>
              <div>
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input
                  id="seo-title"
                  placeholder="Judul untuk SEO"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="seo-description">SEO Description</Label>
                <Textarea
                  id="seo-description"
                  placeholder="Deskripsi untuk SEO"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Batal
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Simpan sebagai Draft
                </Button>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                  Publish
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
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Konten</p>
                <p className="text-white text-xl font-bold">{contentItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-white text-xl font-bold">5.0K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Draft</p>
                <p className="text-white text-xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Image className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Media Files</p>
                <p className="text-white text-xl font-bold">{mediaItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="content" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            Konten
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            Media Library
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            SEO Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Daftar Konten</CardTitle>
              <CardDescription className="text-gray-400">
                Kelola semua konten website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>By {item.author}</span>
                          <span>Modified {item.lastModified}</span>
                          <span>{item.views} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(item.status)}
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Media Library</CardTitle>
              <CardDescription className="text-gray-400">
                Kelola file media (gambar, video, dokumen)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        {item.type === 'image' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-gray-400 text-xs">{item.size}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Uploaded {item.uploaded}</span>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-1">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">SEO Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Konfigurasi SEO untuk website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="site-title">Site Title</Label>
                <Input
                  id="site-title"
                  defaultValue="MUSDA II HIMPERRA Lampung"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  defaultValue="Musyawarah Daerah II Himpunan Mahasiswa Pertanian Republik Indonesia Provinsi Lampung"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  defaultValue="musda, himperra, lampung, pertanian, mahasiswa"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan SEO Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Preview Website</CardTitle>
                  <CardDescription className="text-gray-400">
                    Preview tampilan website di berbagai device
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                    className={previewMode === 'desktop' ? 'bg-yellow-500 text-black' : 'border-gray-600 text-gray-300'}
                  >
                    <Monitor className="w-4 h-4 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('tablet')}
                    className={previewMode === 'tablet' ? 'bg-yellow-500 text-black' : 'border-gray-600 text-gray-300'}
                  >
                    <Tablet className="w-4 h-4 mr-1" />
                    Tablet
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                    className={previewMode === 'mobile' ? 'bg-yellow-500 text-black' : 'border-gray-600 text-gray-300'}
                  >
                    <Smartphone className="w-4 h-4 mr-1" />
                    Mobile
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 min-h-96 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="mb-4">
                    {previewMode === 'desktop' && <Monitor className="w-16 h-16 mx-auto" />}
                    {previewMode === 'tablet' && <Tablet className="w-16 h-16 mx-auto" />}
                    {previewMode === 'mobile' && <Smartphone className="w-16 h-16 mx-auto" />}
                  </div>
                  <h3 className="text-lg font-medium mb-2">Website Preview - {previewMode}</h3>
                  <p>Preview akan ditampilkan di sini</p>
                  <p className="text-sm mt-2">Dimensi: {
                    previewMode === 'desktop' ? '1920x1080' :
                    previewMode === 'tablet' ? '768x1024' : '375x667'
                  }</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}