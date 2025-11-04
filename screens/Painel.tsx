import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { MoonIcon, SunIcon } from '../components/common/Icons';
import { CertificationSidebar } from '../components/common/CertificationSidebar';
import { Modal } from '../components/ui/Modal';
import { useCertificationStore } from '../store/certificationStore';
import { KofiWidget } from '../components/quiz/KofiWidget';

interface PainelProps {
  totalQuestoes: number;
  onQuizRapido: () => void;
  onQuizCompleto: () => void;
  onDominios: () => void;
  onRevisao: () => void;
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

type ModeKey = 'quizRapido' | 'quizCompleto' | 'dominios' | 'revisao';

const MODE_SUGGESTIONS: Record<ModeKey, string[]> = {
  quizRapido: [
    'Treino de Reflexo — responde sob pressão leve, fortalecendo raciocínio automático e memorização instantânea.',
    'Pílulas de Conceito — fragmenta o estudo em microsessões de 15 minutos que sedimentam os fundamentos.',
    'Ritmo Diário — transforma a prática em hábito, permitindo acompanhar evolução diária sem sobrecarga.',
  ],
  quizCompleto: [
    'Simulação Real — replica o ambiente do exame oficial, calibrando tempo, foco e resistência mental.',
    'Diagnóstico Profundo — revela lacunas estruturais no conhecimento e orienta revisões estratégicas.',
    'Teste de Fôlego — mede a capacidade de concentração prolongada, essencial para provas extensas.',
  ],
  dominios: [
    'Treino Focado — isola áreas temáticas, permitindo avanço seletivo em tópicos com maior peso no exame.',
    'Mapa de Força — identifica pontos fortes e fracos de cada domínio para otimizar o plano de estudo.',
    'Mastery Mode — repete padrões dentro de um mesmo domínio até atingir fluência cognitiva.',
  ],
  revisao: [
    'Revisão Expandida — percorre cada questão com explicações e contexto, reforçando entendimento conceitual.',
    'Consolidação — transforma erros em aprendizado ativo, fortalecendo memórias de longo prazo.',
    'Descompressão — reduz ansiedade pré-prova ao revisar sem limite de tempo nem cobrança de desempenho.',
  ],
};

const MODE_LABELS: Record<ModeKey, string> = {
  quizRapido: 'Quiz Rápido',
  quizCompleto: 'Quiz Completo',
  dominios: 'Prática por Domínios',
  revisao: 'Modo Revisão',
};

const SUGGESTION_POOL = (Object.keys(MODE_SUGGESTIONS) as ModeKey[]).flatMap((mode) =>
  MODE_SUGGESTIONS[mode].map((text) => ({
    mode,
    text,
  }))
);

export const Painel: React.FC<PainelProps> = ({
  totalQuestoes,
  onQuizRapido,
  onQuizCompleto,
  onDominios,
  onRevisao,
  theme = 'dark',
  toggleTheme,
}) => {
  const { getTheme } = useCertificationStore();
  const certTheme = getTheme();
  const [showMobileCertModal, setShowMobileCertModal] = useState(false);
  const isLight = theme === 'light';
  void totalQuestoes; // mantido para compatibilidade sem exibir contador
  const [suggestionIndex, setSuggestionIndex] = useState(() =>
    SUGGESTION_POOL.length > 0 ? Math.floor(Math.random() * SUGGESTION_POOL.length) : 0
  );
  const currentSuggestion =
    SUGGESTION_POOL.length > 0
      ? SUGGESTION_POOL[suggestionIndex % SUGGESTION_POOL.length]
      : null;

  useEffect(() => {
    if (SUGGESTION_POOL.length === 0) return;
    setSuggestionIndex(Math.floor(Math.random() * SUGGESTION_POOL.length));
  }, [certTheme.shortName]);

  useEffect(() => {
    if (SUGGESTION_POOL.length === 0) return undefined;
    const interval = window.setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTION_POOL.length);
    }, 9000);

    return () => window.clearInterval(interval);
  }, []);

  const palette = useMemo(() => ({
    surface: isLight
      ? `linear-gradient(140deg, ${toRgba('#ffffff', 0.96)} 0%, ${toRgba(certTheme.primary, 0.1)} 45%, ${toRgba(certTheme.secondary, 0.08)} 100%)`
      : '#070312',
    headerGradient: isLight
      ? `linear-gradient(120deg, ${toRgba('#ffffff', 0.92)} 0%, ${toRgba(certTheme.primary, 0.22)} 55%, ${toRgba(certTheme.secondary, 0.16)} 100%)`
      : `linear-gradient(120deg, ${toRgba(certTheme.primary, 0.18)} 0%, rgba(7, 3, 18, 0.9) 45%, ${toRgba(certTheme.secondary, 0.18)} 100%)`,
    headerBorder: toRgba(certTheme.primary, isLight ? 0.18 : 0.32),
    sidebarBg: isLight
      ? `linear-gradient(155deg, ${toRgba('#ffffff', 0.94)} 0%, ${toRgba(certTheme.primary, 0.14)} 70%)`
      : `linear-gradient(160deg, ${toRgba(certTheme.primary, 0.22)} 0%, ${toRgba(certTheme.secondary, 0.18)} 55%, rgba(7, 3, 18, 0.88) 100%)`,
    sidebarBorder: toRgba(certTheme.primary, isLight ? 0.22 : 0.5),
    cardBorder: toRgba(certTheme.primary, isLight ? 0.22 : 0.55),
    cardBackground: isLight
      ? `linear-gradient(145deg, ${toRgba('#ffffff', 0.94)} 0%, ${toRgba(certTheme.primary, 0.16)} 48%, ${toRgba(certTheme.secondary, 0.12)} 100%)`
      : `linear-gradient(150deg, ${toRgba(certTheme.primary, 0.18)} 0%, ${toRgba(certTheme.secondary, 0.12)} 45%, rgba(11, 17, 32, 0.78) 100%)`,
    cardGlow: `radial-gradient(circle at 12% 0%, ${toRgba(certTheme.accent, 0.26)} 0%, transparent 55%)`,
    cardShadow: isLight
      ? '0 22px 55px -38px rgba(15, 23, 42, 0.28)'
      : '0 32px 120px -60px rgba(8, 15, 30, 0.95)',
    cardHoverShadow: isLight
      ? '0 26px 62px -40px rgba(15, 23, 42, 0.32)'
      : `0 46px 125px -65px ${toRgba(certTheme.accent, 0.72)}`,
  }), [certTheme, isLight]);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-500 dark:bg-[#070312] dark:text-slate-100"
      style={{ background: palette.surface }}
    >
      <style>{`
        .panel-animated-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }
        .panel-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(${isLight ? 48 : 72}px);
          opacity: ${isLight ? 0.55 : 0.72};
          will-change: transform;
          mix-blend-mode: ${isLight ? 'screen' : 'normal'};
        }
        .panel-blob-1 {
          width: 560px;
          height: 560px;
          top: -240px;
          left: -200px;
          animation: panel-drift-1 16s ease-in-out infinite;
        }
        .panel-blob-2 {
          width: 540px;
          height: 540px;
          top: -200px;
          right: -220px;
          animation: panel-drift-2 20s ease-in-out infinite;
        }
        .panel-blob-3 {
          width: 520px;
          height: 520px;
          bottom: -220px;
          left: 18%;
          animation: panel-drift-3 18s ease-in-out infinite;
        }
        @keyframes panel-drift-1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(140px, 110px, 0) scale(1.22); }
        }
        @keyframes panel-drift-2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-150px, 140px, 0) scale(1.18); }
        }
        @keyframes panel-drift-3 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(120px, -120px, 0) scale(1.25); }
        }
        .themed-card {
          border: 1px solid ${palette.cardBorder};
          background: ${palette.cardBackground};
          box-shadow: ${palette.cardShadow};
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .themed-card::before {
          content: '';
          position: absolute;
          inset: -60% -25%;
          background: ${palette.cardGlow};
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .themed-card:hover::before {
          opacity: 1;
        }
        .themed-card:not(.disabled):hover {
          transform: translateY(-6px);
          border-color: ${toRgba(certTheme.accent, isLight ? 0.52 : 0.76)};
          box-shadow: ${palette.cardHoverShadow};
        }
        .themed-card.disabled {
          opacity: 0.6;
        }
      `}</style>

      <div className="panel-animated-bg" aria-hidden="true">
        <div
          className="panel-blob panel-blob-1"
          style={{
            background: `radial-gradient(circle, ${toRgba(certTheme.primary, isLight ? 0.48 : 0.62)} 0%, ${toRgba(certTheme.primary, 0.18)} 52%, transparent 72%)`,
          }}
        />
        <div
          className="panel-blob panel-blob-2"
          style={{
            background: `radial-gradient(circle, ${toRgba(certTheme.secondary, isLight ? 0.45 : 0.55)} 0%, ${toRgba(certTheme.secondary, 0.16)} 52%, transparent 70%)`,
          }}
        />
        <div
          className="panel-blob panel-blob-3"
          style={{
            background: `radial-gradient(circle, ${toRgba(certTheme.accent, isLight ? 0.42 : 0.58)} 0%, ${toRgba(certTheme.accent, 0.16)} 52%, transparent 72%)`,
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="relative border-b border-white/20 backdrop-blur-lg dark:border-white/10">
          <div
            className="absolute inset-0 opacity-95 dark:opacity-90"
            style={{ background: palette.headerGradient, borderColor: palette.headerBorder }}
            aria-hidden="true"
          />

          <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Logo />
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-800/90 dark:bg-white/10 dark:text-white/90">
                {certTheme.shortName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileCertModal(true)}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-white/95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 sm:hidden"
              >
                {certTheme.shortName}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className="rounded-full border border-white/30 bg-white/80 p-2 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                  aria-label="Alternar tema"
                >
                  {isLight ? <MoonIcon /> : <SunIcon />}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <aside className="hidden w-72 flex-shrink-0 lg:block">
                <div
                  className="sticky top-24 rounded-2xl border p-5 shadow-[0_30px_90px_-60px_rgba(7,3,18,0.85)] backdrop-blur-xl"
                  style={{
                    background: palette.sidebarBg,
                    borderColor: palette.sidebarBorder,
                  }}
                >
                  <CertificationSidebar />
                </div>
              </aside>

              <section className="flex-1 space-y-8">
                <div className="rounded-2xl border border-white/10 bg-white/50 p-6 shadow-[0_35px_120px_-70px_rgba(8,15,30,0.95)] backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.04]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Como você quer praticar hoje?
                      </h1>
                      <AnimatePresence mode="wait">
                        {currentSuggestion ? (
                          <motion.div
                            key={`${currentSuggestion.mode}-${suggestionIndex}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="mt-4 space-y-3"
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300/75">
                              {MODE_LABELS[currentSuggestion.mode]}
                            </span>
                            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-200/85">
                              {currentSuggestion.text}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.p
                            key="default-description"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300/90"
                          >
                            {certTheme.description}. Escolha um modo de estudo para continuar a preparação para o exame selecionado.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <button onClick={onQuizRapido} className="themed-card relative rounded-xl p-5 text-left">
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-slate-900 dark:text-white">
                          Quiz Rápido
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200/80">
                          35 questões com seleção aleatória do banco completo. Ideal para treinar diariamente e reforçar conceitos-chave.
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300/70">
                        Iniciar →
                      </span>
                    </div>
                  </button>

                  <button onClick={onQuizCompleto} className="themed-card relative rounded-xl p-5 text-left">
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-slate-900 dark:text-white">
                          Quiz Completo
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200/80">
                          65 questões em até 130 minutos. Simule a experiência oficial do exame com controle de tempo e desempenho detalhado.
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300/70">
                        Iniciar →
                      </span>
                    </div>
                  </button>

                  <button onClick={onDominios} className="themed-card relative rounded-xl p-5 text-left">
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-slate-900 dark:text-white">
                          Prática por Domínios
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200/80">
                          Foque nos domínios da prova oficial da AWS e acompanhe sua evolução por área de conhecimento.
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300/70">
                        Iniciar →
                      </span>
                    </div>
                  </button>

                  <button onClick={onRevisao} className="themed-card relative rounded-xl p-5 text-left">
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-slate-900 dark:text-white">
                          Modo Revisão
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200/80">
                          Revise com calma, sem limite de tempo. Ideal para analisar explicações e consolidar o aprendizado.
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300/70">
                        Iniciar →
                      </span>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/15 bg-white/10 py-6 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          Copyright 2025 Nuvem Azul - Fabricio Felix - Nao afiliado a Amazon Web Services.
        </footer>
      </div>

      <KofiWidget desktopOnly className="pointer-events-auto" />

      <Modal
        open={showMobileCertModal}
        onClose={() => setShowMobileCertModal(false)}
        title="Selecione"
      >
        <div className="space-y-3">
          <CertificationSidebar />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowMobileCertModal(false)}
            className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Fechar
          </button>
        </div>
      </Modal>
    </div>
  );
};
