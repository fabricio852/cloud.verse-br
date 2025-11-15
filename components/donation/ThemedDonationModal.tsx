import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { generatePixQRCode } from '../../utils/qrCodeGenerator';
import { formatarValorReal, gerarDoacaoEvent } from '../../utils/pixUtils';

interface ThemedDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKey: string;
  pixReceiverName: string;
  pixReceiverCity: string;
  theme?: 'landing' | 'default';
  onDonationComplete?: (amount: number) => void;
}

const DONATION_AMOUNTS = [
  { value: 5, label: 'Café ☕' },
  { value: 15, label: 'Almoço 🍽️' },
  { value: 25, label: 'Presente 🎁' },
];

export const ThemedDonationModal: React.FC<ThemedDonationModalProps> = ({
  isOpen,
  onClose,
  pixKey,
  pixReceiverName,
  pixReceiverCity,
  theme = 'default',
  onDonationComplete,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const themeStyles = {
    landing: {
      headerGradient: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 153, 0, 0.2))',
      borderColor: '#00FFFF',
      borderHoverColor: '#FF9900',
      textColor: '#00FFFF',
      secondaryColor: '#FF9900',
      backgroundColor: 'rgba(10, 10, 18, 0.95)',
      accentBg: 'rgba(0, 255, 255, 0.05)',
      shadowColor: 'rgba(0, 255, 255, 0.3)',
      buttonBorder: '#00FFFF',
      buttonHoverBorder: '#FF9900',
    },
    default: {
      headerGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderColor: '#10b981',
      borderHoverColor: '#059669',
      textColor: '#10b981',
      secondaryColor: '#059669',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      accentBg: 'rgba(16, 185, 129, 0.05)',
      shadowColor: 'rgba(16, 185, 129, 0.2)',
      buttonBorder: '#10b981',
      buttonHoverBorder: '#059669',
    },
  };

  const styles = themeStyles[theme];

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

      if (onDonationComplete) {
        onDonationComplete(amount);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300 border-2"
        style={{
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          boxShadow: `0 0 30px ${styles.shadowColor}, 0 0 60px ${styles.shadowColor}`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: styles.headerGradient,
            borderBottom: `2px solid ${styles.borderColor}`,
          }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: styles.textColor }}>
              Apoie nosso trabalho
            </h2>
            <p style={{ color: styles.secondaryColor }} className="text-sm">
              Via PIX
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 transition hover:scale-110"
            style={{ color: styles.textColor }}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {selectedAmount === null ? (
            <>
              {/* Donation Amount Options */}
              <div className="space-y-3">
                <p
                  className="text-sm font-semibold uppercase"
                  style={{ color: styles.textColor }}
                >
                  Escolha um valor
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {DONATION_AMOUNTS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => generateQRCode(item.value)}
                      className="border-2 rounded-lg py-3 px-2 transition-all hover:scale-105 active:scale-95"
                      style={{
                        borderColor: styles.buttonBorder,
                        backgroundColor: 'transparent',
                        color: styles.textColor,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.borderColor = styles.buttonHoverBorder;
                        el.style.backgroundColor = styles.accentBg;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.borderColor = styles.buttonBorder;
                        el.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="font-bold text-sm">{item.label}</div>
                      <div className="text-xs" style={{ color: styles.secondaryColor }}>
                        {formatarValorReal(item.value)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Text */}
              <div
                className="border rounded-lg p-3"
                style={{
                  borderColor: styles.secondaryColor,
                  backgroundColor: styles.accentBg,
                }}
              >
                <p className="text-xs" style={{ color: styles.textColor }}>
                  ℹ️ PIX é instantâneo. Sua doação nos ajuda a manter este conteúdo gratuito!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="rounded-xl p-4 w-full max-w-xs"
                  style={{
                    backgroundColor: styles.accentBg,
                    borderColor: styles.borderColor,
                  }}
                >
                  {isGeneratingQR ? (
                    <div className="w-full aspect-square flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="w-8 h-8 border-3 rounded-full animate-spin"
                          style={{
                            borderColor: styles.borderColor,
                            borderTopColor: styles.secondaryColor,
                          }}
                        />
                        <p className="text-xs" style={{ color: styles.textColor }}>
                          Gerando QR Code...
                        </p>
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
                <p className="text-xs" style={{ color: styles.secondaryColor }}>
                  Aponte a câmera do seu banco para escanear
                </p>
              </div>

              {/* PIX Key Section */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{ backgroundColor: styles.accentBg }}
              >
                <p
                  className="text-xs font-semibold uppercase"
                  style={{ color: styles.textColor }}
                >
                  Ou copie a chave PIX
                </p>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-mono break-all border"
                    style={{
                      backgroundColor: styles.backgroundColor,
                      borderColor: styles.borderColor,
                      color: styles.textColor,
                    }}
                  >
                    {pixKey}
                  </code>
                  <button
                    onClick={handleCopyToClipboard}
                    className="rounded-lg p-2 transition flex-shrink-0 border-2"
                    style={{
                      borderColor: styles.buttonBorder,
                      color: styles.textColor,
                      backgroundColor: copiedToClipboard
                        ? styles.accentBg
                        : 'transparent',
                    }}
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
                className="w-full text-center text-sm transition py-2 border-b"
                style={{
                  color: styles.secondaryColor,
                  borderColor: styles.borderColor,
                }}
              >
                ← Voltar
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {selectedAmount === null && (
          <div
            className="px-6 py-3 border-t"
            style={{
              backgroundColor: styles.accentBg,
              borderColor: styles.borderColor,
            }}
          >
            <button
              onClick={handleClose}
              className="w-full text-center text-sm transition"
              style={{ color: styles.secondaryColor }}
            >
              Talvez mais tarde
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
