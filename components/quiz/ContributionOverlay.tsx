import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContributionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const contributionMessages = [
  "Your support means everything to me. Creating these free AWS certification resources is my passion, and every contribution motivates me to keep going. Thanks for being part of this journey! ??",
  "I pour my heart into creating these AWS study materials because I believe knowledge should be accessible to all. Your support means a lot to me! Together, we're breaking down barriers! ??",
  "When I see learners succeeding with these resources, it fills my heart with joy. Your support helps keep this dream alive: providing free, high-quality AWS certification materials to anyone willing to learn. ?"
];

export const ContributionOverlay: React.FC<ContributionOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const [message] = React.useState(() => {
    return contributionMessages[Math.floor(Math.random() * contributionMessages.length)];
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-lg"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-teal-600/20 p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        Support Free Education
                      </h3>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  <p className="text-gray-300 leading-relaxed text-base">
                    {message}
                  </p>

                  {/* Ko-fi Button */}
                  <a
                    href="https://ko-fi.com/fabriciocosta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 text-center shadow-lg shadow-blue-500/25"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-1.735 1.904.047 2.276 1.103 2.276 1.103.663 1.418.148 2.678-.553 3.98z" />
                      </svg>
                      <span>Support on Ko-fi</span>
                    </div>
                  </a>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-sm text-gray-500">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Continue studying
                  </button>

                  {/* Footer note */}
                  <p className="text-xs text-gray-500 text-center">
                    This platform will always be free. Your support helps keep it alive. ??
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
