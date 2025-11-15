import React, { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { DonationModal } from './DonationModal';

interface DonationFloatingButtonProps {
  pixKey: string;
  pixReceiverName: string;
  pixReceiverCity: string;
  desktopOnly?: boolean;
}

export const DonationFloatingButton: React.FC<DonationFloatingButtonProps> = ({
  pixKey,
  pixReceiverName,
  pixReceiverCity,
  desktopOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 flex items-center gap-2 ${desktopOnly ? 'hidden lg:flex' : 'flex'} ${isAnimating ? 'animate-pulse' : ''}`}
        title="Apoiar com PIX"
      >
        <Heart size={20} fill="currentColor" />
        <span className="hidden sm:inline">Apoiar</span>
      </button>

      <DonationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pixKey={pixKey}
        pixReceiverName={pixReceiverName}
        pixReceiverCity={pixReceiverCity}
      />
    </>
  );
};
