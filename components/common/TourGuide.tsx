import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TourProvider, TourStep } from '@reactour/tour';
import { Mask } from '@reactour/mask';
import { Popover } from '@reactour/popover';

export type TourType = 'quiz-rapido' | 'quiz-completo' | 'dominios' | 'revisao';

interface TourGuideProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  tourType?: TourType;
}

const getTourSteps = (tourType: TourType): TourStep[] => {
  const commonSteps: Record<TourType, TourStep[]> = {
    'quiz-rapido': [
      {
        selector: '[data-tour="quiz-rapido"]',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚀 Quiz Rápido
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Perfeito para uma prática rápida! 35 questões selecionadas aleatoriamente 
              do nosso banco de 650+ questões.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Gratuito:</strong> Disponível para todos os usuários
              </p>
            </div>
          </div>
        ),
        position: 'bottom',
        padding: { mask: [8, 8, 8, 8] },
      }
    ],
    'quiz-completo': [
      {
        selector: '[data-tour="quiz-completo"]',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎯 Quiz Completo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Simulação oficial do exame SAA-C03! 65 questões com proporções reais 
              e tempo limite de 130 minutos.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>PRO:</strong> Explicações detalhadas e navegação completa
              </p>
            </div>
          </div>
        ),
        position: 'bottom',
        padding: { mask: [8, 8, 8, 8] },
      }
    ],
    'dominios': [
      {
        selector: '[data-tour="dominios"]',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🏗️ Prática por Domínios
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Foque nos domínios que mais precisa praticar! Escolha entre Arquitetura 
              Segura, Resiliente, Alto Desempenho ou Custo Otimizado.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>PRO:</strong> Personalize quantidade e domínios
              </p>
            </div>
          </div>
        ),
        position: 'bottom',
        padding: { mask: [8, 8, 8, 8] },
      }
    ],
    'revisao': [
      {
        selector: '[data-tour="revisao"]',
        content: (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📚 Modo Revisão
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Estude no seu ritmo! Navegue por todas as questões, veja explicações 
              detalhadas e marque suas favoritas para revisar depois.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>PRO:</strong> Acesso completo ao banco de questões
              </p>
            </div>
          </div>
        ),
        position: 'bottom',
        padding: { mask: [8, 8, 8, 8] },
      }
    ]
  };

  return commonSteps[tourType] || [];
};

export const TourGuide: React.FC<TourGuideProps> = ({ children, isOpen, onClose, tourType = 'quiz-rapido' }) => {
  const { t } = useTranslation(['tour']);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getTourSteps(tourType);

  console.log(`TourGuide ${tourType}:`, { isOpen, stepsLength: steps.length, currentStep });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen || steps.length === 0) {
    return <>{children}</>;
  }

  return (
    <TourProvider
      steps={steps}
      currentStep={currentStep}
      onRequestClose={onClose}
      onClickMask={onClose}
      showCloseButton
      showNavigation
      showBadge
      badgeContent={({ currentStep, steps }) => t('tour:navigation.current', { current: currentStep + 1, total: steps.length })}
      prevButton={currentStep > 0 ? t('tour:navigation.previous') : null}
      nextButton={currentStep < steps.length - 1 ? t('tour:navigation.next') : t('tour:navigation.finish')}
    >
      {children}
    </TourProvider>
  );
};
