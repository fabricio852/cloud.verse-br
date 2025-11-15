import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/common/Logo';
import { useCertificationStore } from '../store/certificationStore';
import { ThemedDonationModal } from '../components/donation/ThemedDonationModal';
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
  const { t } = useTranslation(['dashboard', 'common']);
  const { certifications, selectCertification, selectedCertId } = useCertificationStore();
  const channel = selectedCertId ? `presence:cert:${selectedCertId}` : 'presence:site';
  const { online } = useOnlinePresence(channel);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
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
              {t('common:header.online_now', { count: online })}
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
                  {t('common:sidebar.certifications')}
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
                    {t('common:sidebar.linkedin')}
                  </a>

                  {/* Ko-fi Button */}
                  <a
                    href="https://ko-fi.com/fabriciocosta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 border-2 border-[#FF9900] bg-transparent text-[#FF9900] text-center font-bold uppercase transition-all duration-200 hover:bg-[#FF9900] hover:text-black hover:scale-105"
                    style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px', letterSpacing: '0.05em' }}
                  >
                    {t('common:sidebar.support')}
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
                  {t('common:sidebar.close')}
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
            {t('dashboard:header.title')}
          </h1>
          <p className="vt323-text text-slate-300 text-2xl">
            {t('dashboard:header.subtitle', { cert: certName })}
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
                {t('dashboard:modes.quick_quiz.title')}
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                {t('dashboard:modes.quick_quiz.description')}
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                {t('common:buttons.start_arrow')}
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
                {t('dashboard:modes.full_quiz.title')}
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                {t('dashboard:modes.full_quiz.description')}
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                {t('common:buttons.start_arrow')}
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
                {t('dashboard:modes.by_domains.title')}
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                {t('dashboard:modes.by_domains.description')}
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                {t('common:buttons.start_arrow')}
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
                {t('dashboard:modes.review_mode.title')}
              </div>
              <p className="vt323-text text-lg text-slate-300 flex-1">
                {t('dashboard:modes.review_mode.description')}
              </p>
              <span className="vt323-text text-base font-bold uppercase" style={{ color: themeColors.secondary }}>
                {t('common:buttons.start_arrow')}
              </span>
            </div>
          </motion.button>
        </div>

        {/* Support button - PIX donations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={() => setDonationModalOpen(true)}
            whileTap={{ scale: 0.95 }}
            className="support-btn-shake inline-flex items-center gap-3 px-10 py-5 border-2 border-[#FF9900] bg-[#FF9900]/10 text-[#FF9900] vt323-text text-2xl font-bold uppercase transition-all duration-200 hover:bg-[#FF9900] hover:text-[#0a0a12] hover:shadow-[0_0_20px_rgba(255,153,0,0.6)]"
          >
            <span className="text-3xl">♥</span>
            Apoiar com PIX
          </motion.button>
        </motion.div>

        <style>{`
          @keyframes support-shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-2px, -1px) rotate(-1deg); }
            20% { transform: translate(2px, 1px) rotate(1deg); }
            30% { transform: translate(-2px, 1px) rotate(-1deg); }
            40% { transform: translate(2px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-0.5deg); }
            60% { transform: translate(1px, -2px) rotate(0.5deg); }
            70% { transform: translate(-1px, -1px) rotate(-0.5deg); }
            80% { transform: translate(1px, 1px) rotate(0.5deg); }
            90% { transform: translate(-1px, 0px) rotate(0deg); }
          }

          .support-btn-shake {
            animation: support-shake 3s ease-in-out 2s infinite;
          }

          .support-btn-shake:hover {
            animation: none;
          }
        `}</style>
      </main>

      <footer className="border-t-2 border-[#00FFFF]/30 py-8 px-4 bg-[#0a0a12]/90">
        <div className="max-w-7xl mx-auto text-center vt323-text text-slate-400 text-lg">
          <p>{t('common:footer.copyright')}</p>
          <p className="mt-3 text-base text-slate-500">
            {t('common:footer.disclaimer')}
          </p>
        </div>
      </footer>

      {/* Donation Modal */}
      <ThemedDonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        pixKey="00000000000" // TODO: Configure with actual PIX key
        pixReceiverName="Cloud Verse" // TODO: Configure with actual receiver name
        pixReceiverCity="São Paulo" // TODO: Configure with actual receiver city
        theme="landing"
      />
    </div>
  );
};
