import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-[#030712]" />

      {/* Dynamic mesh blobs */}
      <motion.div
        className="absolute -top-32 -left-24 h-[60vh] w-[60vh] rounded-full mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(79, 70, 229, 0.55) 0%, transparent 65%)', filter: 'blur(90px)' }}
        animate={{
          x: [0, 140, -40, 0],
          y: [0, 40, 120, 0],
          scale: [1, 1.3, 0.9, 1],
          rotate: [0, 25, -10, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/4 right-[-15%] h-[70vh] w-[70vh] rounded-full mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.45) 0%, transparent 60%)', filter: 'blur(100px)' }}
        animate={{
          x: [0, -120, 40, 0],
          y: [0, 70, -50, 0],
          scale: [1.1, 0.85, 1.2, 1.1],
          rotate: [0, -20, 15, 0],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute bottom-[-20%] left-1/4 h-[80vh] w-[80vh] rounded-full mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 65%)', filter: 'blur(110px)' }}
        animate={{
          x: [0, -60, 120, 0],
          y: [0, -120, -40, 0],
          scale: [1, 1.25, 0.95, 1],
          rotate: [0, 18, -12, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-[45%] right-[30%] h-[55vh] w-[55vh] rounded-full mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 60%)', filter: 'blur(100px)' }}
        animate={{
          x: [0, 40, -90, 0],
          y: [0, -80, 40, 0],
          scale: [0.9, 1.15, 1.05, 0.9],
          rotate: [0, -15, 20, 0],
        }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Lively streak */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, transparent 0%, rgba(91, 33, 182, 0.2) 40%, rgba(14, 116, 144, 0.15) 60%, transparent 100%)',
          mixBlendMode: 'screen',
          filter: 'blur(160px)',
        }}
        animate={{ x: ['-10%', '15%', '-12%'], y: ['-5%', '8%', '-6%'], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-transparent" />
    </div>
  );
};
