// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw, 
  Eye, 
  Settings,
  FileText,
  Image,
  Hash,
  ToggleLeft,
  Layout,
  ExternalLink
} from 'lucide-react';

export function SPHManagement() {
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState('hero');
  const [sectionContent, setSectionContent] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Content type options
  const contentTypes = [
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'html', label: 'HTML', icon: Layout },
    { value: 'image', label: 'Image URL', icon: Image },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'boolean', label: 'Boolean', icon: ToggleLeft }
  ];

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSectionContent(selectedSection);
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sph-content/admin/sections', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSections(data.data);
        if (data.data.length > 0 && !selectedSection) {
          setSelectedSection(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      // Fallback sections if API fails
      const fallbackSections = ['hero', 'about', 'features', 'countdown', 'contact', 'registration', 'settings'];
      setSections(fallbackSections);
      if (!selectedSection) {
        setSelectedSection('hero');
      }
    }
  };

  const fetchSectionContent = async (section: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sph-content/admin/section/${section}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSectionContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching section content:', error);
      // Fallback content if API fails
      const fallbackContent = {
        title: { value: `${section} Title`, type: 'text', description: 'Section title', id: 1 },
        description: { value: `${section} description content`, type: 'text', description: 'Section description', id: 2 }
      };
      setSectionContent(fallbackContent);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async (contentId: any, newValue: any) => {
    try {
      // @ts-ignore
      const content = Object.values(sectionContent).find((item: any) => item.id === contentId);
      if (!content) return;

      const response = await fetch(`/api/sph-content/admin/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          content_value: newValue,
          // @ts-ignore
          content_type: content.type,
          // @ts-ignore
          description: content.description
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        // @ts-ignore
        setSectionContent((prev: any) => ({
          ...prev,
          // @ts-ignore
          [Object.keys(prev).find(key => prev[key].id === contentId)]: {
            ...content,
            value: newValue
          }
        }));
      }
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const contentItems = Object.values(sectionContent).map(item => ({
        id: item.id,
        content_value: item.value,
        content_type: item.type,
        description: item.description
      }));

      const response = await fetch(`/api/sph-content/admin/section/${selectedSection}/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ contentItems })
      });

      const data = await response.json();
      if (data.success) {
        alert('Content updated successfully!');
      }
    } catch (error) {
      console.error('Error bulk saving:', error);
      alert('Error updating content');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (key, newValue) => {
    setSectionContent(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: newValue
      }
    }));
  };

  const openEditDialog = (key, item) => {
    setCurrentEditItem({ key, ...item });
    setIsEditDialogOpen(true);
  };

  const getContentTypeIcon = (type) => {
    const contentType = contentTypes.find(ct => ct.value === type);
    return contentType ? contentType.icon : FileText;
  };

  const renderContentInput = (key, item) => {
    const Icon = getContentTypeIcon(item.type);

    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={item.value}
              onCheckedChange={(checked) => handleContentChange(key, checked)}
            />
            <Label>{item.value ? 'True' : 'False'}</Label>
          </div>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={item.value || ''}
            onChange={(e) => handleContentChange(key, parseInt(e.target.value) || 0)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        );
      
      case 'html':
        return (
          <Textarea
            value={item.value || ''}
            onChange={(e) => handleContentChange(key, e.target.value)}
            rows={4}
            className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
            placeholder="Enter HTML content..."
          />
        );
      
      default:
        return (
          <Textarea
            value={item.value || ''}
            onChange={(e) => handleContentChange(key, e.target.value)}
            rows={item.type === 'text' && item.value && item.value.length > 100 ? 3 : 2}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder={`Enter ${item.type} content...`}
          />
        );
    }
  };

  const openPreview = () => {
    window.open('http://localhost:3000/sekolah-properti', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SPH Content Management</h1>
          <p className="text-gray-400 mt-2">Manage dynamic content for Sekolah Properti Himperra</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openPreview}
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview Site
          </Button>
          <Button
            onClick={handleBulkSave}
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sections Sidebar */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Content Sections</CardTitle>
            <CardDescription className="text-gray-400">
              Select a section to edit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map((section) => (
                <Button
                  key={section}
                  variant={selectedSection === section ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    selectedSection === section 
                      ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedSection(section)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layout className="w-5 h-5" />
                {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Section
              </CardTitle>
              <CardDescription className="text-gray-400">
                Edit content for the {selectedSection} section
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-yellow-500" />
                  <span className="ml-2 text-gray-400">Loading content...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(sectionContent).map(([key, item]) => {
                    const Icon = getContentTypeIcon(item.type);
                    return (
                      <div key={key} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-yellow-500" />
                            <Label className="text-white font-medium">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                            <Badge variant="secondary" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(key, item)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                        )}
                        
                        {renderContentInput(key, item)}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Content Item</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modify the properties of this content item
            </DialogDescription>
          </DialogHeader>
          {currentEditItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentEditItem.description || ''}
                  onChange={(e) => setCurrentEditItem({
                    ...currentEditItem,
                    description: e.target.value
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Description for admin reference..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Update description in current content
                    setSectionContent(prev => ({
                      ...prev,
                      [currentEditItem.key]: {
                        ...prev[currentEditItem.key],
                        description: currentEditItem.description
                      }
                    }));
                    setIsEditDialogOpen(false);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}