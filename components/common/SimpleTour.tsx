import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SimpleTourProps {
  isOpen: boolean;
  onClose: () => void;
  targetSelector: string;
  title: string;
  description: string;
  badge?: string;
}

export const SimpleTour: React.FC<SimpleTourProps> = ({
  isOpen,
  onClose,
  targetSelector,
  title,
  description,
  badge
}) => {
  const { t } = useTranslation(['tour']);
  const overlayRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const targetElement = document.querySelector(targetSelector);
    
    if (!targetElement) {
      return;
    }

    const updatePosition = () => {
      if (!overlayRef.current || !popoverRef.current || !targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const overlay = overlayRef.current;
      const popover = popoverRef.current;

      // Posicionar overlay
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '9999';
      overlay.style.pointerEvents = 'auto';

      // Criar buraco no overlay
      const holeSize = 8;
      overlay.style.background = `radial-gradient(circle at ${rect.left + rect.width/2}px ${rect.top + rect.height/2}px, transparent ${rect.width/2 + holeSize}px, rgba(0,0,0,0.7) ${rect.width/2 + holeSize + 10}px)`;

      // Posicionar popover
      const popoverWidth = 320;
      const popoverHeight = 200;
      let left = rect.left + rect.width/2 - popoverWidth/2;
      let top = rect.bottom + 20;

      // Ajustar se sair da tela
      if (left < 20) left = 20;
      if (left + popoverWidth > window.innerWidth - 20) {
        left = window.innerWidth - popoverWidth - 20;
      }
      if (top + popoverHeight > window.innerHeight - 20) {
        top = rect.top - popoverHeight - 20;
      }

      popover.style.position = 'fixed';
      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;
      popover.style.width = `${popoverWidth}px`;
      popover.style.zIndex = '10000';
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, targetSelector]);

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      <div
        ref={popoverRef}
        className="fixed bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-2 duration-300"
      >
        {/* Header com gradiente sutil */}
        <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-white tracking-tight">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-200 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
              {badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-300 leading-relaxed mb-5">
            {description}
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            {t('tour:simple_tour.understood')}
          </button>
        </div>
      </div>
    </>
  );
};
