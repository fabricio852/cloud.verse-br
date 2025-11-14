import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { useCertificationStore } from '../store/certificationStore';
import { KofiWidget, KofiWidgetHandle } from '../components/quiz/KofiWidget';
import { useOnlinePresence } from '../hooks/useOnlinePresence';

interface PainelProps {
  totalQuestoes: number;
  onQuizRapido: () => void;
  onQuizCompleto: () => void;
  onDominios: () => void;
  onRevisao: () => void;
  onVoltar?: () => void;
  theme?: string;
  toggleTheme?: () => void;
}

const toRgba = (hex: string, alpha = 1) => {
  const sanitized = hex.replace('#', '');
  const expanded = sanitized.length === 3
    ? sanitized.split('').map((char) => char + char).join('')
    : sanitized;
  const parsed = parseInt(expanded, 16);

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const kofiBadgeUrl = new URL('../support_me_on_kofi_badge_beige.png', import.meta.url).href;

// Cores únicas para todos os exames
const THEME_COLORS = {
  primary: '#00FFFF', // cyan
  secondary: '#FF9900', // orange
  accent: '#0891b2', // cyan-600
};

// Nomes completos das certificações
const CERT_NAMES: Record<string, string> = {
  'CLF-C02': 'Cloud Practitioner',
  'SAA-C03': 'Solutions Architect Associate',
  'AIF-C01': 'AI Practitioner',
};

export const Painel: React.FC<PainelProps> = ({
  totalQuestoes,
  onQuizRapido,
  onQuizCompleto,
  onDominios,
  onRevisao,
  onVoltar,
  theme = 'dark',
  toggleTheme,
}) => {
  const { certifications, selectCertification, selectedCertId } = useCertificationStore();
  const channel = selectedCertId ? `presence:cert:${selectedCertId}` : 'presence:site';
  const { online } = useOnlinePresence(channel);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const kofiWidgetRef = useRef<KofiWidgetHandle>(null);
  void totalQuestoes;
  void theme;
  void toggleTheme;

  // Get certification name
  const certName = CERT_NAMES[selectedCertId || 'CLF-C02'] || 'Cloud Practitioner';
  const themeColors = THEME_COLORS;

  const handleCertSelect = (certId: string) => {
    selectCertification(certId);
    setSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a12] text-slate-100 overflow-hidden">
      <style>{`
        /* CRT Overlay */
        .crt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          animation: scanline 8s linear infinite;
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }

        /* VT323 text */
        .vt323-text {
          font-family: 'VT323', monospace;
        }

        /* Pixel card */
        .pixel-card {
          border: 3px solid ${themeColors.primary};
          background: rgba(10, 10, 18, 0.8);
          box-shadow: 6px 6px 0 ${toRgba(themeColors.primary, 0.3)};
          transition: all 0.2s;
          cursor: pointer;
        }

        .pixel-card:hover {
          border-color: ${themeColors.secondary};
          box-shadow: 6px 6px 0 ${toRgba(themeColors.secondary, 0.5)}, 0 0 20px ${toRgba(themeColors.secondary, 0.3)};
          transform: translate(-2px, -2px);
        }

        .pixel-card:active {
          transform: translate(3px, 3px);
          box-shadow: 3px 3px 0 ${toRgba(themeColors.primary, 0.3)};
        }

        /* Hamburger menu */
        .hamburger-line {
          width: 24px;
          height: 3px;
          background: ${themeColors.primary};
          transition: all 0.3s;
          box-shadow: 0 0 5px ${toRgba(themeColors.primary, 0.5)};
        }

        .hamburger-open .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger-open .hamburger-line:nth-child(2) {
          opacity: 0;
        }

        .hamburger-open .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 280px;
          height: 100vh;
          background: rgba(10, 10, 18, 0.95);
          border-left: 3px solid ${themeColors.primary};
          z-index: 1000;
          padding: 2rem 1.5rem;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.8);
        }

        /* Ko-fi animations */
        .kofi-badge-highlight {
          animation: kofi-badge-pulse 8s ease-in-out infinite;
          will-change: transform, filter;
        }

        @keyframes kofi-badge-pulse {
          0%, 70%, 100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 18px 45px rgba(255, 153, 0, 0));
          }
          74% {
            transform: scale(1.12) rotate(-1.5deg);
            filter: drop-shadow(0 25px 60px rgba(255, 153, 0, 0.45));
          }
          78% {
            transform: scale(1.18) rotate(1deg);
            filter: drop-shadow(0 28px 70px rgba(255, 153, 0, 0.55));
          }
          82% {
            transform: scale(1.08) rotate(-0.4deg);
            filter: drop-shadow(0 22px 55px rgba(255, 153, 0, 0.4));
          }
        }

        .kofi-glow-ring {
          animation: kofi-glow-spin 9s linear infinite;
          filter: blur(30px);
          opacity: 0.9;
        }

        @keyframes kofi-glow-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* CRT Overlay */}
      <div className="crt-overlay" />

      {/* Header */}
      <header
        className="border-b-2 bg-[#0a0a12]/90 backdrop-blur-md sticky top-0 z-50"
        style={{ borderColor: `${themeColors.primary}4d` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo - icon only on mobile, full logo on desktop */}
          <div className="block sm:hidden">
            <Logo onClick={onVoltar} iconOnly={true} size={40} />
          </div>
          <div className="hidden sm:block">
            <Logo onClick={onVoltar} />
          </div>
          <div className="flex items-center gap-3">
            {/* Online now counter */}
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200 border border-white/20 rounded-full px-3 py-1 bg-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online now: {online}
            </span>
            <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hamburger ${sidebarOpen ? 'hamburger-open' : ''} flex flex-col gap-1.5 p-2 focus:outline-none`}
            aria-label="Menu"
            >
              <div className="hamburger-line" />
              <div className="hamburger-line" />
              <div className="hamburger-line" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 z-[999]"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="sidebar"
            >
              <div className="flex flex-col h-full">
                <h2
                  className="text-2xl font-bold mb-8"
                  style={{
                    fontFamily: 'Press Start 2P, cursive',
                    color: themeColors.primary,
                    textShadow: `0 0 10px ${toRgba(themeColors.primary, 0.5)}`,
                  }}
                >
                  CERTIFICATIONS
                </h2>

                <div className="flex-1 space-y-4 overflow-y-auto">
                  {certifications.map((cert) => {
                    const isSelected = selectedCertId === cert.id;

                    return (
                      <button
                        key={cert.id}
                        onClick={() => handleCertSelect(cert.id)}
                        className="w-full text-left px-4 py-3 border-2 transition-all duration-200 vt323-text text-xl"
                        style={{
                          borderColor: isSelected ? themeColors.primary : `${themeColors.primary}80`,
                          backgroundColor: isSelected ? `${themeColors.primary}33` : 'transparent',
                          color: themeColors.primary,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = themeColors.primary;
                            e.currentTarget.style.backgroundColor = `${themeColors.primary}1a`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = `${themeColors.primary}80`;
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {cert.id}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mt-6 mb-4" />

                {/* Highlighted CTA Buttons */}
                <div className="space-y-3 mb-4">
                  {/* LinkedIn Button */}
                  <a
                    href="https://www.linkedin.com/in/fabriciocosta85/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 border-2 border-[#00FFFF] bg-transparent text-[#00FFFF] text-center font-bold uppercase transition-all duration-200 hover:bg-[#00FFFF] hover:text-black hover:scale-105"
                    style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px', letterSpacing: '0.05em' }}
                  >
                    LINKEDIN
                  </a>

                  {/* Ko-fi Button */}
                  <a
                    href="https://ko-fi.com/fabriciocosta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 border-2 border-[#FF9900] bg-transparent text-[#FF9900] text-center font-bold uppercase transition-all duration-200 hover:bg-[#FF9900] hover:text-black hover:scale-105"
                    style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px', letterSpacing: '0.05em' }}
                  >
                    ☕ SUPPORT
                  </a>
                </div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full px-4 py-2 border-2 bg-transparent vt323-text text-lg font-bold uppercase transition-all duration-200"
                  style={{
                    borderColor: themeColors.secondary,
                    color: themeColors.secondary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.secondary;
                    e.currentTarget.style.color = '#0a0a12';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = themeColors.secondary;
                  }}
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: 'Press Start 2P, cursive',
              color: themeColors.primary,
              textShadow: `0 0 10px ${toRgba(themeColors.primary, 0.5)}`,
            }}
          >
            CHOOSE YOUR TRAINING
          </h1>
          <p className="vt323-text text-slate-300 text-2xl">
            Select a practice mode for the <span style={{ color: themeColors.secondary, fontWeight: 'bold' }}>{certName}</span> exam
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 max-w-5xl mx-auto mb-12">
          {/* Quiz Rápido */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onClick={onQuizRapido}
            className="pixel-card p-6"
          >
            <div className="flex flex-col gap-4 h-full">
              <div
                className="text-xl font-bold"
                style={{ fontFamily: 'Press Start 2P, cursive', color: themeColors.primary }}
              >
                QUICK QUIZ
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                35 questions with random selection from the complete bank. Ideal for daily training and reinforcing key concepts.
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                START &rarr;
              </span>
            </div>
          </motion.button>

          {/* Quiz Completo */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={onQuizCompleto}
            className="pixel-card p-6"
          >
            <div className="flex flex-col gap-4 h-full">
              <div
                className="text-xl font-bold"
                style={{ fontFamily: 'Press Start 2P, cursive', color: themeColors.primary }}
              >
                FULL QUIZ
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                65 questions in up to 130 minutes. Simulate the official exam experience with time control and detailed performance.
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                START &rarr;
              </span>
            </div>
          </motion.button>

          {/* Prática por Domínios */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={onDominios}
            className="pixel-card p-6"
          >
            <div className="flex flex-col gap-4 h-full">
              <div
                className="text-xl font-bold"
                style={{ fontFamily: 'Press Start 2P, cursive', color: themeColors.primary }}
              >
                BY DOMAINS
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                Focus on AWS official exam domains and track your progress by knowledge area.
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                START &rarr;
              </span>
            </div>
          </motion.button>

          {/* Modo Revisão */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={onRevisao}
            className="pixel-card p-6"
          >
            <div className="flex flex-col gap-4 h-full">
              <div
                className="text-xl font-bold"
                style={{ fontFamily: 'Press Start 2P, cursive', color: themeColors.primary }}
              >
                REVIEW MODE
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                Review at your pace, without time limit. Ideal for analyzing explanations and consolidating learning.
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                START &rarr;
              </span>
            </div>
          </motion.button>
        </div>

        {/* Ko-fi badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={() => kofiWidgetRef.current?.open()}
            className="relative inline-flex items-center justify-center rounded-3xl p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
            aria-label="Support on Ko-fi"
            title="Support on Ko-fi"
          >
            <div
              className="kofi-glow-ring absolute -inset-3 -z-10 rounded-[32px]"
              style={{
                background: 'conic-gradient(from 0deg, rgba(0, 255, 255, 0.85) 0%, rgba(255, 153, 0, 0.9) 35%, rgba(0, 255, 255, 0.9) 70%, rgba(255, 153, 0, 0.85) 100%)',
              }}
              aria-hidden="true"
            />
            <img
              src={kofiBadgeUrl}
              alt="Ko-fi"
              className="kofi-badge-highlight h-28 w-auto"
              loading="lazy"
            />
          </button>
        </motion.div>
      </main>

      <footer className="border-t-2 border-[#00FFFF]/30 py-8 px-4 bg-[#0a0a12]/90">
        <div className="max-w-7xl mx-auto text-center vt323-text text-slate-400 text-lg">
          <p>© 2025 CLOUD.VERSE · Fabricio Felix</p>
          <p className="mt-3 text-base text-slate-500">
            This platform is not affiliated with Amazon Web Services.
          </p>
        </div>
      </footer>

      <KofiWidget ref={kofiWidgetRef} desktopOnly showFloatingButton={false} className="pointer-events-auto" />
    </div>
  );
};
