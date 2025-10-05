import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Image, 
  Type,
  FileText,
  Eye,
  Edit,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';

interface ContentItem {
  id: number;
  section: string;
  key_name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'json';
  description: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

const SPHContentManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [content, setContent] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const sections = [
    { key: 'hero', label: 'Hero/Banner', icon: Layout, color: 'blue' },
    { key: 'about', label: 'Tentang', icon: FileText, color: 'green' },
    { key: 'features', label: 'Fitur', icon: Type, color: 'purple' },
    { key: 'gallery', label: 'Galeri', icon: Image, color: 'orange' },
    { key: 'registration', label: 'Pendaftaran', icon: Edit, color: 'red' },
    { key: 'settings', label: 'Pengaturan', icon: RefreshCw, color: 'gray' }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sph-content/frontend');
      const result = await response.json();
      
      if (result.success) {
        setContent(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setMessage({ type: 'error', text: 'Gagal memuat konten' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionContent = async (section: string) => {
    try {
      const response = await fetch(`/api/sph-content/admin/section/${section}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setContent(prev => ({
          ...prev,
          [section]: result.data
        }));
      }
    } catch (error) {
      console.error('Error fetching section content:', error);
    }
  };

  const handleSaveItem = async (item: Partial<ContentItem>) => {
    try {
      setSaving(true);
      
      const url = item.id 
        ? `/api/sph-content/admin/${item.id}`
        : '/api/sph-content/admin';
      
      const method = item.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          section: item.section || activeSection,
          content_key: item.key_name,
          content_value: item.value,
          content_type: item.type || 'text',
          description: item.description || ''
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `Konten berhasil ${item.id ? 'diperbarui' : 'ditambahkan'}!` });
        setEditingItem(null);
        setIsCreateMode(false);
        await fetchSectionContent(activeSection);
      } else {
        throw new Error(result.message || 'Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage({ type: 'error', text: 'Gagal menyimpan konten' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    
    try {
      const response = await fetch(`/api/sph-content/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Konten berhasil dihapus!' });
        await fetchSectionContent(activeSection);
      } else {
        throw new Error(result.message || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus konten' });
    }
  };

  const renderContentForm = () => {
    const item = editingItem || {
      section: activeSection,
      key_name: '',
      value: '',
      type: 'text' as const,
      description: ''
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          {editingItem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {editingItem ? 'Edit Konten' : 'Tambah Konten Baru'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Key/Nama</label>
            <input
              type="text"
              value={item.key_name}
              onChange={(e) => setEditingItem(prev => ({ ...prev!, key_name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
              placeholder="hero_title, about_description, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipe</label>
            <select
              value={item.type}
              onChange={(e) => setEditingItem(prev => ({ ...prev!, type: e.target.value as any }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Nilai</label>
            {item.type === 'boolean' ? (
              <select
                value={item.value}
                onChange={(e) => setEditingItem(prev => ({ ...prev!, value: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <textarea
                value={item.value}
                onChange={(e) => setEditingItem(prev => ({ ...prev!, value: e.target.value }))}
                rows={item.type === 'json' ? 6 : 3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                placeholder="Masukkan nilai konten..."
              />
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
            <input
              type="text"
              value={item.description}
              onChange={(e) => setEditingItem(prev => ({ ...prev!, description: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
              placeholder="Deskripsi konten ini..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            onClick={() => handleSaveItem(item)}
            disabled={saving || !item.key_name || !item.value}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </motion.button>

          <motion.button
            onClick={() => {
              setEditingItem(null);
              setIsCreateMode(false);
            }}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Batal
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const renderContentList = () => {
    const sectionContent = content[activeSection] || [];

    return (
      <div className="space-y-4">
        {sectionContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-yellow-300">{item.key_name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.type === 'text' ? 'bg-blue-500/20 text-blue-300' :
                    item.type === 'number' ? 'bg-green-500/20 text-green-300' :
                    item.type === 'boolean' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-orange-500/20 text-orange-300'
                  }`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-gray-300 mb-2 line-clamp-2">
                  {item.value.length > 100 ? `${item.value.substring(0, 100)}...` : item.value}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-400">{item.description}</p>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                <motion.button
                  onClick={() => setEditingItem(item)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {sectionContent.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada konten di section ini</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6"
      >
        <div className="flex items-center gap-4">
          <Layout className="w-8 h-8 text-gray-900" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Konten SPH</h1>
            <p className="text-gray-800 mt-1">Kelola konten dinamis halaman Sekolah Properti</p>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-900/50 border border-green-600 text-green-300'
              : 'bg-red-900/50 border border-red-600 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.key}
                    onClick={() => {
                      setActiveSection(section.key);
                      fetchSectionContent(section.key);
                      setEditingItem(null);
                      setIsCreateMode(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.key
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              onClick={() => {
                setIsCreateMode(true);
                setEditingItem(null);
              }}
              className="w-full mt-6 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 p-3 rounded-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Tambah Konten
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {(editingItem || isCreateMode) && renderContentForm()}
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Konten: {sections.find(s => s.key === activeSection)?.label}
              </h3>
              <motion.button
                onClick={() => fetchSectionContent(activeSection)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </motion.button>
            </div>

            {renderContentList()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SPHContentManagement;