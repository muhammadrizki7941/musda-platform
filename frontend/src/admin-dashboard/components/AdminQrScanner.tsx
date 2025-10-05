import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { CheckCircle, XCircle, Camera, Keyboard } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../../config/api';
import { Toaster } from './ui/sonner';

type Status = 'none' | 'success' | 'fail';

interface ScanResult {
  participant?: {
    id: number;
    nama: string;
    email?: string;
    whatsapp?: string;
    asal_instansi?: string;
    kota?: string | null;
    kategori?: string | null;
  };
  message?: string;
  error?: string;
  reason?: string;
}

export class AdminQrScanner extends React.Component<{}> {
  videoRef = React.createRef<HTMLVideoElement>();
  manualInputRef = React.createRef<HTMLInputElement>();
  state: {
    scanResult: string;
    status: Status;
    guestName: string;
    guestCity: string;
    message: string;
    scanning: boolean;
    error: string | null;
  showSuccessModal: boolean;
  showFailModal: boolean;
    cameraActive: boolean;
    manualQR: string;
    isProcessing: boolean;
    lastScanned: string;
    lastScanAt: number;
    present: Array<{ id: number; nama: string; asal_instansi?: string; kota?: string | null; updated_at?: string }>; 
  } = {
    scanResult: '',
    status: 'none',
    guestName: '',
    guestCity: '',
    message: '',
    scanning: false,
    error: null,
  showSuccessModal: false,
  showFailModal: false,
    cameraActive: false,
    manualQR: '',
    isProcessing: false,
    lastScanned: '',
    lastScanAt: 0
    ,present: []
  };
  scannerControls: any = null;
  lastErrorTime = 0;
  presentTimer: any = null;
  presentRefreshing = false;

  componentWillUnmount() {
    this.stopScanner();
    if (this.presentTimer) clearInterval(this.presentTimer);
  }

  componentDidMount(): void {
    this.refreshPresent();
    this.presentTimer = setInterval(() => this.refreshPresent(), 7000);
  }

  startCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      this.setState({ cameraActive: true, error: null }, () => this.startScanner());
    } catch (e) {
      this.setState({ error: 'Izin kamera ditolak atau perangkat tidak mendukung.' });
    }
  };

  startScanner = async () => {
    if (!this.videoRef.current) return;
    try {
      const codeReader = new BrowserQRCodeReader();
      this.scannerControls = await codeReader.decodeFromVideoDevice(
        undefined,
        this.videoRef.current,
        (result, err, controls) => {
          if (result) {
            const text = result.getText();
            const { isProcessing, lastScanned, lastScanAt } = this.state;
            // Ignore identical scans within 3s window or while processing
            if (isProcessing) return;
            if (text === lastScanned && Date.now() - lastScanAt < 3000) return;
            this.setState({ isProcessing: true, lastScanned: text, lastScanAt: Date.now() }, () => {
              this.handleScan(text)
                .catch(() => {})
                .finally(() => {
                  // small cooldown to avoid double trigger while same QR still in frame
                  setTimeout(() => this.setState({ isProcessing: false }), 800);
                });
            });
          }
          if (err && err.name !== 'NotFoundException') {
            if (Date.now() - this.lastErrorTime > 2000) {
              this.setState({ error: err.message });
              this.lastErrorTime = Date.now();
            }
          }
        }
      );
    } catch (e: any) {
      this.setState({ error: e?.message || 'Gagal memulai scanner.' });
    }
  };

  refreshPresent = async () => {
    try {
      if (this.presentRefreshing) return;
      this.presentRefreshing = true;
      const rows = await apiCall('/participants/present?limit=25', { method: 'GET' });
      this.setState({ present: rows || [] });
    } catch {}
    finally { this.presentRefreshing = false; }
  }

  stopScanner = () => {
    try { this.scannerControls?.stop(); } catch {}
    this.scannerControls = null;
  };

  handleScan = async (qrValue: string) => {
    this.setState({ scanResult: qrValue, status: 'none', message: '', error: null });
    try {
      const data: ScanResult = await apiCall('/participants/scan-qr', {
        method: 'POST',
        body: JSON.stringify({ qrCode: qrValue })
      });
      const p = data.participant!;
      this.setState({
        status: 'success',
        guestName: p.nama || '',
        guestCity: p.kota || p.asal_instansi || '',
        message: data.message || 'Absensi berhasil',
        showSuccessModal: true,
        showFailModal: false
      });
  // Play success sound (non-blocking)
      try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAQACAgAA').play(); } catch {}
  try { (window as any).sonner?.success?.(data.message || 'Absensi berhasil'); } catch {}
      // auto hide success modal but keep camera running for next scan
      setTimeout(() => {
        this.setState({ showSuccessModal: false });
        this.refreshPresent();
      }, 2000);
    } catch (e: any) {
      // Map friendly messages
      const details = e?.details || {};
      let msg = 'Gagal memproses QR code';
      switch (details.reason) {
        case 'MISSING_QR': msg = 'QR code harus diisi.'; break;
        case 'ALREADY_PRESENT': msg = 'Peserta ini sudah melakukan absensi sebelumnya.'; break;
        case 'SPH_NOT_PAID': msg = 'Peserta SPH belum berstatus paid.'; break;
        case 'SPH_PAYMENT_PENDING': msg = 'Pembayaran SPH masih pending. Mohon selesaikan pembayaran terlebih dahulu.'; break;
        case 'SPH_PAYMENT_CANCELLED': msg = 'Pembayaran SPH dibatalkan. Silakan hubungi panitia.'; break;
        case 'SPH_NOT_FOUND':
        case 'NOT_FOUND': msg = 'QR code tidak valid atau tidak ditemukan.'; break;
        default: msg = e?.message || msg; break;
      }
      this.setState({ status: 'fail', message: msg, showFailModal: true });
      // Play fail sound (non-blocking)
      try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAQACAgAA').play(); } catch {}
      try { (window as any).sonner?.error?.(msg); } catch {}
    }
  };

  handleManualSubmit = () => {
    const code = this.state.manualQR.trim();
    if (!code) {
      this.setState({ status: 'fail', message: 'QR code harus diisi.' });
      return;
    }
    this.handleScan(code);
  };

  render() {
  const { cameraActive, error, showSuccessModal, showFailModal, status, message, guestName, guestCity, manualQR, present } = this.state;
    return (
      <div className="max-w-5xl mx-auto py-6">
        <Toaster position="top-right" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold text-white">Scan QR Absensi</h2>

            {/* Camera */}
            {!cameraActive ? (
              <button onClick={this.startCamera} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                <Camera size={16} /> Aktifkan Kamera
              </button>
            ) : (
              <div className="space-y-2">
                <video ref={this.videoRef} className="w-full h-64 bg-black rounded" autoPlay muted playsInline />
                <div className="flex gap-2">
                  <button onClick={() => { this.stopScanner(); this.setState({ cameraActive: false }); }} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">
                    Matikan Kamera
                  </button>
                </div>
              </div>
            )}

            {/* Manual input */}
            <div className="pt-2">
              <label className="block text-sm text-gray-300 mb-1">Atau masukkan kode QR</label>
              <div className="flex gap-2">
                <input
                  ref={this.manualInputRef as any}
                  value={manualQR}
                  onChange={(e) => this.setState({ manualQR: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && this.handleManualSubmit()}
                  className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 flex-1"
                  placeholder="Contoh: MUSDA|<token> atau SPH|<kode>"
                />
                <button onClick={this.handleManualSubmit} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                  <Keyboard size={16} /> Scan
                </button>
              </div>
            </div>

            {error && <div className="text-red-400">{error}</div>}

            {/* Success Modal */}
            <AnimatePresence>
              {showSuccessModal && (
                  <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border-2 border-yellow-500"
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                    <CheckCircle size={56} className="text-yellow-400 mb-2" />
                    <div className="text-lg font-bold text-white mb-1 text-center">
                      Selamat Datang, <span className="text-yellow-400">{guestName}</span>
                    </div>
                    {guestCity && <div className="text-gray-300 mb-2">Asal: {guestCity}</div>}
                    <div className="text-yellow-200 text-sm mb-4">Silakan memasuki ruangan</div>
                    <button onClick={() => this.setState({ showSuccessModal: false })} className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded">Tutup</button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Failure Modal */}
            <AnimatePresence>
              {showFailModal && (
                  <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border-2 border-red-500"
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                    <XCircle size={56} className="text-red-400 mb-2" />
                    <div className="text-lg font-bold text-white mb-2 text-center">Scan Gagal</div>
                    <div className="text-red-300 text-sm mb-4 text-center">{message}</div>
                    <div className="flex gap-2">
                      <button onClick={() => this.setState({ showFailModal: false, isProcessing: false })} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Tutup</button>
                      <button onClick={() => { this.setState({ showFailModal: false }); this.startCamera(); }} className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded">Coba Lagi</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Failure notice */}
            {status === 'fail' && !showSuccessModal && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded">
                <XCircle size={20} />
                <span>{message}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Sudah Hadir (Realtime)</h3>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-700">
              {present.length === 0 && (
                <div className="text-gray-400 text-sm py-6 text-center">Belum ada yang hadir.</div>
              )}
              {present.map((p) => (
                <div key={p.id} className="py-2">
                  <div className="text-white font-medium">{p.nama}</div>
                  <div className="text-gray-300 text-sm">{p.asal_instansi || '-'}{p.kota ? ` • ${p.kota}` : ''}</div>
                </div>
              ))}
            </div>
            <button onClick={this.refreshPresent} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded">Muat Ulang</button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }
}
