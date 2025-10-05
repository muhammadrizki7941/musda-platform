import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Save, Edit, Plus, Eye, Trash2, FileText, Image, Settings } from 'lucide-react';

interface ContentItem {
  id: number;
  section: string;
  content_key: string;
  content_value: string;
  content_type: 'text' | 'textarea' | 'image' | 'url';
  description: string;
  created_at: string;
  updated_at: string;
}

export function SimpleContentManagement() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedSection, setSelectedSection] = useState('hero');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [previewData, setPreviewData] = useState<{[key: string]: string}>({});

  // Pre-defined sections sesuai struktur halaman SPH
  const sections = [
    { key: 'hero', name: 'Hero Section', icon: Image, color: 'bg-blue-500' },
    { key: 'about', name: 'About SPH', icon: FileText, color: 'bg-green-500' },
    { key: 'slider', name: 'Slider Content', icon: Settings, color: 'bg-purple-500' },
    { key: 'features', name: 'Features/Benefits', icon: Settings, color: 'bg-orange-500' },
    { key: 'registration', name: 'Pendaftaran', icon: FileText, color: 'bg-red-500' },
    { key: 'countdown', name: 'Countdown Timer', icon: Settings, color: 'bg-pink-500' }
  ];

  // Template content untuk setiap section berdasarkan struktur halaman SPH
  const contentTemplates = {
    hero: [
      { key: 'title', label: 'Judul Utama', type: 'text', defaultValue: 'Sekolah Properti Himperra' },
      { key: 'subtitle', label: 'Sub Judul', type: 'text', defaultValue: 'Membangun Masa Depan Properti Indonesia' },
      { key: 'description', label: 'Deskripsi Hero', type: 'textarea', defaultValue: 'Belajar strategi investasi properti yang menguntungkan dari para ahli dan praktisi berpengalaman' },
      { key: 'cta_text', label: 'Teks Tombol CTA', type: 'text', defaultValue: 'Daftar Sekarang' },
      { key: 'feature_1_text', label: 'Feature 1', type: 'text', defaultValue: 'Instruktur Berpengalaman' },
      { key: 'feature_2_text', label: 'Feature 2', type: 'text', defaultValue: 'Materi Terkini' },
      { key: 'feature_3_text', label: 'Feature 3', type: 'text', defaultValue: 'Sertifikat Resmi' },
      { key: 'feature_4_text', label: 'Feature 4', type: 'text', defaultValue: 'Networking' }
    ],
    about: [
      { key: 'title', label: 'Judul About', type: 'text', defaultValue: 'Tentang Sekolah Properti' },
      { key: 'description', label: 'Deskripsi About', type: 'textarea', defaultValue: 'Properti merupakan salah satu instrumen investasi paling stabil dengan potensi return yang menarik. Dapatkan panduan lengkap dari para ahli untuk memulai perjalanan investasi properti Anda.' }
    ],
    slider: [
      { key: 'slide_1_title', label: 'Slide 1 - Judul', type: 'text', defaultValue: 'Belajar dari Para Ahli' },
      { key: 'slide_1_subtitle', label: 'Slide 1 - Sub Judul', type: 'text', defaultValue: 'Instruktur berpengalaman 15+ tahun' },
      { key: 'slide_1_description', label: 'Slide 1 - Deskripsi', type: 'textarea', defaultValue: 'Dapatkan insight eksklusif dari praktisi properti terbaik di Lampung' },
      { key: 'slide_2_title', label: 'Slide 2 - Judul', type: 'text', defaultValue: 'Strategi Investasi Terbukti' },
      { key: 'slide_2_subtitle', label: 'Slide 2 - Sub Judul', type: 'text', defaultValue: 'ROI tinggi dengan risiko terukur' },
      { key: 'slide_2_description', label: 'Slide 2 - Deskripsi', type: 'textarea', defaultValue: 'Pelajari strategi yang telah terbukti menghasilkan keuntungan konsisten' }
    ],
    features: [
      { key: 'title', label: 'Judul Features', type: 'text', defaultValue: 'Keunggulan Program' },
      { key: 'benefit_1_title', label: 'Feature 1 - Judul', type: 'text', defaultValue: 'Strategi Investasi Terpilih' },
      { key: 'benefit_1_description', label: 'Feature 1 - Deskripsi', type: 'textarea', defaultValue: 'Pelajari teknik-teknik investasi properti yang terbukti menguntungkan dari para ahli berpengalaman.' },
      { key: 'benefit_2_title', label: 'Feature 2 - Judul', type: 'text', defaultValue: 'Analisis Pasar Mendalam' },
      { key: 'benefit_2_description', label: 'Feature 2 - Deskripsi', type: 'textarea', defaultValue: 'Dapatkan wawasan tentang tren pasar properti Lampung dan cara mengidentifikasi peluang terbaik.' },
      { key: 'benefit_3_title', label: 'Feature 3 - Judul', type: 'text', defaultValue: 'Simulasi Pembiayaan' },
      { key: 'benefit_3_description', label: 'Feature 3 - Deskripsi', type: 'textarea', defaultValue: 'Pelajari skema pembiayaan KPR, perhitungan cash flow, dan strategi leverage yang optimal.' },
      { key: 'benefit_4_title', label: 'Feature 4 - Judul', type: 'text', defaultValue: 'Study Kasus Nyata' },
      { key: 'benefit_4_description', label: 'Feature 4 - Deskripsi', type: 'textarea', defaultValue: 'Analisis proyek-proyek properti sukses di Lampung dengan ROI tinggi dan risiko terukur.' }
    ],
    registration: [
      { key: 'title', label: 'Judul Pendaftaran', type: 'text', defaultValue: 'Pendaftaran Sekolah Properti' },
      { key: 'description', label: 'Deskripsi Pendaftaran', type: 'textarea', defaultValue: 'Daftar sekarang dan mulai perjalanan Anda di dunia properti' },
      { key: 'fee_student', label: 'Biaya Mahasiswa', type: 'text', defaultValue: 'Rp 100.000' },
      { key: 'fee_general', label: 'Biaya Umum', type: 'text', defaultValue: 'Rp 150.000' },
      { key: 'deadline', label: 'Batas Pendaftaran', type: 'text', defaultValue: '10 Desember 2025' },
      { key: 'max_participants', label: 'Kuota Maksimal', type: 'text', defaultValue: '50' }
    ],
    countdown: [
      { key: 'title', label: 'Judul Countdown', type: 'text', defaultValue: 'Acara Dimulai Dalam:' },
      { key: 'subtitle', label: 'Sub Judul Countdown', type: 'text', defaultValue: 'Jangan sampai terlewat!' },
      { key: 'target_date', label: 'Tanggal Target', type: 'text', defaultValue: '2025-11-15T08:00:00' }
    ]
  };

  useEffect(() => {
    loadContentBySection(selectedSection);
  }, [selectedSection]);

  useEffect(() => {
    // Update preview data ketika content berubah
    const preview: {[key: string]: string} = {};
    if (Array.isArray(content)) {
      content.forEach(item => {
        preview[item.content_key] = editValues[item.content_key] || item.content_value;
      });
    }
    setPreviewData(preview);
  }, [content, editValues]);

  const loadContentBySection = async (section: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sph-content/admin/section/${section}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        // Ensure result.data is an array
        const contentData = Array.isArray(result.data) ? result.data : [];
        setContent(contentData);
        
        // Initialize edit values
        const initialValues: {[key: string]: string} = {};
        contentData.forEach((item: ContentItem) => {
          initialValues[item.content_key] = item.content_value;
        });
        setEditValues(initialValues);
      } else {
        console.error('API Error:', response.status, response.statusText);
        setContent([]);
        setEditValues({});
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent([]);
      setEditValues({});
    } finally {
      setIsLoading(false);
    }
  };

  const createMissingContent = async () => {
    const templates = contentTemplates[selectedSection as keyof typeof contentTemplates] || [];
    
    for (const template of templates) {
      const exists = content.find(item => item.content_key === template.key);
      if (!exists) {
        try {
          const response = await fetch('/api/sph-content/admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              section: selectedSection,
              content_key: template.key,
              content_value: template.defaultValue,
              content_type: template.type,
              description: template.label
            })
          });
          
          if (!response.ok) {
            console.error('Failed to create content:', template.key);
          }
        } catch (error) {
          console.error('Error creating content:', error);
        }
      }
    }
    
    // Reload content after creating missing items
    await loadContentBySection(selectedSection);
  };

  const handleInputChange = (key: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveItem = async (key: string) => {
    const item = Array.isArray(content) ? content.find(c => c.content_key === key) : null;
    if (!item) return;
    
    try {
      const response = await fetch(`/api/sph-content/admin/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content_value: editValues[key]
        })
      });
      
      if (response.ok) {
        // Update content state
        setContent(prev => Array.isArray(prev) ? prev.map(c => 
          c.content_key === key 
            ? { ...c, content_value: editValues[key] }
            : c
        ) : []);
        alert('Konten berhasil disimpan!');
      } else {
        alert('Gagal menyimpan konten');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Gagal menyimpan konten');
    }
  };

  const getTemplateForKey = (key: string) => {
    const templates = contentTemplates[selectedSection as keyof typeof contentTemplates] || [];
    return templates.find(t => t.key === key);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kelola Konten Website</h1>
          <p className="text-gray-400">Edit konten website dengan mudah - pilih section dan edit langsung</p>
        </div>
        <Button 
          onClick={createMissingContent}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Setup Konten Default
        </Button>
      </div>

      {/* Section Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = selectedSection === section.key;
          
          return (
            <Card 
              key={section.key}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isActive 
                  ? 'bg-yellow-500/20 border-yellow-500 ring-2 ring-yellow-500/50' 
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
              }`}
              onClick={() => setSelectedSection(section.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${section.color}/20 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${section.color.split('-')[1]}-400`} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{section.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {Array.isArray(content) ? content.filter(item => item.section === section.key).length : 0} item
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Content Editor */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Edit Konten: {sections.find(s => s.key === selectedSection)?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading konten...</div>
              </div>
            ) : !Array.isArray(content) || content.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  Belum ada konten untuk section ini
                </div>
                <Button 
                  onClick={createMissingContent}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  Buat Konten Default
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.isArray(content) && content.map((item) => {
                  const template = getTemplateForKey(item.content_key);
                  const label = template?.label || item.description || item.content_key;
                  const currentValue = editValues[item.content_key] || item.content_value;
                  
                  return (
                    <div key={item.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-white font-medium">{label}</Label>
                        <Button
                          size="sm"
                          onClick={() => handleSaveItem(item.content_key)}
                          className="bg-green-500 text-white hover:bg-green-600"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Simpan
                        </Button>
                      </div>
                      
                      {/* Input Field */}
                      {item.content_type === 'textarea' || template?.type === 'textarea' ? (
                        <Textarea
                          value={currentValue}
                          onChange={(e) => handleInputChange(item.content_key, e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white min-h-24"
                          rows={4}
                          placeholder={`Masukkan ${label.toLowerCase()}...`}
                        />
                      ) : (
                        <Input
                          value={currentValue}
                          onChange={(e) => handleInputChange(item.content_key, e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder={`Masukkan ${label.toLowerCase()}...`}
                        />
                      )}
                      
                      {/* Character Count for textarea */}
                      {(item.content_type === 'textarea' || template?.type === 'textarea') && (
                        <div className="text-right text-xs text-gray-400">
                          {currentValue.length} karakter
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Mobile Preview */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Preview Mobile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {/* Mobile Frame */}
              <div className="w-80 h-[600px] bg-black rounded-[2rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
                  {renderMobilePreview()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Function to render mobile preview based on selected section
  function renderMobilePreview() {
    switch (selectedSection) {
      case 'hero':
        return (
          <div className="relative h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 to-black opacity-90" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-4 flex flex-col justify-center h-full text-center text-white">
              {/* Logo SPH */}
              <div className="mb-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-black font-bold text-sm">SPH</span>
                </div>
              </div>
              
              <h1 className="text-xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                {previewData.title || 'Sekolah Properti Himperra'}
              </h1>
              <h2 className="text-sm text-yellow-400 mb-3">
                {previewData.subtitle || 'Membangun Masa Depan Properti Indonesia'}
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                {previewData.description || 'Belajar strategi investasi properti yang menguntungkan...'}
              </p>
              
              {/* Features Pills */}
              <div className="flex flex-wrap gap-1 justify-center mb-4">
                {[previewData.feature_1_text, previewData.feature_2_text, previewData.feature_3_text, previewData.feature_4_text]
                  .filter(f => f)
                  .map((feature, index) => (
                  <div key={index} className="bg-gray-800/50 border border-yellow-400/30 rounded-full px-2 py-1">
                    <span className="text-gray-300 text-xs">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button className="bg-yellow-500 text-black px-4 py-2 rounded-full font-medium text-sm">
                {previewData.cta_text || 'Daftar Sekarang'}
              </button>
            </div>
          </div>
        );
        
      case 'about':
        return (
          <div className="p-4 h-full overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1 bg-yellow-600/20 border border-yellow-400/50 rounded-full px-3 py-1 mb-3">
                <span className="text-yellow-300 font-semibold text-xs">Tentang Program</span>
              </div>
              <h2 className="text-lg font-bold text-yellow-300 mb-3">
                {previewData.title || 'Tentang Sekolah Properti'}
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {previewData.description || 'Properti merupakan salah satu instrumen investasi paling stabil...'}
              </p>
            </div>
          </div>
        );
        
      case 'slider':
        return (
          <div className="p-4 h-full overflow-y-auto bg-gray-900">
            <div className="space-y-4">
              {/* Slide 1 */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 rounded-lg p-4">
                <h3 className="text-sm font-bold text-yellow-300 mb-1">
                  {previewData.slide_1_title || 'Slide 1 Title'}
                </h3>
                <p className="text-yellow-400 text-xs mb-2">
                  {previewData.slide_1_subtitle || 'Slide 1 Subtitle'}
                </p>
                <p className="text-gray-300 text-xs">
                  {previewData.slide_1_description || 'Slide 1 description...'}
                </p>
              </div>
              
              {/* Slide 2 */}
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/30 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-300 mb-1">
                  {previewData.slide_2_title || 'Slide 2 Title'}
                </h3>
                <p className="text-blue-400 text-xs mb-2">
                  {previewData.slide_2_subtitle || 'Slide 2 Subtitle'}
                </p>
                <p className="text-gray-300 text-xs">
                  {previewData.slide_2_description || 'Slide 2 description...'}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'features':
        return (
          <div className="p-4 h-full overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
            <h2 className="text-lg font-bold text-yellow-300 mb-4 text-center">
              {previewData.title || 'Keunggulan Program'}
            </h2>
            
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-800/50 border border-yellow-400/20 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-yellow-300 mb-1">
                    {previewData[`benefit_${i}_title`] || `Benefit ${i}`}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {previewData[`benefit_${i}_description`] || `Benefit ${i} description...`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'registration':
        return (
          <div className="p-4 h-full overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
            <h2 className="text-lg font-bold text-yellow-300 mb-2 text-center">
              {previewData.title || 'Pendaftaran Sekolah Properti'}
            </h2>
            <p className="text-gray-300 text-xs text-center mb-4">
              {previewData.description || 'Daftar sekarang dan mulai perjalanan Anda di dunia properti'}
            </p>
            
            <div className="space-y-3">
              {/* Pricing Cards */}
              <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg">
                <div className="text-xs text-green-600 font-medium">Mahasiswa</div>
                <div className="text-lg font-bold text-green-800">
                  {previewData.fee_student || 'Rp 100.000'}
                </div>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg">
                <div className="text-xs text-blue-600 font-medium">Umum</div>
                <div className="text-lg font-bold text-blue-800">
                  {previewData.fee_general || 'Rp 150.000'}
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="text-xs text-red-600 font-medium">Batas Pendaftaran</div>
                <div className="font-bold text-red-800 text-sm">
                  {previewData.deadline || '10 Desember 2025'}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="text-xs text-yellow-600 font-medium">Kuota Maksimal</div>
                <div className="font-bold text-yellow-800 text-sm">
                  {previewData.max_participants || '50'} Peserta
                </div>
              </div>
              
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-bold text-sm">
                DAFTAR SEKARANG
              </button>
            </div>
          </div>
        );
        
      case 'countdown':
        return (
          <div className="p-4 h-full flex flex-col justify-center bg-gradient-to-br from-gray-950 to-gray-900">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                {previewData.title || 'Acara Dimulai Dalam:'}
              </h3>
              <p className="text-gray-300 text-sm mb-6">
                {previewData.subtitle || 'Jangan sampai terlewat!'}
              </p>
              
              {/* Countdown Boxes */}
              <div className="grid grid-cols-4 gap-2">
                {['30', '12', '45', '23'].map((value, index) => (
                  <div key={index} className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-2">
                    <div className="text-lg font-bold text-yellow-300">{value}</div>
                    <div className="text-xs text-gray-300">
                      {['Days', 'Hours', 'Mins', 'Secs'][index]}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Target: {previewData.target_date || '2025-11-15T08:00:00'}
              </p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-6 h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Preview akan tampil di sini</p>
            </div>
          </div>
        );
    }
  }
}