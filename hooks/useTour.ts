import { useState, useCallback } from 'react';
import { TourType } from '../components/common/TourGuide';

export const useTour = (tourType: TourType) => {
  const [isOpen, setIsOpen] = useState(false);

  const checkAndStartTour = useCallback(() => {
    const tourKey = `tour-seen-${tourType}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    
    console.log(`Checking tour for ${tourType}:`, { tourKey, hasSeenTour, willOpen: !hasSeenTour });
    
    if (!hasSeenTour) {
      console.log(`Opening tour for ${tourType}`);
      setIsOpen(true);
    }
  }, [tourType]);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    const tourKey = `tour-seen-${tourType}`;
    localStorage.setItem(tourKey, 'true');
  }, [tourType]);

  const startTour = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    checkAndStartTour,
    closeTour,
    startTour
  };
};
