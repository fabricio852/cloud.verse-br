import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface CertificationCardProps {
  title: string;
  code: string;
  description: string;
  status: 'available' | 'coming-soon';
  onAction: () => void;
  delay?: number;
}

const CARD_GRADIENTS: Record<string, string> = {
  'CLF-C02': 'from-cyan-400/25 via-sky-500/10 to-transparent',
  'SAA-C03': 'from-violet-500/25 via-indigo-500/12 to-transparent',
  'AIF-C01': 'from-rose-500/25 via-orange-500/15 to-transparent',
};

export const CertificationCard: React.FC<CertificationCardProps> = ({
  title,
  code,
  description,
  status,
  onAction,
  delay = 0,
}) => {
  const isAvailable = status === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={
        isAvailable ? { y: -12, scale: 1.01, transition: { duration: 0.25 } } : { y: 0 }
      }
      className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.02] p-8 flex flex-col gap-6 shadow-[0_35px_90px_-60px_rgba(99,102,241,0.9)] transition-all duration-400"
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br ${
          CARD_GRADIENTS[code] ?? 'from-indigo-500/20 via-purple-500/10 to-transparent'
        }`}
      />

      <div className="relative">
        <div className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">
          {code}
        </div>
        <h3 className="text-2xl font-medium text-white leading-tight">{title}</h3>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed flex-1">{description}</p>

      {isAvailable ? (
        <Button
          onClick={onAction}
          className="w-full rounded-full transition-all duration-200 text-white bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-amber-400 hover:brightness-110 shadow-[0_18px_45px_-30px_rgba(147,51,234,0.85)]"
        >
          Comecar agora
        </Button>
      ) : (
        <button
          disabled
          className="w-full px-4 py-2 border border-white/15 text-gray-500 rounded-full cursor-not-allowed bg-white/5"
        >
          Em breve
        </button>
      )}
    </motion.div>
  );
};


