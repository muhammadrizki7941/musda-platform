import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Users, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { apiCall } from '../../config/api';

interface SPHSettingsData {
  countdown_target_date: string;
  max_participants: number;
  current_participants: number;
  registration_open: boolean;
}

export function SPHSettings() {
  const [settings, setSettings] = useState<SPHSettingsData>({
    countdown_target_date: '',
    max_participants: 50,
    current_participants: 0,
    registration_open: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiCall('/sph-settings');
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching SPH settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await apiCall('/sph-settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });

      if (data.success) {
        alert('Settings berhasil disimpan!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SPHSettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleRegistration = () => {
    setSettings(prev => ({
      ...prev,
      registration_open: !prev.registration_open
    }));
  };

  const openPreview = () => {
    window.open('http://localhost:3000/sekolah-properti', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-yellow-500" />
        <span className="ml-2 text-gray-400">Loading settings...</span>
      </div>
    );
  }

  const isQuotaFull = settings.current_participants >= settings.max_participants;
  const quotaPercentage = Math.round((settings.current_participants / settings.max_participants) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SPH Settings</h1>
          <p className="text-gray-400 mt-2">Kelola countdown dan batas peserta Sekolah Properti Himperra</p>
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
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countdown Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-500" />
              Countdown Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Atur tanggal dan waktu target countdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Target Date & Time</Label>
              <Input
                type="datetime-local"
                value={settings.countdown_target_date}
                onChange={(e) => handleInputChange('countdown_target_date', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white mt-2"
              />
              <p className="text-sm text-gray-400 mt-1">
                Countdown akan berjalan hingga tanggal ini
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Participant Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-500" />
              Peserta Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Kelola batas maksimal peserta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Batas Maksimal Peserta</Label>
              <Input
                type="number"
                min="1"
                value={settings.max_participants}
                onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white mt-2"
              />
              <p className="text-sm text-gray-400 mt-1">
                Pendaftaran akan ditutup otomatis saat mencapai batas ini
              </p>
            </div>

            <div>
              <Label className="text-white">Peserta Terdaftar Saat Ini</Label>
              <div className="mt-2 p-3 bg-gray-700 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">
                    {settings.current_participants} / {settings.max_participants}
                  </span>
                  <span className={`text-sm font-medium ${isQuotaFull ? 'text-red-400' : 'text-green-400'}`}>
                    {quotaPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isQuotaFull ? 'bg-red-500' : quotaPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
              <div>
                <Label className="text-white">Status Pendaftaran</Label>
                <p className="text-sm text-gray-400">
                  {settings.registration_open ? 'Pendaftaran dibuka' : 'Pendaftaran ditutup'}
                </p>
              </div>
              <Button
                onClick={toggleRegistration}
                variant={settings.registration_open ? "destructive" : "default"}
                className={settings.registration_open ? "" : "bg-green-600 hover:bg-green-700"}
              >
                {settings.registration_open ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}
              </Button>
            </div>

            {isQuotaFull && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-md">
                <p className="text-red-400 text-sm font-medium">
                  ⚠️ Kuota peserta sudah penuh! Pendaftaran akan otomatis ditutup.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}