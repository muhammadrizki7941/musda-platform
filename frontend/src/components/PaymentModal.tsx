import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle, MessageCircle, CreditCard, Phone } from 'lucide-react';

interface Participant {
  id: number;
  paymentCode: string;
  status: string;
  amount: number;
  message: string;
  ticketUrl?: string;
}

interface PaymentInfo {
  qrCode?: string;
  amount: number;
  accounts?: Array<{
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch: string;
  }>;
  instructions?: string[];
  adminContact?: {
    whatsapp: string;
    email: string;
  };
}

interface Props {
  participant: Participant;
  paymentMethod: 'manual';
  onClose: () => void;
}

const PaymentModal: React.FC<Props> = ({ participant, paymentMethod, onClose }) => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      // Always manual transfer: fetch dynamic bank info from backend
      try {
        const response = await fetch('/api/sph-payment-settings/bank-info');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const bankData = result.data;
            setPaymentInfo({
              amount: participant.amount,
              accounts: [
                {
                  bankName: bankData.bank_name,
                  accountNumber: bankData.account_number,
                  accountName: bankData.account_name,
                  branch: "Bandar Lampung"
                }
              ],
              instructions: bankData.instructions ? 
                bankData.instructions.split('\n').filter(Boolean) : 
                [
                  "Transfer sesuai dengan nominal yang tertera di atas",
                  "Simpan bukti transfer dengan baik",
                  "Konfirmasi pembayaran melalui WhatsApp",
                  "Cantumkan kode pembayaran saat konfirmasi",
                  "E-tiket akan dikirim setelah pembayaran dikonfirmasi"
                ],
              adminContact: {
                whatsapp: bankData.contact_admin || '+62 812-3456-7890',
                email: 'admin@himperra.org'
              }
            });
          } else {
            throw new Error('Failed to fetch bank info');
          }
        } else {
          throw new Error('Backend not available');
        }
      } catch (error) {
        console.error('Error fetching bank info, using fallback:', error);
        // Fallback ke data default jika backend error
        setPaymentInfo({
          amount: participant.amount,
          accounts: [
            {
              bankName: "Bank Mandiri",
              accountNumber: "1234567890",
              accountName: "HIMPERRA LAMPUNG",
              branch: "Bandar Lampung"
            }
          ],
          instructions: [
            "Transfer sesuai dengan nominal yang tertera di atas",
            "Simpan bukti transfer dengan baik",
            "Konfirmasi pembayaran melalui WhatsApp: +62 812-3456-7890",
            "Cantumkan kode pembayaran saat konfirmasi",
            "E-tiket akan dikirim setelah pembayaran dikonfirmasi"
          ],
          adminContact: {
            whatsapp: '+62 812-3456-7890',
            email: 'admin@himperra.org'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Halo Admin Sekolah Properti HIMPERRA,

Saya sudah melakukan transfer untuk pendaftaran Sekolah Properti HIMPERRA Lampung.

*Detail Pembayaran:*
📋 Kode Pembayaran: ${participant.paymentCode}
💰 Total Transfer: Rp ${participant.amount.toLocaleString('id-ID')}
📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}

Mohon konfirmasi pembayaran saya. Terima kasih 🙏`;

    // Gunakan nomor admin dari database atau fallback ke default
    const adminWhatsApp = paymentInfo?.adminContact?.whatsapp || '+62 812-3456-7890';
    // Hapus karakter non-digit dan pastikan format nomor benar
    const cleanNumber = adminWhatsApp.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-yellow-400/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Memuat informasi pembayaran...</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ minHeight: '100vh' }}
      >
        <div className="min-h-full flex items-center justify-center px-4">
          <motion.div 
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-2xl border border-yellow-400/20 shadow-2xl my-4 max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-gray-900/90" />
              <h2 className="text-xl font-bold text-gray-900/95">Transfer Manual</h2>
            </div>
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="text-gray-900 transition-colors p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Participant Info */}
              <motion.div 
                className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
              <h3 className="font-semibold text-yellow-300 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Detail Pendaftaran
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Kode Pembayaran</span>
                  <span className="font-mono font-bold text-yellow-300 text-lg">{participant.paymentCode}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Total Pembayaran</span>
                  <span className="font-bold text-yellow-300 text-lg">Rp {participant.amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Status Pembayaran</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    participant.status === 'paid' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {participant.status === 'paid' ? 'Sudah Dibayar' : 'Menunggu Pembayaran'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* QRIS removed: manual transfer only */}

            {/* Manual Transfer */}
            {paymentMethod === 'manual' && paymentInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-6 text-yellow-300 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Informasi Transfer Manual
                </h3>
                
                <div className="space-y-4 mb-6">
                  {paymentInfo.accounts?.map((account, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-yellow-400/20 rounded-xl p-6 backdrop-blur-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="font-bold text-yellow-300 text-xl">{account.bankName}</h4>
                        <div className="px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-400/30">
                          <span className="text-xs font-bold text-yellow-300">REKENING RESMI</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Nomor Rekening */}
                        <div className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-300">Nomor Rekening</span>
                            <motion.button
                              onClick={() => copyToClipboard(account.accountNumber, `account-${index}`)}
                              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors border border-yellow-400/30"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Klik untuk copy"
                            >
                              {copied === `account-${index}` ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>
                          <div className="font-mono font-bold text-yellow-300 text-2xl text-center py-2">
                            {account.accountNumber}
                          </div>
                          {copied === `account-${index}` && (
                            <div className="text-center text-green-400 text-sm font-medium mt-2">
                              ✓ Nomor rekening berhasil disalin!
                            </div>
                          )}
                        </div>
                        
                        {/* Atas Nama & Cabang */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-900/30 rounded-lg p-3">
                            <span className="text-sm text-white font-medium block mb-1">Atas Nama</span>
                            <span className="font-semibold text-white">{account.accountName}</span>
                          </div>
                          <div className="bg-gray-900/30 rounded-lg p-3">
                            <span className="text-sm text-white font-medium block mb-1">Cabang</span>
                            <span className="font-semibold text-white">{account.branch}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Payment Instructions */}
                <motion.div 
                  className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-400/30 p-6 rounded-xl mb-6 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h4 className="font-bold text-blue-300 mb-4 flex items-center gap-2 text-lg">
                    📋 Petunjuk Transfer
                  </h4>
                  <div className="space-y-3">
                    {paymentInfo.instructions?.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-400/10">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-300 rounded-full flex items-center justify-center text-sm font-bold border border-blue-400/30">
                          {index + 1}
                        </span>
                        <span className="text-white leading-relaxed font-medium">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* WhatsApp Confirmation Button */}
                <motion.div 
                  className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-400/30 p-6 rounded-xl backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                    <MessageCircle className="w-6 h-6 text-green-300" />
                    Konfirmasi Pembayaran
                  </h4>
                  <div className="bg-green-500/5 border border-green-400/20 rounded-lg p-4 mb-5">
                    <p className="text-white leading-relaxed">
                      Setelah melakukan transfer, mohon <span className="font-semibold text-green-300">konfirmasi pembayaran</span> melalui WhatsApp 
                      dengan menyertakan <span className="font-semibold text-green-300">bukti transfer</span> untuk verifikasi yang lebih cepat.
                    </p>
                  </div>
                  <motion.button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg border border-green-400/30"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.5))' }}
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-lg">Konfirmasi via WhatsApp</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Success Message */}
            {participant.status === 'paid' && (
              <motion.div 
                className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-400/30 p-6 rounded-xl text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-300 mb-2">Pembayaran Berhasil!</h3>
                <p className="text-green-200 mb-4">E-tiket telah dikirim ke email Anda.</p>
                {participant.ticketUrl && (
                  <motion.a 
                    href={participant.ticketUrl} 
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Download E-Tiket
                  </motion.a>
                )}
              </motion.div>
            )}
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;