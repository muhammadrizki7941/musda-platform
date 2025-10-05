import React, { useState, useEffect } from 'react';
import { getApiUrl, getFileUrl } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

interface Poster {
  id: number;
  image_url: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PosterManagement: React.FC = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosters();
  }, []);

  const fetchPosters = async () => {
    try {
      console.log('🖼️ Fetching all posters for admin...');
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/poster/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Found ${data.data.length} total posters`);
        setPosters(data.data);
      } else {
        console.error('❌ Failed to fetch posters:', data.message);
        setError(data.message || 'Gagal memuat poster');
      }
    } catch (error) {
      console.error('❌ Error fetching posters:', error);
      setError('Gagal memuat poster');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return getFileUrl(imageUrl);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log('📁 File selected:', file.name);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
    setPreviewUrl(url);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      is_active: true
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingPoster(null);
    setUploadType('file');
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (poster: Poster) => {
    setEditingPoster(poster);
    setFormData({
      title: poster.title,
      description: poster.description,
      image_url: poster.image_url,
      is_active: poster.is_active
    });
    setPreviewUrl(getImageUrl(poster.image_url));
    setUploadType(poster.image_url.startsWith('http') ? 'url' : 'file');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul poster wajib diisi!');
      return;
    }

    if (!selectedFile && !formData.image_url.trim()) {
      alert('Gambar poster wajib diupload atau URL gambar harus diisi!');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`📝 ${editingPoster ? 'Updating' : 'Creating'} poster...`);

      if (editingPoster) {
        // Update flow supports file upload directly
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('is_active', formData.is_active.toString());
        if (selectedFile) {
          formDataToSend.append('image', selectedFile);
        } else if (formData.image_url) {
          formDataToSend.append('image_url', formData.image_url);
        }

        const response = await fetch(`/api/poster/admin/${editingPoster.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataToSend
        });
        const data = await response.json();
        if (data.success) {
          console.log('✅ Poster updated successfully');
          setIsDialogOpen(false);
          resetForm();
          await fetchPosters();
        } else {
          console.error('❌ Failed to update poster:', data.message);
          alert(data.message || 'Gagal memperbarui poster');
        }
        return;
      }

      // Create flow: if file selected, upload it first to get URL
      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        const uploadFd = new FormData();
        uploadFd.append('image', selectedFile);
        const uploadRes = await fetch('/api/poster/admin/upload-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadFd
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData?.success || !uploadData?.url) {
          console.error('❌ Failed to upload poster image:', uploadData);
          alert(uploadData?.message || 'Gagal mengunggah gambar poster');
          return;
        }
        finalImageUrl = uploadData.url;
      }

      // Create poster record
      const createRes = await fetch('/api/poster/admin/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          image_url: finalImageUrl,
          is_active: formData.is_active
        })
      });
      const createData = await createRes.json();
      if (createRes.ok && createData.success) {
        console.log('✅ Poster created successfully');
        setIsDialogOpen(false);
        resetForm();
        await fetchPosters();
      } else {
        console.error('❌ Failed to create poster:', createData);
        alert(createData?.message || 'Gagal membuat poster');
      }
    } catch (error) {
      console.error(`❌ Error ${editingPoster ? 'updating' : 'creating'} poster:`, error);
      alert(`Terjadi kesalahan saat ${editingPoster ? 'memperbarui' : 'membuat'} poster`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (poster: Poster) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus poster "${poster.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`🗑️ Deleting poster ${poster.id}...`);

      const response = await fetch(`/api/poster/admin/${poster.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Poster ${poster.id} deleted successfully`);
        await fetchPosters();
      } else {
        console.error('❌ Failed to delete poster:', data.message);
        alert(data.message || 'Gagal menghapus poster');
      }
    } catch (error) {
      console.error('❌ Error deleting poster:', error);
      alert('Terjadi kesalahan saat menghapus poster');
    }
  };

  const handleToggleStatus = async (poster: Poster) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`🔄 Toggling status for poster ${poster.id}...`);

      const response = await fetch(`/api/poster/admin/${poster.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Poster ${poster.id} status toggled successfully`);
        await fetchPosters();
      } else {
        console.error('❌ Failed to toggle poster status:', data.message);
        alert(data.message || 'Gagal mengubah status poster');
      }
    } catch (error) {
      console.error('❌ Error toggling poster status:', error);
      alert('Terjadi kesalahan saat mengubah status poster');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Kelola Poster/Flyer</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4">
                <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Poster/Flyer</h1>
          <p className="text-gray-400 mt-1">Kelola poster dan flyer untuk halaman Sekolah Properti</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Poster
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
          <p>Error: {error}</p>
          <Button onClick={fetchPosters} className="mt-2 bg-red-600 hover:bg-red-700">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Posters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {posters.map((poster) => (
            <motion.div
              key={poster.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300"
            >
              {/* Poster Image */}
              <div className="aspect-square mb-4 relative overflow-hidden rounded-lg bg-gray-700">
                <img
                  src={getImageUrl(poster.image_url)}
                  alt={poster.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // prevent recursive onError if fallback also fails
                    (target as any).onerror = null;
                    target.src = 'https://via.placeholder.com/400x400/374151/9CA3AF?text=No+Image';
                  }}
                />
                
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  poster.is_active 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                }`}>
                  {poster.is_active ? 'Aktif' : 'Nonaktif'}
                </div>
              </div>

              {/* Poster Info */}
              <div className="mb-4">
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{poster.title}</h3>
                <p className="text-gray-400 text-xs line-clamp-2">{poster.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => openEditDialog(poster)}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleToggleStatus(poster)}
                  size="sm"
                  className={`flex-1 ${
                    poster.is_active 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {poster.is_active ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {poster.is_active ? 'Hide' : 'Show'}
                </Button>
                <Button
                  onClick={() => handleDelete(poster)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white px-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {posters.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Belum ada poster</h3>
          <p className="text-gray-500 mb-4">Mulai dengan menambahkan poster pertama Anda</p>
          <Button 
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Poster
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPoster ? 'Edit Poster' : 'Tambah Poster Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingPoster ? 'Perbarui informasi poster' : 'Tambahkan poster baru untuk halaman Sekolah Properti'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Type Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Metode Upload</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    uploadType === 'file'
                      ? 'bg-yellow-600 border-yellow-500 text-black'
                      : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('url')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    uploadType === 'url'
                      ? 'bg-yellow-600 border-yellow-500 text-black'
                      : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  }`}
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  URL Gambar
                </button>
              </div>
            </div>

            {/* Image Upload/URL */}
            {uploadType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Upload Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-600 file:text-black file:font-semibold hover:file:bg-yellow-700"
                />
                {!editingPoster && <p className="text-xs text-gray-400 mt-1">Format yang didukung: JPEG, PNG, GIF, WebP (Max: 5MB)</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-white mb-2">URL Gambar</label>
                <Input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Preview</label>
                <div className="aspect-square w-32 mx-auto border border-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewUrl('')}
                  />
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Judul Poster *</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Masukkan judul poster"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Deskripsi</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Masukkan deskripsi poster (opsional)"
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
              />
              <label htmlFor="is_active" className="text-sm text-white">
                Aktifkan poster (tampilkan di halaman publik)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : (editingPoster ? 'Perbarui' : 'Simpan')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PosterManagement;