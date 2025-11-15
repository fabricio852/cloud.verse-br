import React, { useState } from 'react';
import { DonationModal } from './DonationModal';
import { SupportButton } from './SupportButton';

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
        <SupportButton
          onClick={() => setIsOpen(true)}
          variant="floating"
          showPulse={true}
        />
      </div>

      <DonationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pixKey={pixKey}
        pixReceiverName={pixReceiverName}
        pixReceiverCity={pixReceiverCity}
      />
    </>
  );
};
