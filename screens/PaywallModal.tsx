
import React from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

interface PaywallModalProps {
    open: boolean;
    onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ open, onClose }) => {
    if (!open) return null;

    const features = [
        { title: 'Questões Ilimitadas', desc: 'Acesso completo ao banco com 650+ questões' },
        { title: 'Quiz Completo', desc: 'Simulados de 65 questões no formato oficial' },
        { title: 'Prática por Domínios', desc: 'Foque nos domínios que você mais precisa' },
        { title: 'Explicações com IA', desc: 'Explicações detalhadas e alternativas geradas por IA' },
        { title: 'Modo Revisão', desc: 'Pratique sem pressa, revise e favorite questões' },
        { title: 'Navegação Completa', desc: 'Volte e revise suas respostas durante o quiz' }
    ];

    return (
        <Modal open={open} onClose={onClose} title="">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 text-white -m-6 mb-6 p-8 rounded-t-xl">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Desbloqueie Todo o Potencial</h2>
                    <p className="text-purple-100 text-sm">
                        Aproveite ao máximo sua preparação para AWS
                    </p>
                </div>
            </div>

            {/* Recursos PRO */}
            <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-center mb-4">
                    O que você ganha com o PRO:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="flex gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-start pt-0.5">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                    {feature.title}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {feature.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comparação FREE vs PRO */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                        <div className="font-semibold text-sm text-amber-900 dark:text-amber-200 mb-2">
                            Plano Gratuito: Limitado a 10 questões/dia
                        </div>
                        <div className="text-xs text-amber-800 dark:text-amber-300">
                            Com o PRO, você remove todas as limitações e acelera sua aprovação na certificação AWS.
                        </div>
                    </div>
                </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Continuar com Gratuito
                </button>
                <button
                    onClick={() => {
                        // TODO: Implement upgrade logic
                        window.open('https://seu-link-de-pagamento.com', '_blank');
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold transition-all shadow-lg"
                >
                    Fazer Upgrade para PRO
                </button>
            </div>

            {/* Footer com garantia */}
            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>Acesso imediato após o pagamento</p>
            </div>
        </Modal>
    );
};
