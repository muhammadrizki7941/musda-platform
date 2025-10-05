import React, { useState, useEffect } from 'react';
import { apiCall, getApiUrl, getFileUrl } from '../../config/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Upload, GripVertical, Eye, EyeOff } from 'lucide-react';

interface GalleryItem {
  id: number;
  image_url: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const GalleryManagement: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    description: '',
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== GALLERY FETCH DEBUG ===');
      console.log('Token from localStorage:', token);
      console.log('Token length:', token ? token.length : 0);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      
      if (!token) {
        console.error('No token found in localStorage');
        setLoading(false);
        return;
      }
      
      // Use direct fetch to ensure auth header is sent, since apiCall doesn't inject Authorization by default
      const resp = await fetch('/api/gallery/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (Array.isArray(data)) {
        setGalleryItems(data);
      } else if (data?.success && Array.isArray(data.data)) {
        setGalleryItems(data.data);
      } else {
        console.warn('Unexpected gallery admin response shape:', data);
        setGalleryItems([]);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return null;

    const uploadFormData = new FormData();
    uploadFormData.append('image', selectedFile);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      console.log('Uploading with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/gallery/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload success data:', data);
        return data.url; // Return the URL, not filename
      } else {
        const responseText = await response.text();
        console.error('Upload error response:', responseText);
        throw new Error(`Upload failed: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image: ' + (error as Error).message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image_url;

      // If uploading a new file
      if (selectedFile) {
        const uploadedUrl = await handleImageUpload();
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      }

      const token = localStorage.getItem('token');
      console.log('Saving with token:', token ? 'Token exists' : 'No token');
      
      const url = editingItem 
        ? `/api/gallery/${editingItem.id}`
        : '/api/gallery/admin/create';
      
      const method = editingItem ? 'PUT' : 'POST';

      console.log('Saving gallery item:', { url, method, imageUrl, description: formData.description });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_url: imageUrl,
          description: formData.description,
          is_active: formData.is_active
        })
      });

      console.log('Save response status:', response.status);

      if (response.ok) {
        const savedItem = await response.json();
        console.log('Item saved successfully:', savedItem);
        await fetchGalleryItems();
        resetForm();
        setIsDialogOpen(false);
        alert('Gallery item saved successfully!');
      } else {
        const responseText = await response.text();
        console.error('Save error response:', responseText);
        alert(`Error saving gallery item: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Error saving gallery item:', error);
      alert('Failed to save gallery item: ' + (error as Error).message);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      image_url: item.image_url,
      description: item.description,
      is_active: item.is_active
    });
    // Set preview for existing image
    const previewUrl = item.image_url.startsWith('http') 
      ? item.image_url 
      : getFileUrl(item.image_url);
    setImagePreview(previewUrl);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) return;

    try {
      console.log('=== DELETE GALLERY ITEM ===');
      console.log('Deleting gallery item ID:', id);
      
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Delete successful:', result);
        
        // Refresh gallery items list
        await fetchGalleryItems();
        alert('Gallery item deleted successfully!');
      } else {
        const responseText = await response.text();
        console.error('Delete failed:', response.status, responseText);
        alert(`Failed to delete gallery item: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Failed to delete gallery item: ' + (error as Error).message);
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gallery/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...item,
          is_active: !item.is_active
        })
      });

      if (response.ok) {
        await fetchGalleryItems();
      } else {
        const responseText = await response.text();
        alert(`Failed to update gallery item: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Error updating gallery item:', error);
      alert('Failed to update gallery item: ' + (error as Error).message);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      image_url: '',
      description: '',
      is_active: true
    });
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === targetId) return;

    const draggedIndex = galleryItems.findIndex(item => item.id === draggedItem);
    const targetIndex = galleryItems.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder items
    const newItems = [...galleryItems];
    const [draggedItemObj] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemObj);

    // Update sort orders
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));

    setGalleryItems(updatedItems);

    // Save new order to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gallery/admin/sort-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: updatedItems.map(item => ({ id: item.id, sort_order: item.sort_order }))
        })
      });

      if (!response.ok) {
        // Revert on error
        await fetchGalleryItems();
        const responseText = await response.text();
        alert(`Failed to save new order: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      await fetchGalleryItems();
      alert('Failed to save new order: ' + (error as Error).message);
    }

    setDraggedItem(null);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="bg-[#232A36] min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery Management</h1>
          <p className="text-gray-400 mt-1">Manage gallery images for Sekolah Properti page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Gallery Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingItem 
                  ? 'Update the gallery item information and image'
                  : 'Add a new image to the gallery with description'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <div className="text-sm text-gray-400">
                    Or enter image URL:
                  </div>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter image description..."
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || (!selectedFile && !formData.image_url)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    editingItem ? 'Update' : 'Create'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Items</p>
              <p className="text-3xl font-bold">{galleryItems.length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Items</p>
              <p className="text-3xl font-bold">{galleryItems.filter(item => item.is_active).length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <Eye className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Inactive Items</p>
              <p className="text-3xl font-bold">{galleryItems.filter(item => !item.is_active).length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <EyeOff className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Last Updated</p>
              <p className="text-lg font-bold">
                {galleryItems.length > 0 
                  ? new Date(Math.max(...galleryItems.map(item => new Date(item.updated_at).getTime()))).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <Upload className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {galleryItems.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 text-center py-16">
          <div className="flex flex-col items-center">
            <div className="bg-gray-700 rounded-full p-6 mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Gallery Items</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Get started by adding your first gallery item to showcase images on the Sekolah Properti page
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3">
              <Plus className="w-5 h-5 mr-2" />
              Add First Gallery Item
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Gallery Items</h2>
            <p className="text-gray-400">Drag items to reorder</p>
          </div>
          
          <div className="grid gap-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-move hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-center space-x-6">
                  <div className="text-gray-400 hover:text-gray-300 transition-colors">
                    <GripVertical className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={item.image_url.startsWith('http') ? item.image_url : getFileUrl(item.image_url)}
                        alt={item.description}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                      />
                      {!item.is_active && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <EyeOff className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {item.description || 'No description'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Order: {item.sort_order}</span>
                          <span>•</span>
                          <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.is_active 
                              ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                              : 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                          }`}>
                            {item.is_active ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleToggleActive(item)}
                      variant="outline"
                      size="sm"
                      className={`border-gray-600 transition-colors ${
                        item.is_active
                          ? 'text-green-400 hover:bg-green-900/20 hover:border-green-500'
                          : 'text-gray-400 hover:bg-gray-700 hover:border-gray-500'
                      }`}
                      title={item.is_active ? 'Hide from website' : 'Show on website'}
                    >
                      {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      onClick={() => handleEdit(item)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500 transition-colors"
                      title="Edit gallery item"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-red-400 hover:bg-red-900/20 hover:border-red-500 transition-colors"
                      title="Delete gallery item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl rounded-full w-16 h-16 p-0 transition-all duration-300 hover:scale-110"
          title="Add Gallery Item"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
};

export default GalleryManagement;