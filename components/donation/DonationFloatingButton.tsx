import React, { useState } from 'react';
import { ThemedDonationModal } from './ThemedDonationModal';
import { ThemedSupportButton } from './ThemedSupportButton';

interface DonationFloatingButtonProps {
  pixKey: string;
  pixReceiverName: string;
  pixReceiverCity: string;
  desktopOnly?: boolean;
}

export const DonationFloatingButton: React.FC<DonationFloatingButtonProps> = ({
  pixKey,
  pixReceiverName,
  pixReceiverCity,
  desktopOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={desktopOnly ? 'hidden lg:block' : 'block'}>
        <ThemedSupportButton
          onClick={() => setIsOpen(true)}
          variant="floating"
          theme="landing"
          showPulse={true}
        />
      </div>

      <ThemedDonationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pixKey={pixKey}
        pixReceiverName={pixReceiverName}
        pixReceiverCity={pixReceiverCity}
        theme="landing"
      />
    </>
  );
};
