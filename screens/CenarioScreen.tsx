
import React, { useState } from 'react';
import { Button, GhostButton } from '../components/ui/Button';
import { Logo } from '../components/common/Logo';
import { Question } from '../types';
import { generateScenarioQuiz } from '../services/geminiService';

interface CenarioScreenProps {
    onBack: () => void;
    onStartQuiz: (questions: Question[], diagramUrl: string | null) => void;
}

export const CenarioScreen: React.FC<CenarioScreenProps> = ({ onBack, onStartQuiz }) => {
    const [scenario, setScenario] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!scenario.trim()) {
            setError("Por favor, descreva um cenário.");
            return;
        }
        setIsLoading(true);
        setError("");

        try {
            const { questions, diagramUrl } = await generateScenarioQuiz(scenario);
            onStartQuiz(questions, diagramUrl);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Falha ao gerar o quiz. Verifique sua conexão e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Logo />
                    <GhostButton onClick={onBack}>Voltar</GhostButton>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Gerador de Quiz por Cenário ✨</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Descreva uma situação ou um problema de arquitetura na AWS, e a IA criará um quiz personalizado para você testar seus conhecimentos.</p>

                    <textarea
                        value={scenario}
                        onChange={e => setScenario(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                        rows={5}
                        placeholder="Ex: Uma startup de e-commerce precisa de uma arquitetura escalável e resiliente para sua loja online, com picos de tráfego na Black Friday."
                    />

                    <div className="mt-4 flex flex-col items-center">
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full md:w-auto">
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />Gerando quiz...</span>
                            ) : (
                                '✨ Gerar Quiz Personalizado'
                            )}
                        </Button>
                        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};
