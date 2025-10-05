import React, { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { apiCall } from '../../config/api';

interface QRScannerProps {
  onScanSuccess?: (participant: any) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [manualQR, setManualQR] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrReaderRef = useRef<BrowserQRCodeReader | null>(null);
  // Camera QR scan
  useEffect(() => {
    if (!cameraActive) return;
    const qrReader = new BrowserQRCodeReader();
    qrReaderRef.current = qrReader;
    let stop = false;
    qrReader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
      if (stop) return;
      if (result) {
        stop = true;
        setCameraActive(false);
        handleCameraScan(result.getText());
      }
    });
    return () => {
      stop = true;
  // @ts-ignore
  qrReader.reset();
    };
  }, [cameraActive]);

  const handleCameraScan = async (qrText: string) => {
    setScanning(true);
    setError('');
    try {
      const result = await apiCall('/participants/scan-qr', {
        method: 'POST',
        body: JSON.stringify({ qrCode: qrText })
      });
      setLastScanResult(result);
      if (onScanSuccess) onScanSuccess(result.participant);
      setTimeout(() => setLastScanResult(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Gagal memproses QR code');
    } finally {
      setScanning(false);
    }
  };

  const handleManualScan = async () => {
    if (!manualQR.trim()) {
      setError('Silakan masukkan kode QR');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const result = await apiCall('/participants/scan-qr', {
        method: 'POST',
        body: JSON.stringify({ qrCode: manualQR.trim() })
      });

      setLastScanResult(result);
      setManualQR('');
      
      if (onScanSuccess) {
        onScanSuccess(result.participant);
      }

      // Auto close after 3 seconds if successful
      setTimeout(() => {
        setLastScanResult(null);
      }, 3000);

    } catch (error: any) {
      console.error('QR Scan error:', error);
      setError(error.message || 'Gagal memproses QR code');
    } finally {
      setScanning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualScan();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Scan QR Code Absensi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera QR Scanner */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Scan QR dengan Kamera/Webcam</label>
            {!cameraActive ? (
              <Button onClick={() => setCameraActive(true)} className="bg-green-700 hover:bg-green-800 mb-2">Aktifkan Kamera</Button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <video ref={videoRef} style={{ width: 320, height: 240, borderRadius: 8, background: '#222' }} autoPlay muted />
                <Button onClick={() => setCameraActive(false)} className="bg-gray-600 hover:bg-gray-700">Matikan Kamera</Button>
              </div>
            )}
          </div>

          {/* Manual QR Input */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium text-gray-300">
              Masukkan Kode QR atau Scan dengan Barcode Scanner
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={manualQR}
                onChange={(e) => setManualQR(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan atau scan kode QR..."
                className="bg-gray-700 border-gray-600 text-white flex-1"
                autoFocus
              />
              <Button
                onClick={handleManualScan}
                disabled={scanning || !manualQR.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {scanning ? 'Memproses...' : 'Scan'}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {lastScanResult && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-green-400 font-medium">✅ Absensi Berhasil!</h4>
                <Badge className="bg-green-500 text-white">Hadir</Badge>
              </div>
              <div className="text-gray-300 space-y-1">
                <p><strong>Nama:</strong> {lastScanResult.participant.nama}</p>
                <p><strong>Email:</strong> {lastScanResult.participant.email}</p>
                <p><strong>WhatsApp:</strong> {lastScanResult.participant.whatsapp}</p>
                {lastScanResult.participant.asal_instansi && (
                  <p><strong>Instansi:</strong> {lastScanResult.participant.asal_instansi}</p>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
            <h4 className="text-blue-400 font-medium mb-2">📋 Petunjuk Penggunaan:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Klik "Aktifkan Kamera" untuk scan QR via webcam/laptop/HP</li>
              <li>• Gunakan barcode scanner USB untuk scan otomatis</li>
              <li>• Atau ketik manual kode QR dari e-ticket peserta</li>
              <li>• Tekan Enter atau klik tombol Scan untuk memproses</li>
              <li>• Status kehadiran akan otomatis ter-update</li>
            </ul>
          </div>

          {/* Close Button */}
          {onClose && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Tutup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;