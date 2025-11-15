import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { generatePixQRCode } from '../../utils/qrCodeGenerator';
import { formatarValorReal, gerarDoacaoEvent } from '../../utils/pixUtils';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKey: string;
  pixReceiverName: string;
  pixReceiverCity: string;
  onDonationComplete?: (amount: number) => void;
}

const DONATION_AMOUNTS = [
  { value: 5, label: 'Café ☕' },
  { value: 15, label: 'Almoço 🍽️' },
  { value: 25, label: 'Presente 🎁' },
];

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  pixKey,
  pixReceiverName,
  pixReceiverCity,
  onDonationComplete,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const generateQRCode = async (amount: number) => {
    setSelectedAmount(amount);
    setIsGeneratingQR(true);
    try {
      // Gera payload PIX com valor
      const pixPayload = JSON.stringify({
        version: '1',
        key: pixKey,
        name: pixReceiverName,
        city: pixReceiverCity,
        amount: amount,
      });

      const qrCode = await generatePixQRCode(pixPayload);
      setQrCodeDataUrl(qrCode);

      // Dispara evento de analytics
      const event = gerarDoacaoEvent(amount, 'pix');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('donation', { detail: event }));
      }

      // Callback opcional
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Apoie a educação gratuita</h2>
              <p className="text-green-100 text-sm">Sua contribuição mantém este serviço chegando até você</p>
            </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
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
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  Escolha um valor
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {DONATION_AMOUNTS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => generateQRCode(item.value)}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900 dark:hover:to-emerald-800 border-2 border-green-200 dark:border-green-800 rounded-lg py-3 px-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="font-bold text-sm text-green-600 dark:text-green-400">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {formatarValorReal(item.value)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Sua contribuição mantém tudo gratuito e permite que este serviço chegue até você e outras pessoas. Obrigado por continuar a corrente!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-full max-w-xs">
                  {isGeneratingQR ? (
                    <div className="w-full aspect-square flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gerando QR Code...</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Aponte a câmera do seu banco para escanear
                </p>
              </div>

              {/* PIX Key Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Ou copie a chave PIX
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-100 break-all">
                    {pixKey}
                  </code>
                  <button
                    onClick={handleCopyToClipboard}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-2 transition flex-shrink-0"
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
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition py-2"
              >
                ← Voltar
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {selectedAmount === null && (
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition"
            >
              Talvez mais tarde
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
