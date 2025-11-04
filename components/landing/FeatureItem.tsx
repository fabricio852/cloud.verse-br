import React from 'react';
import { motion } from 'framer-motion';

interface FeatureItemProps {
  title: string;
  description: string;
  delay?: number;
  order?: number;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
  title,
  description,
  delay = 0,
  order,
}) => {
  const label =
    typeof order === 'number' ? order.toString().padStart(2, '0') : null;

  return (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    whileHover={{ y: -10, scale: 1.01 }}
    className="group h-full"
  >
    <div className="relative overflow-hidden h-full rounded-3xl border border-white/10 bg-[#0e0622]/80 px-6 py-7 flex flex-col gap-4 transition-all duration-400 shadow-[0_35px_90px_-60px_rgba(99,102,241,0.6)] group-hover:border-white/20">
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-transparent" />
      {label && (
        <div className="relative flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-indigo-200/80">
          <span>{label}</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>
      )}
      <h4 className="relative text-lg font-semibold text-white">{title}</h4>
      <p className="relative text-sm text-slate-200 leading-relaxed opacity-90">{description}</p>
    </div>
  </motion.div>
);
};
