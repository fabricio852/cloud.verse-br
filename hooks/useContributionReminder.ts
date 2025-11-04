import { useState, useCallback } from 'react';

interface UseContributionReminderOptions {
  questionsBeforeReminder?: number;
  minTimeBetweenReminders?: number;
}

const STORAGE_KEY = 'last_contribution_reminder';

export const useContributionReminder = (options: UseContributionReminderOptions = {}) => {
  const {
    questionsBeforeReminder = 15,
    minTimeBetweenReminders = 1000 * 60 * 60 * 24, // 24 horas
  } = options;

  const [shouldShowReminder, setShouldShowReminder] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const canShowReminder = useCallback((): boolean => {
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (!lastShown) return true;

      const timeSinceLastShown = Date.now() - parseInt(lastShown, 10);
      return timeSinceLastShown >= minTimeBetweenReminders;
    } catch {
      return true;
    }
  }, [minTimeBetweenReminders]);

  const incrementQuestions = useCallback(() => {
    setQuestionsAnswered((prev) => {
      const newCount = prev + 1;

      if (newCount >= questionsBeforeReminder && canShowReminder()) {
        setShouldShowReminder(true);
        try {
          localStorage.setItem(STORAGE_KEY, Date.now().toString());
        } catch {
          // ignore storage failures
        }
        return 0;
      }

      return newCount;
    });
  }, [questionsBeforeReminder, canShowReminder]);

  const closeReminder = useCallback(() => {
    setShouldShowReminder(false);
  }, []);

  const forceShowReminder = useCallback(() => {
    setShouldShowReminder(true);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // ignore storage failures
    }
  }, []);

  return {
    shouldShowReminder,
    closeReminder,
    incrementQuestions,
    forceShowReminder,
    questionsAnswered,
  };
};
