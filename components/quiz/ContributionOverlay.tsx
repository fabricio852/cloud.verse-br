import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ThemedSupportButton } from '../donation/ThemedSupportButton';
import { ThemedDonationModal } from '../donation/ThemedDonationModal';

interface ContributionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const avatarUrl = "/profile.jpeg";

export const ContributionOverlay: React.FC<ContributionOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(['tour']);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

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
                      <div className="relative h-12 w-12 rounded-full border border-white/20 p-[2px] shadow-lg shadow-black/30">
                        <div className="h-full w-full overflow-hidden rounded-full bg-black/60">
                          <img
                            src={avatarUrl}
                            alt="Fabricio Felix"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {t('tour:contribution.title')}
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
                    {t('tour:contribution.message')}
                  </p>

                  {/* Support Button - PIX */}
                  <div className="w-full flex justify-center">
                    <ThemedSupportButton
                      onClick={() => setDonationModalOpen(true)}
                      variant="inline"
                      theme="default"
                    />
                  </div>

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
                    {t('tour:contribution.continue_button')}
                  </button>

                  {/* Footer note */}
                  <p className="text-xs text-gray-500 text-center">
                    {t('tour:contribution.footer_note')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Donation Modal */}
          <ThemedDonationModal
            isOpen={donationModalOpen}
            onClose={() => setDonationModalOpen(false)}
            pixKey="00000000000" // TODO: Configure with actual PIX key
            pixReceiverName="Cloud Verse" // TODO: Configure with actual receiver name
            pixReceiverCity="São Paulo" // TODO: Configure with actual receiver city
            theme="default"
          />
        </>
      )}
    </AnimatePresence>
  );
};

