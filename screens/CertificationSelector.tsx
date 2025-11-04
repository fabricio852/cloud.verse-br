import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCertificationStore } from '../store/certificationStore';
import { Logo } from '../components/common/Logo';
import { ScreenTransition } from '../components/common/PageTransition';

interface CertificationSelectorProps {
  onSelect: () => void;
}

const GRADIENTS: Record<string, string> = {
  'CLF-C02': 'from-teal-300/60 via-cyan-400/50 to-emerald-300/65',
  'SAA-C03': 'from-violet-400/65 via-indigo-500/50 to-blue-500/55',
  'AIF-C01': 'from-rose-500/65 via-red-500/50 to-orange-400/60',
};

const INDICATOR_COLORS: Record<string, string> = {
  'CLF-C02': 'bg-cyan-300/85',
  'SAA-C03': 'bg-violet-300/85',
  'AIF-C01': 'bg-rose-300/85',
};

export const CertificationSelector: React.FC<CertificationSelectorProps> = ({ onSelect }) => {
  const { certifications, fetchCertifications, selectCertification, isLoading } = useCertificationStore();

  useEffect(() => {
    if (certifications.length === 0) {
      fetchCertifications();
    }
  }, [certifications.length, fetchCertifications]);

  const handleSelect = (certId: string) => {
    selectCertification(certId);
    onSelect();
  };

  return (
    <ScreenTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#070312] text-slate-100">
        <style>{`
          .animated-bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
            z-index: 0;
          }
          .gradient-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(70px);
            will-change: transform;
          }
          .gradient-blob-1 {
            width: 540px;
            height: 540px;
            top: -220px;
            left: -160px;
            background: radial-gradient(circle, rgba(147, 51, 234, 0.55), rgba(147, 51, 234, 0.18) 55%, transparent 70%);
            animation: blob-drift-1 14s ease-in-out infinite;
          }
          .gradient-blob-2 {
            width: 480px;
            height: 480px;
            top: -140px;
            right: -180px;
            background: radial-gradient(circle, rgba(6, 182, 212, 0.5), rgba(6, 182, 212, 0.16) 55%, transparent 70%);
            animation: blob-drift-2 17s ease-in-out infinite;
          }
          .gradient-blob-3 {
            width: 520px;
            height: 520px;
            bottom: -200px;
            left: 12%;
            background: radial-gradient(circle, rgba(249, 115, 22, 0.5), rgba(249, 115, 22, 0.18) 55%, transparent 70%);
            animation: blob-drift-3 20s ease-in-out infinite;
          }
          @keyframes blob-drift-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(140px, 110px) scale(1.18); }
          }
          @keyframes blob-drift-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-130px, 130px) scale(1.15); }
          }
          @keyframes blob-drift-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(120px, -90px) scale(1.23); }
          }
        `}</style>

        <div className="animated-bg" aria-hidden="true">
          <div className="gradient-blob gradient-blob-1" />
          <div className="gradient-blob gradient-blob-2" />
          <div className="gradient-blob gradient-blob-3" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <Logo />
            <div>
              <h1 className="text-3xl md:text-[2.6rem] font-semibold tracking-tight text-white">
                Escolha o exame que deseja praticar
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-300 max-w-xl mx-auto">
                Selecionamos os principais exames AWS. Escolha um para entrar direto nos modos de quiz e começar a praticar agora.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 w-full max-w-3xl space-y-5"
          >
            {isLoading && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-slate-300">
                Carregando certificações...
              </div>
            )}

            {!isLoading &&
              certifications.map((cert) => {
                const examCode = cert.id;

                return (
                  <button
                    key={cert.id}
                    onClick={() => handleSelect(cert.id)}
                    className="group relative w-full overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] px-6 py-7 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_45px_120px_-60px_rgba(9,20,45,0.85)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-white/12 to-white/4 opacity-80 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />
                    <div
                      className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-95 transition duration-500 bg-gradient-to-br ${
                        GRADIENTS[cert.id] ?? 'from-slate-500/25 via-slate-500/15 to-slate-500/30'
                      }`}
                    />
                    <div className="relative flex flex-col gap-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-2">
                          {examCode && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-100/80">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  INDICATOR_COLORS[cert.id] ?? 'bg-sky-300/80'
                                }`}
                              />
                              {examCode}
                            </div>
                          )}
                          <div className="text-2xl md:text-[26px] font-semibold text-white">
                            {cert.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                          Iniciar <span aria-hidden="true">&rarr;</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-200/80 transition-colors duration-300 group-hover:text-white">
                        {cert.description}
                      </p>
                    </div>
                  </button>
                );
              })}

            {!isLoading && certifications.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-slate-300">
                Nenhuma certificação encontrada. Verifique sua conexão ou tente novamente mais tarde.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ScreenTransition>
  );
};
