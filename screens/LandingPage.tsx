import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/common/Logo";
import { FeatureItem } from "../components/landing/FeatureItem";
import { TestimonialsCarousel } from "../components/landing/TestimonialsCarousel";
import { useCertificationStore } from "../store/certificationStore";

interface LandingPageProps {
  onStart: () => void;
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

const features = [
  {
    title: "Quiz Rápido",
    description: "Sessões de 20-35 questões para treinar diariamente, revisando explicações detalhadas logo após cada envio.",
  },
  {
    title: "Simulado Completo",
    description: "Experimente o formato oficial com 65 questões e 130 minutos. Controle o tempo e simule a pressão do exame real.",
  },
  {
    title: "Modo Revisão",
    description: "Reveja questões respondidas, marque favoritas e compare alternativas para fixar os conceitos antes do dia da prova.",
  },
  {
    title: "Prática por Domínio",
    description: "Monte sessões personalizadas focando nos domínios que você precisa reforçar e acompanhe métricas por tema.",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { certifications, fetchCertifications, selectCertification, isLoading } = useCertificationStore();

  useEffect(() => {
    if (certifications.length === 0) {
      fetchCertifications();
    }
  }, [certifications.length, fetchCertifications]);

  const handleCertSelect = (certId: string) => {
    selectCertification(certId);
    onStart();
  };

  const handleScrollToCerts = () => {
    const certSection = document.getElementById('certification-section');
    if (certSection) {
      certSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070312] text-slate-100">
      <style>{`
        .lp-hero-section {
          position: relative;
          overflow: hidden;
        }
        .lp-hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(147, 51, 234, 0.15) 1.5px, transparent 1.5px),
            linear-gradient(rgba(147, 51, 234, 0.15) 1.5px, transparent 1.5px);
          background-size: 50px 50px;
          animation: grid-flow 15s linear infinite;
          opacity: 1;
          z-index: 0;
          will-change: transform;
        }
        @keyframes grid-flow {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(50px) translateX(50px); }
        }
        .animated-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        .gradient-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          will-change: transform;
        }
        .gradient-blob-1 {
          width: 600px;
          height: 600px;
          top: -250px;
          left: -200px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.6), rgba(147, 51, 234, 0.2) 50%, transparent 70%);
          animation: blob-drift-1 12s ease-in-out infinite;
        }
        .gradient-blob-2 {
          width: 500px;
          height: 500px;
          top: -150px;
          right: -200px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.5), rgba(6, 182, 212, 0.2) 50%, transparent 70%);
          animation: blob-drift-2 15s ease-in-out infinite;
        }
        .gradient-blob-3 {
          width: 450px;
          height: 450px;
          bottom: -200px;
          left: 15%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.5), rgba(249, 115, 22, 0.2) 50%, transparent 70%);
          animation: blob-drift-3 18s ease-in-out infinite;
        }
        @keyframes blob-drift-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(150px, 100px) scale(1.2);
          }
        }
        @keyframes blob-drift-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-120px, 120px) scale(1.15);
          }
        }
        @keyframes blob-drift-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(100px, -100px) scale(1.25);
          }
        }
        .lp-accent-bar {
          height: 3px;
          background: linear-gradient(90deg, rgba(59,130,246,0.85) 0%, rgba(168,85,247,0.95) 45%, rgba(249,115,22,0.9) 100%);
        }
        .lp-section-panel {
          background: linear-gradient(140deg, rgba(30, 64, 175, 0.15), rgba(99, 102, 241, 0.12));
        }
        .lp-community-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .btn-glow {
          position: relative;
          overflow: hidden;
          border-radius: 9999px;
          padding: 0.75rem 2.5rem;
          font-weight: 600;
          color: #fff;
          background: #070312;
          border: 2px solid transparent;
          background-image: linear-gradient(#070312, #070312), linear-gradient(135deg, #3b82f6 0%, #a855f7 45%, #f97316 100%);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }
        .btn-glow::before {
          content: '';
          position: absolute;
          inset: -140%;
          background: linear-gradient(135deg, rgba(59,130,246,0.5), rgba(168,85,247,0.55), rgba(249,115,22,0.55));
          filter: blur(50px);
          transform: rotate(25deg);
          animation: btn-glow 8s linear infinite;
          opacity: 0.75;
        }
        .btn-glow:hover {
          filter: brightness(1.08);
          box-shadow: 0 22px 70px -35px rgba(147,51,234,0.95);
        }
        @keyframes btn-glow {
          0% { transform: translateX(-45%) rotate(25deg); }
          50% { transform: translateX(45%) rotate(25deg); }
          100% { transform: translateX(-45%) rotate(25deg); }
        }
      `}</style>

      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main>
        <section className="pt-12 pb-8 px-4 lp-hero-section">
          <div className="animated-bg">
            <div className="gradient-blob gradient-blob-1" />
            <div className="gradient-blob gradient-blob-2" />
            <div className="gradient-blob gradient-blob-3" />
          </div>
          <div className="relative max-w-5xl mx-auto text-center px-6 pt-6 pb-6 z-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-4">
                Domine as certificações <span className="font-bold">AWS</span>
                <br />
                <span className="italic-elegant">sem pagar nada</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-200/90 leading-relaxed mb-5 max-w-3xl mx-auto">
                Estude com foco e precisão com simulados atualizados
              </p>
              <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-slate-400 mb-8">
                Cloud Practitioner · Solutions Architect · AI Practitioner
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button onClick={handleScrollToCerts} className="btn-glow">
                  Começar agora
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="lp-accent-bar" />

        <section className="pt-10 pb-4 px-4 border-y border-white/5 bg-gradient-to-br from-[#0b061f] via-[#120a2b] to-[#1c0f3d]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid gap-4 lg:gap-6 lg:grid-cols-2 lg:items-center xl:gap-8"
            >
              <div className="flex flex-col gap-3 text-center lg:text-left">
                <div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                    Junte-se a centenas de profissionais aprovados
                  
                  </h3>

                  <p className="text-slate-200/85 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                    Questões fiéis aos exames oficiais, com métricas e modos de estudo pensados para acelerar sua preparação
                  </p>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <TestimonialsCarousel
                  variant="embedded"
                  seed={new Date().toISOString().slice(0, 10)}
                  max={9}
                  height={220}
                  className="w-full max-w-[540px] xl:max-w-[640px]"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pt-10 pb-6 px-4 lp-section-panel border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6"
            >
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">
                Um ambiente de estudo focado no resultado
              </h2>
              <p className="text-slate-300">
                Ferramentas essenciais para maximizar seu desempenho e aprovar na primeira tentativa.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureItem
                  key={feature.title}
                  {...feature}
                  order={index + 1}
                  delay={0.6 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="certification-section" className="py-16 px-4 bg-gradient-to-br from-[#0b061f] via-[#120a2b] to-[#1c0f3d] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
                Escolha sua certificação
              </h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Selecione o exame AWS que deseja praticar e acesse todos os modos de estudo disponíveis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-5 max-w-3xl mx-auto"
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
                      onClick={() => handleCertSelect(cert.id)}
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
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-[#0d0228] via-[#14063a] to-[#1d0b46] p-10 md:p-12 shadow-[0_60px_140px_-80px_rgba(99,102,241,0.6)]"
            >
              <div className="pointer-events-none absolute -top-32 -left-24 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/35 via-purple-500/25 to-transparent blur-[120px]" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-32 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/25 via-pink-500/20 to-transparent blur-[130px]" aria-hidden="true" />

              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="relative">
                  <div className="w-32 h-32 rounded-full border border-white/20 p-[3px] shadow-lg shadow-black/40">
                    <div className="w-full h-full rounded-full bg-black/70 flex items-center justifycenter overflow-hidden">
                      <img
                        src="/profile.jpg"
                        alt="Fabrício Félix"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML =
                            '<div class=\"text-xl tracking-wide\">Imagem</div>';
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">
                    Fabrício Félix
                  </h3>
                  <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-indigo-200/80 mb-6">
                    2x AWS Certified · Criador da plataforma
                  </p>
                  <p className="text-slate-200 mb-6 leading-relaxed text-base">
                    Crio simulados gratuitos para exames de certificação da AWS. Desenvolvi esta plataforma do zero porque acredito que preparação de qualidade é direito de todos.
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <motion.a
                      href="https://www.linkedin.com/in/fabriciocosta85/"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 border border-white/20 bg-black/40 text-white px-6 py-3 rounded-full transition-all duration-200 hover:bg-white hover:text-slate-900 font-medium"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                      </svg>
                      Conectar no LinkedIn
                    </motion.a>
                    <motion.a
                      href="https://ko-fi.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 text-white bg-gradient-to-r from-rose-500 via-fuchsia-500 to-orange-400 shadow-[0_18px_45px_-30px_rgba(217,70,239,0.75)] hover:brightness-110"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M5.5 3A2.5 2.5 0 0 0 3 5.5v11A4.5 4.5 0 0 0 7.5 21H15a6 6 0 0 0 5.966-5.284l.496-4A4.5 4.5 0 0 0 17 7h-1V5.5A2.5 2.5 0 0 0 13.5 3h-8Z" />
                      </svg>
                      Contribuir no Ko-fi
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2025 BluCloud · Fabrício Félix — Todos os direitos reservados</p>
          <p className="mt-3 text-xs text-gray-500">
            Esta plataforma não é afiliada, patrocinada ou endossada pela Amazon Web Services.
          </p>
        </div>
      </footer>
    </div>
  );
};
