import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Copy, Check } from 'lucide-react';
import { generatePixQRCode } from '../../utils/qrCodeGenerator';
import { formatarValorReal, gerarDoacaoEvent } from '../../utils/pixUtils';

interface ContributionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const avatarUrl = "/profile.jpeg";

const DONATION_AMOUNTS = [
  { value: 5, label: 'Café ☕' },
  { value: 15, label: 'Almoço 🍽️' },
  { value: 25, label: 'Presente 🎁' },
];

export const ContributionOverlay: React.FC<ContributionOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(['tour']);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const pixKey = "00000000000"; // TODO: Configure with actual PIX key
  const pixReceiverName = "Cloud Verse";
  const pixReceiverCity = "São Paulo";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const generateQRCode = async (amount: number) => {
    setSelectedAmount(amount);
    setIsGeneratingQR(true);
    try {
      const pixPayload = JSON.stringify({
        version: '1',
        key: pixKey,
        name: pixReceiverName,
        city: pixReceiverCity,
        amount: amount,
      });

      const qrCode = await generatePixQRCode(pixPayload);
      setQrCodeDataUrl(qrCode);

      const event = gerarDoacaoEvent(amount, 'pix');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('donation', { detail: event }));
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar chave PIX:', error);
    }
  };

  const handleClose = () => {
    setSelectedAmount(null);
    setQrCodeDataUrl('');
    setIsGeneratingQR(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-lg"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-teal-600/20 p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-full border border-white/20 p-[2px] shadow-lg shadow-black/30">
                        <div className="h-full w-full overflow-hidden rounded-full bg-black/60">
                          <img
                            src={avatarUrl}
                            alt="Fabricio Felix"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {t('tour:contribution.title')}
                      </h3>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  <p className="text-gray-300 leading-relaxed text-base">
                    {t('tour:contribution.message')}
                  </p>

                  {selectedAmount === null ? (
                    <>
                      {/* Donation Amount Options */}
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-300 uppercase">
                          Escolha um valor
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {DONATION_AMOUNTS.map((item) => (
                            <button
                              key={item.value}
                              onClick={() => generateQRCode(item.value)}
                              className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 hover:from-green-800/50 hover:to-emerald-800/50 border-2 border-green-500/50 hover:border-green-400 rounded-lg py-3 px-2 transition-all hover:scale-105 active:scale-95"
                            >
                              <div className="font-bold text-sm text-green-400">{item.label}</div>
                              <div className="text-xs text-gray-300">
                                {formatarValorReal(item.value)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-sm text-gray-500">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>

                      {/* Continue Button */}
                      <button
                        onClick={handleClose}
                        className="w-full py-3 px-6 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors"
                      >
                        {t('tour:contribution.continue_button')}
                      </button>

                      {/* Footer note */}
                      <p className="text-xs text-gray-500 text-center">
                        {t('tour:contribution.footer_note')}
                      </p>
                    </>
                  ) : (
                    <>
                      {/* QR Code Display */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gray-800/50 rounded-xl p-4 w-full max-w-xs">
                          {isGeneratingQR ? (
                            <div className="w-full aspect-square flex items-center justify-center">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-3 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                                <p className="text-xs text-gray-400">Gerando QR Code...</p>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={qrCodeDataUrl}
                              alt="QR Code PIX"
                              className="w-full h-auto rounded-lg"
                            />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                          Aponte a câmera do seu banco para escanear
                        </p>
                      </div>

                      {/* PIX Key Section */}
                      <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-300 uppercase">
                          Ou copie a chave PIX
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-gray-900/50 px-3 py-2 rounded-lg text-sm font-mono text-gray-100 break-all border border-gray-700">
                            {pixKey}
                          </code>
                          <button
                            onClick={handleCopyToClipboard}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-2 transition flex-shrink-0"
                            title={copiedToClipboard ? 'Copiado!' : 'Copiar chave PIX'}
                          >
                            {copiedToClipboard ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Back Button */}
                      <button
                        onClick={() => {
                          setSelectedAmount(null);
                          setQrCodeDataUrl('');
                        }}
                        className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition py-2"
                      >
                        ← Voltar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
