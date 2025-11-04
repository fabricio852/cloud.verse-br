import React from 'react';
import { Button } from '../ui/Button';

interface EmptyQuestionsProps {
  certificationId: string;
  certificationName?: string;
  onBack: () => void;
}

export const EmptyQuestions: React.FC<EmptyQuestionsProps> = ({
  certificationId,
  certificationName,
  onBack
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Nenhuma questão disponível
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Ainda não temos questões cadastradas para a certificação{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {certificationName || certificationId}
          </span>.
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Estamos trabalhando para adicionar conteúdo em breve.
          Por enquanto, tente outra certificação disponível.
        </p>

        {/* Action Button */}
        <Button onClick={onBack} className="w-full sm:w-auto">
          Voltar ao Painel
        </Button>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Dica:</strong> Se você tem questões para importar,
            entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};
