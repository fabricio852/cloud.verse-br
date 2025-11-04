import React from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/common/Logo";
import { FeatureItem } from "../components/landing/FeatureItem";
import { TestimonialsCarousel } from "../components/landing/TestimonialsCarousel";

interface LandingPageProps {
  onStart: () => void;
}

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
  const handleAction = () => onStart();

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
                <Button onClick={handleAction} className="btn-glow">
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

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white/[0.03] border border-white/15 rounded-3xl p-12 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.95)]"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
                Pronto para passar de primeira?
              </h2>
              <p className="text-gray-300 mb-8 text-base md:text-lg leading-relaxed">
                Comece pelo quiz rápido, aprofunde-se nos domínios específicos, revise suas marcações e finalize com o simulado completo.
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button onClick={handleAction} className="btn-glow">
                  Começar agora
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2025 Nuvem Azul · Fabrício Félix — Todos os direitos reservados</p>
          <p className="mt-3 text-xs text-gray-500">
            Esta plataforma não é afiliada, patrocinada ou endossada pela Amazon Web Services.
          </p>
        </div>
      </footer>
    </div>
  );
};
