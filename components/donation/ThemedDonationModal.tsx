import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';
import { generatePixQRCode } from '../../utils/qrCodeGenerator';
import { formatarValorReal, gerarDoacaoEvent, getPixEnvConfig, gerarPixEmv } from '../../utils/pixUtils';

interface ThemedDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKey?: string;
  pixReceiverName?: string;
  pixReceiverCity?: string;
  theme?: 'landing' | 'default';
  onDonationComplete?: (amount: number) => void;
}

const avatarUrl = "/profile.jpeg";

const DONATION_AMOUNTS = [
  { value: 5, label: 'Café', emoji: '☕' },
  { value: 15, label: 'Almoço', emoji: '🍽️' },
  { value: 25, label: 'Presente', emoji: '🎁' },
];

export const ThemedDonationModal: React.FC<ThemedDonationModalProps> = ({
  isOpen,
  onClose,
  onDonationComplete,
}) => {
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
      const pixConfig = getPixEnvConfig();

      if (!pixConfig.chave || pixConfig.chave === '00000000000') {
        console.error('[QR] PIX configuration is invalid');
        setQrCodeDataUrl('');
        setPixBrCode('');
        setIsGeneratingQR(false);
        return;
      }

      const brCode = gerarPixEmv({
        chave: pixConfig.chave,
        nomeRecebedor: pixConfig.nomeRecebedor,
        cidadeRecebedor: pixConfig.cidadeRecebedor,
        valor: amount,
      });

      const qrCode = await generatePixQRCode(brCode);
      setQrCodeDataUrl(qrCode);
      setPixBrCode(brCode);

      const event = gerarDoacaoEvent(amount, 'pix');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('donation', { detail: event }));
      }

      if (onDonationComplete) {
        onDonationComplete(amount);
      }
    } catch (error) {
      console.error('[QR] Error generating QR Code:', error);
      setQrCodeDataUrl('');
      setPixBrCode('');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
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
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0, 255, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255, 153, 0, 0.08) 0%, transparent 50%)'
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative rounded-2xl shadow-2xl overflow-hidden border-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(10, 10, 18, 0.97) 0%, rgba(20, 20, 30, 0.97) 100%)',
                  borderImage: 'linear-gradient(135deg, #00FFFF, #FF9900) 1',
                  boxShadow: '0 0 60px rgba(0, 255, 255, 0.2), 0 0 80px rgba(255, 153, 0, 0.15)'
                }}
              >
                {/* Header com gradiente e avatar */}
                <div
                  className="relative px-6 py-5 border-b-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(255, 153, 0, 0.15))',
                    borderColor: 'rgba(0, 255, 255, 0.3)'
                  }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-30" style={{
                    background: 'radial-gradient(circle at 30% 50%, rgba(0, 255, 255, 0.2), transparent 60%)'
                  }} />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar com borda gradiente */}
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full blur-md"
                          style={{
                            background: 'linear-gradient(135deg, #00FFFF, #FF9900)',
                            opacity: 0.6
                          }}
                        />
                        <div className="relative h-14 w-14 rounded-full p-0.5" style={{
                          background: 'linear-gradient(135deg, #00FFFF, #FF9900)'
                        }}>
                          <div className="h-full w-full rounded-full overflow-hidden bg-black">
                            <img
                              src={avatarUrl}
                              alt="Apoie a educação"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold" style={{
                          background: 'linear-gradient(135deg, #00FFFF, #FF9900)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          Apoie a educação gratuita
                        </h2>
                        <p className="text-sm text-cyan-300/80 mt-0.5">
                          Sua contribuição faz a diferença
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      className="text-cyan-300/60 hover:text-cyan-300 transition-all hover:scale-110 rounded-full p-2 hover:bg-cyan-400/10"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {selectedAmount === null ? (
                    <>
                      {/* Donation Amount Options */}
                      <div className="space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300/70">
                          Escolha um valor
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          {DONATION_AMOUNTS.map((item) => (
                            <button
                              key={item.value}
                              onClick={() => generateQRCode(item.value)}
                              className="group relative overflow-hidden rounded-xl py-6 transition-all hover:scale-105 active:scale-95"
                              style={{
                                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 153, 0, 0.05))',
                                border: '2px solid rgba(0, 255, 255, 0.3)'
                              }}
                            >
                              {/* Hover glow */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 153, 0, 0.1))'
                              }} />

                              <div className="relative flex flex-col items-center gap-2">
                                <div className="text-3xl">{item.emoji}</div>
                                <div className="text-sm font-medium text-cyan-300">{item.label}</div>
                                <div className="text-lg font-bold text-orange-400">
                                  {formatarValorReal(item.value)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Continue Button */}
                      <button
                        onClick={handleClose}
                        className="w-full py-3 rounded-lg border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          borderColor: 'rgba(0, 255, 255, 0.2)',
                          color: '#00FFFF',
                          background: 'rgba(0, 255, 255, 0.05)'
                        }}
                      >
                        Continuar estudando
                      </button>
                    </>
                  ) : (
                    <>
                      {/* QR Code Display */}
                      <div className="flex flex-col items-center space-y-3">
                        <div
                          className="rounded-xl p-4 w-full max-w-[240px]"
                          style={{
                            background: 'white',
                            boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)'
                          }}
                        >
                          {isGeneratingQR ? (
                            <div className="w-full aspect-square flex items-center justify-center">
                              <div
                                className="w-10 h-10 rounded-full animate-spin"
                                style={{
                                  border: '3px solid rgba(0, 255, 255, 0.2)',
                                  borderTopColor: '#00FFFF'
                                }}
                              />
                            </div>
                          ) : (
                            <img
                              src={qrCodeDataUrl}
                              alt="QR Code PIX"
                              className="w-full h-auto rounded-lg"
                            />
                          )}
                        </div>
                        <p className="text-sm text-cyan-300/70 text-center">
                          Aponte a câmera do seu banco para escanear
                        </p>
                      </div>

                      {/* PIX BR Code Copy Section */}
                      <div
                        className="rounded-xl p-4 space-y-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 153, 0, 0.05))',
                          border: '1px solid rgba(0, 255, 255, 0.2)'
                        }}
                      >
                        <p className="text-sm text-center font-medium text-cyan-300/80">
                          Ou copie o código PIX Copia e Cola
                        </p>
                        {/* Display BR Code */}
                        <div
                          className="rounded-lg p-3 max-h-24 overflow-y-auto"
                          style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(0, 255, 255, 0.2)'
                          }}
                        >
                          <code className="text-xs font-mono text-cyan-300 break-all block leading-relaxed">
                            {pixBrCode || 'Gerando código...'}
                          </code>
                        </div>
                        <button
                          onClick={handleCopyToClipboard}
                          className="w-full rounded-lg py-3 px-4 transition-all flex items-center justify-center gap-2 font-semibold hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: copiedToClipboard
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))'
                              : 'linear-gradient(135deg, #00FFFF, #FF9900)',
                            color: copiedToClipboard ? '#4ade80' : '#000',
                            border: copiedToClipboard ? '2px solid #4ade80' : 'none'
                          }}
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
                        className="w-full text-center text-sm text-cyan-300/60 hover:text-cyan-300 transition py-2"
                      >
                        ← Voltar para valores
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
