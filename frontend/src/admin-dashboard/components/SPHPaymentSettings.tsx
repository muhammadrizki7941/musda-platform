import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  Building, 
  Users, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  Phone,
  MessageSquare
} from 'lucide-react';

interface PaymentSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json';
  description: string;
}

interface PaymentSettings {
  payment_method_qris: boolean;
  payment_method_manual: boolean;
  price_general: number;
  price_student: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  qris_enabled: boolean;
  payment_instructions: string;
  contact_admin: string;
  is_free?: boolean;
}

const SPHPaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    payment_method_qris: false,
    payment_method_manual: true,
    price_general: 150000,
    price_student: 100000,
    bank_name: 'Bank Mandiri',
    bank_account_number: '1234567890',
    bank_account_name: 'Himperra Lampung',
  qris_enabled: false,
    payment_instructions: 'Transfer ke rekening di atas dan konfirmasi pembayaran',
    contact_admin: '+62 812-3456-7890',
    is_free: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/sph-payment-settings/object', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan pembayaran' });
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString(),
        type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'text',
        description: getSettingDescription(key)
      }));

      const response = await fetch('/api/sph-payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings: settingsArray })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Pengaturan pembayaran berhasil disimpan!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menyimpan pengaturan' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan pengaturan' });
    } finally {
      setLoading(false);
    }
  };

  const getSettingDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      payment_method_qris: 'Enable QRIS payment method',
      payment_method_manual: 'Enable manual bank transfer',
      price_general: 'Price for general category (Rp)',
      price_student: 'Price for student category (Rp)',
      bank_name: 'Bank name for manual transfer',
      bank_account_number: 'Bank account number',
      bank_account_name: 'Bank account holder name',
      qris_enabled: 'QRIS payment availability',
      payment_instructions: 'Payment instructions for users',
      contact_admin: 'Admin contact for payment confirmation',
      is_free: 'If enabled, registration is free (no payment required)'
    };
    return descriptions[key] || '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex items-center space-x-2 text-yellow-300">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Memuat pengaturan pembayaran...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl p-6 mb-8 shadow-2xl"
        >
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-gray-900" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pengaturan Pembayaran SPH</h1>
              <p className="text-gray-800 mt-1">Kelola nominal, bank, dan metode pembayaran SPH 2025</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pricing Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Pengaturan Harga</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Harga Umum
                </label>
                <input
                  type="number"
                  value={settings.price_general}
                  onChange={(e) => setSettings({...settings, price_general: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="150000"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Preview: {formatCurrency(settings.price_general)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Harga Mahasiswa
                </label>
                <input
                  type="number"
                  value={settings.price_student}
                  onChange={(e) => setSettings({...settings, price_student: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="100000"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Preview: {formatCurrency(settings.price_student)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bank Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Building className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Informasi Bank</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Mode Gratis</label>
                <input
                  type="checkbox"
                  checked={!!settings.is_free}
                  onChange={(e) => setSettings({ ...settings, is_free: e.target.checked })}
                />
              </div>
              {!settings.is_free && (
                <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Bank</label>
                <input
                  type="text"
                  value={settings.bank_name}
                  onChange={(e) => setSettings({...settings, bank_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="Bank Mandiri"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nomor Rekening</label>
                <input
                  type="text"
                  value={settings.bank_account_number}
                  onChange={(e) => setSettings({...settings, bank_account_number: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Pemegang Rekening</label>
                <input
                  type="text"
                  value={settings.bank_account_name}
                  onChange={(e) => setSettings({...settings, bank_account_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="Himperra Lampung"
                />
              </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Metode Pembayaran</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-white">QRIS Payment</h3>
                  <p className="text-sm text-gray-400">Pembayaran instant dengan QR Code</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment_method_qris}
                    onChange={(e) => setSettings({...settings, payment_method_qris: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Manual Transfer</h3>
                  <p className="text-sm text-gray-400">Transfer bank manual</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment_method_manual}
                    onChange={(e) => setSettings({...settings, payment_method_manual: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Contact & Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-6">
              <MessageSquare className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Kontak & Instruksi</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Kontak Admin
                </label>
                <input
                  type="text"
                  value={settings.contact_admin}
                  onChange={(e) => setSettings({...settings, contact_admin: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="+62 812-3456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Instruksi Pembayaran</label>
                <textarea
                  value={settings.payment_instructions}
                  onChange={(e) => setSettings({...settings, payment_instructions: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                  placeholder="Transfer ke rekening di atas dan konfirmasi pembayaran"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
              loading
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-2xl hover:scale-105'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{loading ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SPHPaymentSettings;