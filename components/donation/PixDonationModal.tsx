import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import {
  formatarValorReal,
  VALORES_SUGESTAO_PIX,
  getMensagemDoacaoPersonalizada,
  gerarDoacaoEvent,
  gerarPixEmv,
} from '../../utils/pixUtils';
import { generatePixQRCode } from '../../utils/qrCodeGenerator';

interface PixDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKey: string; // CPF, email, telefone ou UUID
  pixReceiverName: string;
  pixReceiverCity: string;
  onDonationComplete?: (amount: number) => void;
}

export const PixDonationModal: React.FC<PixDonationModalProps> = ({
  isOpen,
  onClose,
  pixKey,
  pixReceiverName,
  pixReceiverCity,
  onDonationComplete,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pixBrCode, setPixBrCode] = useState<string>('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(true);

  // Gera QR code quando abre o modal
  useEffect(() => {
    if (isOpen && pixKey) {
      generateQRCode();
    }
  }, [isOpen, pixKey]);

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Generate PIX BR Code (EMV format) without amount for static PIX
      const brCode = gerarPixEmv({
        chave: pixKey,
        nomeRecebedor: pixReceiverName,
        cidadeRecebedor: pixReceiverCity,
        // No valor specified - static PIX allows user to enter amount manually
      });

      // Generate QR code from BR Code
      const qrCode = await generatePixQRCode(brCode);
      setQrCodeDataUrl(qrCode);
      setPixBrCode(brCode);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      // Mostra um placeholder em caso de erro
      setQrCodeDataUrl(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23f3f4f6' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='monospace' font-size='14'%3EQR indisponível%3C/text%3E%3C/svg%3E`);
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

  const handleDonateAmount = (amount: number) => {
    setSelectedAmount(amount);

    // Dispara evento de analytics
    const event = gerarDoacaoEvent(amount, 'pix');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('donation', { detail: event }));
    }

    // Callback opcional
    if (onDonationComplete) {
      onDonationComplete(amount);
    }

    // Fecha o modal após 2 segundos
    setTimeout(() => {
      onClose();
      setSelectedAmount(null);
    }, 2000);
  };

  if (!isOpen) return null;

  const thankYouMessage = selectedAmount ? getMensagemDoacaoPersonalizada(selectedAmount) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Apoie nosso trabalho</h2>
            <p className="text-green-100 text-sm">Via PIX Instantâneo</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!selectedAmount ? (
            <>
              {/* QR Code Section */}
              <div className="flex flex-col items-center">
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  Aponte a câmera do seu banco para escanear
                </p>
              </div>

              {/* PIX BR Code Copy Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Ou copie o código PIX Copia e Cola
                </p>
                {/* Display BR Code */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <code className="text-xs font-mono text-gray-800 dark:text-gray-100 break-all block">
                    {pixBrCode || 'Gerando código...'}
                  </code>
                </div>
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-3 px-4 transition flex items-center justify-center gap-2 font-semibold"
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

              {/* Donation Amount Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Valores sugeridos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {VALORES_SUGESTAO_PIX.map((item) => (
                    <button
                      key={item.valor}
                      onClick={() => handleDonateAmount(item.valor)}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900 dark:hover:to-emerald-800 border-2 border-green-200 dark:border-green-800 rounded-lg py-3 transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="font-bold text-lg text-green-600 dark:text-green-400">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {formatarValorReal(item.valor)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ℹ️ Contribuições fizeram este serviço chegar até você gratuitamente. Se puder, fortaleça essa corrente
                </p>
              </div>
            </>
          ) : (
            /* Thank You Screen */
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-5xl">✨</div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {thankYouMessage}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processando PIX de {formatarValorReal(selectedAmount)}...
                </p>
              </div>
              <div className="w-8 h-8 border-3 border-gray-300 dark:border-gray-600 border-t-green-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        {!selectedAmount && (
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
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
