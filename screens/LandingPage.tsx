import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "../components/common/Logo";
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

// Cores específicas para cada certificação
const CERT_COLORS: Record<string, { border: string; borderHover: string; text: string; badge: string; shadow: string }> = {
  'CLF-C02': {
    border: '#06b6d4', // cyan-500
    borderHover: '#22d3ee', // cyan-400
    text: '#06b6d4',
    badge: '#06b6d4',
    shadow: 'rgba(6, 182, 212, 0.4)',
  },
  'SAA-C03': {
    border: '#8b5cf6', // violet-500
    borderHover: '#a78bfa', // violet-400
    text: '#8b5cf6',
    badge: '#8b5cf6',
    shadow: 'rgba(139, 92, 246, 0.4)',
  },
  'AIF-C01': {
    border: '#f97316', // orange-500
    borderHover: '#fb923c', // orange-400
    text: '#f97316',
    badge: '#f97316',
    shadow: 'rgba(249, 115, 22, 0.4)',
  },
};

// Ko-fi badge asset (same used in exam mode panel)
const kofiBadgeUrl = new URL('../support_me_on_kofi_badge_beige.png', import.meta.url).href;

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { certifications, fetchCertifications, selectCertification, isLoading } = useCertificationStore();

  useEffect(() => {
    if (certifications.length === 0) {
      fetchCertifications();
    }
  }, [certifications.length, fetchCertifications]);

  // Efeito de digitação EXACTO conforme solicitado (mantido literalmente)
  useEffect(() => {
        const phrases = [
            "Gear up for SAA-C03...",
            "Level up your cloud skills...",
            "Dive into Generative AI (AIF-C01)...",
            "Opportunity for everyone."
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeElement = document.getElementById('typewriter');

        function typeWriter() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typeElement.innerText = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typeElement.innerText = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let timeout = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentPhrase.length) {
                timeout = 2500;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                timeout = 500;
            }
            setTimeout(typeWriter, timeout);
        }

        // inicia
        typeWriter();
  }, []);

  // --- Canvas Particles (Cloud Data Flow) ---
  useEffect(() => {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number, particles: any[] = [];
    
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    class Particle {
        x: number; y: number; size: number; speedY: number; color: string; opacity: number;
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.speedY = Math.random() * 0.5 + 0.2; 
            this.color = Math.random() > 0.8 ? '#FF9900' : (Math.random() > 0.5 ? '#00FFFF' : '#333');
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.y -= this.speedY;
            if (this.y < 0) {
                this.y = height;
                this.x = Math.random() * width;
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.globalAlpha = 1;
        }
    }

    function initParticles() {
        particles = [];
        let count = (width * height) / 9000;
        for(let i=0; i<count; i++) particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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

  // Hover state dos cards para destacar borda
  const [hoveredCertId, setHoveredCertId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-slate-100 relative overflow-hidden">
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

        /* Glitch effect */
        .glitch {
          position: relative;
          font-family: 'Press Start 2P', cursive;
          font-size: 3rem;
          line-height: 1.3;
          color: #00FFFF;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          animation: glitch-skew 2s infinite;
        }

        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch::before {
          left: 2px;
          text-shadow: -2px 0 #FF9900;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 3s infinite linear alternate-reverse;
        }

        .glitch::after {
          left: -2px;
          text-shadow: -2px 0 #00FFFF, 2px 2px #FF9900;
          animation: glitch-anim2 2s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim {
          0% { clip: rect(10px, 9999px, 31px, 0); transform: skew(0.3deg); }
          5% { clip: rect(70px, 9999px, 71px, 0); transform: skew(0.5deg); }
          10% { clip: rect(60px, 9999px, 85px, 0); transform: skew(0.2deg); }
          15% { clip: rect(80px, 9999px, 20px, 0); transform: skew(0.4deg); }
          20% { clip: rect(40px, 9999px, 50px, 0); transform: skew(0.1deg); }
          25% { clip: rect(30px, 9999px, 90px, 0); transform: skew(0.6deg); }
          30% { clip: rect(10px, 9999px, 60px, 0); transform: skew(0.3deg); }
          35% { clip: rect(90px, 9999px, 30px, 0); transform: skew(0.2deg); }
          40% { clip: rect(50px, 9999px, 70px, 0); transform: skew(0.4deg); }
          45% { clip: rect(20px, 9999px, 80px, 0); transform: skew(0.5deg); }
          50% { clip: rect(70px, 9999px, 40px, 0); transform: skew(0.1deg); }
          55% { clip: rect(35px, 9999px, 65px, 0); transform: skew(0.3deg); }
          60% { clip: rect(85px, 9999px, 25px, 0); transform: skew(0.4deg); }
          65% { clip: rect(45px, 9999px, 75px, 0); transform: skew(0.2deg); }
          70% { clip: rect(15px, 9999px, 55px, 0); transform: skew(0.5deg); }
          75% { clip: rect(65px, 9999px, 35px, 0); transform: skew(0.1deg); }
          80% { clip: rect(25px, 9999px, 95px, 0); transform: skew(0.3deg); }
          85% { clip: rect(75px, 9999px, 15px, 0); transform: skew(0.4deg); }
          90% { clip: rect(55px, 9999px, 45px, 0); transform: skew(0.2deg); }
          95% { clip: rect(5px, 9999px, 85px, 0); transform: skew(0.6deg); }
          100% { clip: rect(95px, 9999px, 5px, 0); transform: skew(0.1deg); }
        }

        @keyframes glitch-anim2 {
          0% { clip: rect(65px, 9999px, 100px, 0); transform: skew(0.5deg); }
          5% { clip: rect(30px, 9999px, 35px, 0); transform: skew(0.2deg); }
          10% { clip: rect(90px, 9999px, 25px, 0); transform: skew(0.4deg); }
          15% { clip: rect(20px, 9999px, 80px, 0); transform: skew(0.1deg); }
          20% { clip: rect(75px, 9999px, 50px, 0); transform: skew(0.6deg); }
          25% { clip: rect(40px, 9999px, 70px, 0); transform: skew(0.3deg); }
          30% { clip: rect(85px, 9999px, 15px, 0); transform: skew(0.2deg); }
          35% { clip: rect(10px, 9999px, 95px, 0); transform: skew(0.5deg); }
          40% { clip: rect(55px, 9999px, 60px, 0); transform: skew(0.4deg); }
          45% { clip: rect(25px, 9999px, 45px, 0); transform: skew(0.1deg); }
          50% { clip: rect(70px, 9999px, 30px, 0); transform: skew(0.3deg); }
          55% { clip: rect(50px, 9999px, 75px, 0); transform: skew(0.2deg); }
          60% { clip: rect(15px, 9999px, 55px, 0); transform: skew(0.5deg); }
          65% { clip: rect(80px, 9999px, 20px, 0); transform: skew(0.4deg); }
          70% { clip: rect(35px, 9999px, 85px, 0); transform: skew(0.1deg); }
          75% { clip: rect(95px, 9999px, 10px, 0); transform: skew(0.6deg); }
          80% { clip: rect(45px, 9999px, 65px, 0); transform: skew(0.3deg); }
          85% { clip: rect(5px, 9999px, 90px, 0); transform: skew(0.2deg); }
          90% { clip: rect(60px, 9999px, 40px, 0); transform: skew(0.4deg); }
          95% { clip: rect(100px, 9999px, 5px, 0); transform: skew(0.5deg); }
          100% { clip: rect(20px, 9999px, 75px, 0); transform: skew(0.1deg); }
        }

        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          10% { transform: skew(-2deg); }
          20% { transform: skew(2deg); }
          30% { transform: skew(0deg); }
          40% { transform: skew(1deg); }
          50% { transform: skew(-1deg); }
          60% { transform: skew(0deg); }
          70% { transform: skew(-3deg); }
          80% { transform: skew(3deg); }
          90% { transform: skew(0deg); }
          100% { transform: skew(0deg); }
        }

        @media (max-width: 768px) {
          .glitch {
            font-size: 1.75rem;
          }
        }

        /* Typewriter (simples, como solicitado) */
        .typewriter-cursor {
          display: inline-block;
          width: 3px;
          height: 1.2em;
          background-color: currentColor;
          margin-left: 4px;
          animation: blink 1s step-start infinite;
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        /* Blinking tag */
        .blink-tag {
          animation: blink-animation 1.5s ease-in-out infinite;
        }

        @keyframes blink-animation {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Pixel button */
        .pixel-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 3rem;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #0a0a12;
          background: #FF9900;
          border: 0;
          border-radius: 0;
          box-shadow:
            4px 4px 0 #00FFFF,
            8px 8px 0 rgba(0, 255, 255, 0.5);
          transition: all 0.1s;
          cursor: pointer;
        }

        .pixel-btn:hover {
          background: #00FFFF;
          color: #0a0a12;
          box-shadow:
            4px 4px 0 #FF9900,
            8px 8px 0 rgba(255, 153, 0, 0.5);
        }

        .pixel-btn:active {
          transform: translate(4px, 4px);
          box-shadow:
            0 0 0 #00FFFF,
            4px 4px 0 rgba(0, 255, 255, 0.5);
        }

        /* VT323 for body text */
        .vt323-text {
          font-family: 'VT323', monospace;
          font-size: 1.25rem;
          line-height: 1.6;
        }

        /* Canvas */
        .particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.4;
        }

        /* Ko-fi animations (same as exam mode) */
        .kofi-badge-highlight { animation: kofi-badge-pulse 8s ease-in-out infinite; will-change: transform, filter; }
        @keyframes kofi-badge-pulse {
          0%, 70%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 18px 45px rgba(255, 153, 0, 0)); }
          74% { transform: scale(1.12) rotate(-1.5deg); filter: drop-shadow(0 25px 60px rgba(255, 153, 0, 0.45)); }
          78% { transform: scale(1.18) rotate(1deg); filter: drop-shadow(0 28px 70px rgba(255, 153, 0, 0.55)); }
          82% { transform: scale(1.08) rotate(-0.4deg); filter: drop-shadow(0 22px 55px rgba(255, 153, 0, 0.4)); }
        }
        .kofi-glow-ring { animation: kofi-glow-spin 9s linear infinite; filter: blur(30px); opacity: 0.9; }
        @keyframes kofi-glow-spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
      `}</style>

      {/* CRT Overlay */}
      <div className="crt-overlay" />

      {/* Particles canvas */}
      <canvas id="bg-canvas" className="particles-canvas" />

      <header className="border-b border-[#00FFFF]/30 bg-[#0a0a12]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="relative z-10">
        <section className="pt-8 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              {/* Glitch title */}
              <h1 className="glitch mb-4" data-text="MASTER AWS">
                MASTER AWS
              </h1>

              {/* Typewriter text (exato, com id) - logo abaixo do título */}
              <p className="vt323-text text-slate-200 mb-3 min-h-[2.5rem]" style={{ fontSize: '1.75rem', lineHeight: 1.4 }}>
                <span id="typewriter"></span><span className="typewriter-cursor"></span>
              </p>

              {/* Blinking tag */}
              <div className="mt-10 mb-2">
                <span
                  className="blink-tag inline-block px-10 py-4 uppercase tracking-widest font-bold"
                  style={{
                    fontFamily: 'VT323, monospace',
                    color: '#FF9900',
                    border: '3px solid #FF9900',
                    backgroundColor: 'rgba(255, 153, 0, 0.1)',
                    fontSize: '1.875rem',
                  }}
                >
                  100% FREE • NO PAYWALL
                </span>
              </div>

              

              {/* Icons removed as requested */}

              {/* Removed redundant START NOW button */}
            </motion.div>
          </div>
        </section>

        {/* Certification selection */}
        <section id="certification-section" className="pt-8 pb-12 px-4 bg-[#0a0a12]/80">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight text-[#FF9900] mb-3"
                style={{ fontFamily: 'Press Start 2P, cursive', textShadow: '0 0 10px rgba(255,153,0,0.5)' }}
              >
                CHOOSE YOUR EXAM
              </h2>
              <p className="vt323-text text-slate-300 text-xl max-w-3xl mx-auto">
                Select an AWS certification and start practicing now
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              {isLoading && (
                <div className="col-span-full border-2 border-[#00FFFF] bg-[#0a0a12]/90 px-6 py-10 text-center vt323-text text-slate-300 text-xl">
                  Loading certifications...
                </div>
              )}

              {!isLoading &&
                certifications.map((cert) => {
                  const examCode = cert.id;
                  const colors = CERT_COLORS[cert.id] || CERT_COLORS['CLF-C02'];

                  // Define icon and badge based on cert type
                  let icon = 'fas fa-cloud';
                  let badgeText = 'FOUNDATIONAL';
                  let descriptionText = '';

                  if (cert.id === 'CLF-C02') {
                    icon = 'fas fa-cloud';
                    badgeText = 'FOUNDATIONAL';
                    descriptionText = 'The starting point. Master the fundamentals of AWS cloud, shared responsibility models, basic security, and pricing.';
                  } else if (cert.id === 'SAA-C03') {
                    icon = 'fas fa-network-wired';
                    badgeText = 'ASSOCIATE';
                    descriptionText = 'The industry gold standard. Learn to design resilient, high-performance, secure, and cost-optimized architectures.';
                  } else if (cert.id === 'AIF-C01') {
                    icon = 'fas fa-microchip';
                    badgeText = 'NEW • FOUNDATIONAL';
                    descriptionText = 'The future is now. Dive into Generative AI, Machine Learning, and ethical AI use on the AWS platform.';
                  }

                  const isHovered = hoveredCertId === cert.id;
                  const borderColor = isHovered ? (colors.badge || colors.border || '#fff') : '#333';
                  const boxShadow = isHovered ? `0 0 15px ${colors.shadow}` : undefined;

                  return (
                    <button
                      key={cert.id}
                      onClick={() => handleCertSelect(cert.id)}
                      onMouseEnter={() => setHoveredCertId(cert.id)}
                      onMouseLeave={() => setHoveredCertId(null)}
                      
                      className="group relative flex flex-col h-full p-6 bg-[#0a0a12]/70 border-2 transition-all duration-200 hover:-translate-y-[5px]"
                      style={{ borderColor, boxShadow }}
                    >
                      {/* Badge */}
                      <div
                        className="absolute top-0 right-0 text-black text-[10px] px-2 py-1 font-bold"
                        style={{
                          fontFamily: 'Press Start 2P, cursive',
                          backgroundColor: colors.badge
                        }}
                      >
                        {badgeText}
                      </div>

                      {/* Icon removed */}

                      {/* Exam Code */}
                      <h3 className="text-xl text-white mt-6 md:mt-8 mb-2 text-center" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                        {examCode}
                      </h3>

                      <p className="vt323-text text-center mb-4 text-lg transition-all duration-200" style={{ color: colors.text }}>
                        {cert.name}
                      </p>

                      {/* Divider */}
                      <div className="w-full bg-gray-800 h-[2px] mb-4"></div>

                      {/* Description */}
                      <p className="vt323-text text-sm text-gray-300/95 mb-6 flex-1 leading-relaxed text-left">
                        {descriptionText}
                      </p>

                      {/* Start Button */}
                      <span className="vt323-text text-base font-bold uppercase text-center transition-all duration-200" style={{ color: colors.text }}>
                        START →
                      </span>
                    </button>
                  );
                })}

              {!isLoading && certifications.length === 0 && (
                <div className="col-span-full border-2 border-[#00FFFF] bg-[#0a0a12]/90 px-6 py-10 text-center vt323-text text-slate-300 text-xl">
                  No certifications found. Check your connection.
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Creator section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative border-2 border-[#FF9900]/50 bg-[#0a0a12]/80 p-8 md:p-12 backdrop-blur-sm"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <div className="w-32 h-32 border-4 border-[#00FFFF] p-1 shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                    <div className="w-full h-full bg-black/70 flex items-center justify-center overflow-hidden">
                      <img
                        src="/profile.png"
                        alt="Fabrício Félix"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML =
                            '<div class=\"text-xl tracking-wide\">FOTO</div>';
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                <div className="flex-1 text-center md:text-left">
                  <h3
                    className="text-2xl md:text-3xl font-bold text-[#FF9900] mb-2 tracking-tight"
                    style={{ fontFamily: 'Press Start 2P, cursive', textShadow: '0 0 10px rgba(255,153,0,0.5)' }}
                  >
                    FABRICIO FELIX
                  </h3>
                  <p className="vt323-text text-lg uppercase tracking-widest text-[#00FFFF] mb-6">
                    2x AWS Certified · Platform Founder
                  </p>
                  <p className="vt323-text text-slate-200 mb-6 leading-relaxed text-lg">
                    I’m a Brazilian developer who built this platform solo with one clear goal: give people a real shot at AWS certification prep without hitting a paywall. All practice exams here are free, no strings attached, because I believe cloud knowledge should be accessible, not a luxury. This project, however, runs entirely on donations — when you chip in, you help keep the lights on (servers, tools, new questions) and make it possible for people with fewer resources to keep studying for free. Your support doesn’t just fund a website; it pays it forward and opens doors for someone else’s career.
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <motion.a
                      href="https://www.linkedin.com/in/fabriciocosta85/"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileTap={{ scale: 0.95 }}
                      className="inline-block px-6 py-3 border-2 border-[#00FFFF] bg-transparent text-[#00FFFF] vt323-text text-lg font-bold uppercase transition-all duration-200 hover:bg-[#00FFFF] hover:text-[#0a0a12]"
                    >
                      LINKEDIN
                    </motion.a>
                    {/* Ko-fi badge button linking directly to your Ko-fi page */}
                    <a
                      href="https://ko-fi.com/fabriciocosta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative inline-flex items-center justify-center rounded-3xl p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
                      aria-label="Support on Ko-fi"
                      title="Support on Ko-fi"
                    >
                      <div
                        className="kofi-glow-ring absolute -inset-2 -z-10 rounded-[28px]"
                        style={{
                          background:
                            'conic-gradient(from 0deg, rgba(0, 255, 255, 0.85) 0%, rgba(255, 153, 0, 0.9) 35%, rgba(0, 255, 255, 0.9) 70%, rgba(255, 153, 0, 0.85) 100%)',
                        }}
                        aria-hidden="true"
                      />
                      <img src={kofiBadgeUrl} alt="Ko-fi" className="kofi-badge-highlight h-14 md:h-16 w-auto" loading="lazy" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[#00FFFF]/30 py-8 px-4 bg-[#0a0a12]/90">
        <div className="max-w-7xl mx-auto text-center vt323-text text-slate-400 text-lg">
          <p>© 2025 CLOUD.VERSE · Fabricio Felix</p>
          <p className="mt-3 text-base text-slate-500">
            This platform is not affiliated with Amazon Web Services.
          </p>
        </div>
      </footer>
    </div>
  );
};
