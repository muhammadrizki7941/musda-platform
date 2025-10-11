import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Save, Calendar } from 'lucide-react';
import { apiCall } from '../../config/api';


export function CountdownSettings() {
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const data = await apiCall('/countdown');
        if (data && data.target_date) {
          // Convert MySQL 'YYYY-MM-DD HH:MM:SS' to 'YYYY-MM-DDTHH:MM' for datetime-local input
          const normalized = String(data.target_date).replace(' ', 'T').slice(0, 16);
          setTargetDate(normalized);
        }
      } catch (err) {
        console.log('Failed to fetch countdown');
      }
    };

    fetchCountdown();
  }, []);

  const formatDateForMySQL = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.replace('T', ' ') + ':00';
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || '';
      const result = await apiCall('/countdown', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          // Backend expects `targetDate` (camelCase)
          targetDate: formatDateForMySQL(targetDate)
        })
      });
      
      if (result.error) {
        throw new Error(result.error || 'Gagal menyimpan countdown');
      }
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Pengaturan Countdown</CardTitle>
        <CardDescription className="text-gray-400">
          Atur tanggal & waktu hitung mundur acara MUSDA II HIMPERRA Lampung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="countdown-date">Tanggal & Waktu Acara</Label>
          <Input
            id="countdown-date"
            type="datetime-local"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        {error && <div className="bg-red-500/20 text-red-500 text-sm rounded-lg px-4 py-2">{error}</div>}
        {success && <div className="bg-green-500/20 text-green-500 text-sm rounded-lg px-4 py-2">Berhasil disimpan!</div>}
        <div className="flex justify-end">
          <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Countdown
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
