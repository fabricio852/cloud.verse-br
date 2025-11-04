
import React, { useState, useEffect } from 'react';
import { Logo } from '../components/common/Logo';
import { GhostButton } from '../components/ui/Button';
import { QuestionViewer } from '../components/quiz/QuestionViewer';
import { Plano, Question } from '../types';
import { cn } from '../utils';
import { useCertificationStore } from '../store/certificationStore';
import { fetchQuestions } from '../services/questionsService';
import type { Database } from '../types/database';

type DBQuestion = Database['public']['Tables']['questions']['Row'];

interface ReviewScreenProps {
    onBack: () => void;
    plano: Plano;
    theme?: string;
}

// Converter questão do banco para formato do app
const convertQuestion = (dbQ: DBQuestion): Question => {
    return {
        id: dbQ.id,
        domain: dbQ.domain as any,
        stem: dbQ.question_text,
        options: {
            A: dbQ.option_a,
            B: dbQ.option_b,
            C: dbQ.option_c,
            D: dbQ.option_d,
            ...(dbQ.option_e ? { E: dbQ.option_e } : {})
        },
        answerKey: dbQ.correct_answers || [dbQ.correct_answer || 'A'],
        requiredSelections: dbQ.required_selection_count || 1,
        explanation_basic: dbQ.explanation_detailed?.substring(0, 150) || '',
        explanation_detailed: dbQ.explanation_detailed || '',
        incorrect: dbQ.incorrect_explanations as any || {}
    };
};

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ onBack, plano, theme = 'light' }) => {
    const { selectedCertId } = useCertificationStore();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [ativo, setAtivo] = useState(0);
    const [respondidas, setRespondidas] = useState<{ [key: number]: boolean }>({});
    const [marked, setMarked] = useState<{ [key: number]: boolean }>({});

    const total = questions.length;
    const questao = questions[ativo] || null;

    // Carregar questões do Supabase
    useEffect(() => {
        const loadQuestions = async () => {
            if (!selectedCertId) {
                console.log('[ReviewScreen] Nenhuma certificação selecionada');
                setLoading(false);
                return;
            }

            console.log('[ReviewScreen] Carregando questões para:', selectedCertId);
            setLoading(true);
            try {
                const dbQuestions = await fetchQuestions({
                    certificationId: selectedCertId,
                    tier: 'ALL',
                    shuffle: false,
                    limit: 65
                });

                console.log('[ReviewScreen] Questões carregadas:', dbQuestions.length);
                const converted = dbQuestions.map(convertQuestion);
                setQuestions(converted);
            } catch (error) {
                console.error('[ReviewScreen] Erro ao carregar questões:', error);
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, [selectedCertId]);

    const onAnswered = () => setRespondidas(prev => ({ ...prev, [ativo]: true }));
    const toggleMark = (index: number, markedValue: boolean) => {
        setMarked(prev => ({ ...prev, [index]: markedValue }));
    };

    const next = () => setAtivo(i => Math.min(total - 1, i + 1));
    const prev = () => setAtivo(i => Math.max(0, i - 1));

    return (
        <div className="min-h-screen">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center gap-2">
                        <GhostButton onClick={onBack}>Encerrar</GhostButton>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Carregando questões...</p>
                        </div>
                    </div>
                ) : !selectedCertId ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Nenhuma certificação selecionada</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">Volte e selecione uma certificação</p>
                        </div>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Nenhuma questão encontrada</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">Certificação: {selectedCertId}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-3" style={{ borderRadius: 12 }}>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: total }).map((_, i) => {
                                        const ativoNow = i === ativo;
                                        const isAnswered = respondidas[i];
                                        const isMarked = marked[i];
                                        return (
                                            <button key={i} onClick={() => setAtivo(i)} className={cn("w-9 h-9 grid place-items-center border text-sm font-medium rounded-full transition",
                                                ativoNow ? "bg-gradient-to-r from-purple-800 to-fuchsia-800 text-white border-transparent ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-gray-900" :
                                                isMarked ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700" :
                                                isAnswered ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700" :
                                                "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            )}>{i + 1}</button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-4 text-xs dark:text-gray-400">
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />Respondida</div>
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full" />Marcada</div>
                                </div>
                            </div>
                        </div>
                        {questao && (
                            <div className="mt-4">
                                <QuestionViewer
                                    questao={questao}
                                    indice={ativo}
                                    total={total}
                                    onEnviar={() => onAnswered()}
                                    onProxima={next}
                                    level="detailed"
                                    onPrev={ativo > 0 ? prev : undefined}
                                    plano={plano}
                                    isMarked={!!marked[ativo]}
                                    onMark={(m) => toggleMark(ativo, m)}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};
