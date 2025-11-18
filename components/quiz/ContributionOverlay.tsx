import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Copy, Check } from 'lucide-react';
import { generatePixQRCode } from '../../utils/qrCodeGenerator';
import { formatarValorReal, gerarDoacaoEvent, getPixEnvConfig, gerarPixEmv } from '../../utils/pixUtils';

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
  const [pixBrCode, setPixBrCode] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

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
      // Get PIX configuration from environment variables
      const pixConfig = getPixEnvConfig();

      // Generate PIX BR Code (EMV format) with embedded amount
      const brCode = gerarPixEmv({
        chave: pixConfig.chave,
        nomeRecebedor: pixConfig.nomeRecebedor,
        cidadeRecebedor: pixConfig.cidadeRecebedor,
        valor: amount,
      });

      // Generate QR code from BR Code
      const qrCode = await generatePixQRCode(brCode);
      setQrCodeDataUrl(qrCode);
      setPixBrCode(brCode);

      // Track donation event
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
      // Copy the PIX BR Code (not the raw key)
      await navigator.clipboard.writeText(pixBrCode);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
    }
  };

  const handleClose = () => {
    setSelectedAmount(null);
    setQrCodeDataUrl('');
    setPixBrCode('');
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-h-[80vh] flex flex-col">
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-teal-600/20 px-4 py-3 border-b border-white/10">
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

                {/* Content (compact) */}
                <div className="px-4 py-4 space-y-4 overflow-y-auto">
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
                      <div className="flex flex-col items-center space-y-3">
                        <div className="bg-gray-800/50 rounded-xl p-3 w-full max-w-xs">
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
                        <p className="text-[11px] text-gray-400 text-center">
                          Aponte a câmera do seu banco para escanear
                        </p>
                      </div>

                      {/* PIX BR Code Copy Section */}
                      <div className="bg-gray-800/50 rounded-xl p-3 space-y-2">
                        <p className="text-[11px] text-gray-400 text-center">
                          Ou copie o código PIX Copia e Cola
                        </p>
                        {/* Display BR Code */}
                        <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-700">
                          <code className="text-xs font-mono text-gray-100 break-all block">
                            {pixBrCode || 'Gerando código...'}
                          </code>
                        </div>
                        <button
                          onClick={handleCopyToClipboard}
                          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 px-4 transition flex items-center justify-center gap-2 font-semibold"
                        >
                          {copiedToClipboard ? (
                            <>
                              <Check size={18} />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy size={18} />
                              Copiar código PIX
                            </>
                          )}
                        </button>
                      </div>

                      {/* Back Button */}
                      <button
                        onClick={() => {
                          setSelectedAmount(null);
                          setQrCodeDataUrl('');
                          setPixBrCode('');
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




