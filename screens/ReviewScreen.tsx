import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/common/Logo';
import { GhostButton } from '../components/ui/Button';
import { QuestionViewer } from '../components/quiz/QuestionViewer';
import { Plano, Question } from '../types';
import { cn } from '../utils';
import { useCertificationStore } from '../store/certificationStore';
import { useQuestions } from '../hooks/useQuestions';

interface ReviewScreenProps {
    onBack: () => void;
    onVoltar?: () => void;
    plano: Plano;
    theme?: string;
}

const MAX_REVIEW_QUESTIONS = 65;

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ onBack, onVoltar, plano, theme = 'light' }) => {
    const { t } = useTranslation(['common', 'quiz']);
    const { selectedCertId } = useCertificationStore();

    // Usa o hook de perguntas com cache bilíngue para alternar idioma instantaneamente
    const { questions, loading } = useQuestions({
        certificationId: selectedCertId || 'CLF-C02',
        tier: 'ALL',
        shuffle: false,
        limit: MAX_REVIEW_QUESTIONS,
        take: MAX_REVIEW_QUESTIONS, // garante 65 itens mesmo em fallbacks de idioma
        enabled: !!selectedCertId,
        preloadBoth: true,
        anchorLanguage: 'en',
    });

    // Garante que nunca renderizamos mais que 65 itens mesmo que a API retorne extra
    const questionsLimited = useMemo(
        () => questions.slice(0, MAX_REVIEW_QUESTIONS),
        [questions]
    );

    const [ativo, setAtivo] = useState(0);
    const [respondidas, setRespondidas] = useState<{ [key: number]: boolean }>({});
    const [marked, setMarked] = useState<{ [key: number]: boolean }>({});
    const [isGridCollapsed, setIsGridCollapsed] = useState(false);

    const total = questionsLimited.length;
    const questao = questionsLimited[ativo] || null;

    // Ajusta índice se tamanho da lista mudar (ex.: troca de idioma)
    useEffect(() => {
        if (ativo >= total) {
            setAtivo(total > 0 ? total - 1 : 0);
        }
    }, [ativo, total]);

    const onAnswered = () => setRespondidas(prev => ({ ...prev, [ativo]: true }));
    const toggleMark = (index: number, markedValue: boolean) => {
        setMarked(prev => ({ ...prev, [index]: markedValue }));
    };

    const next = () => setAtivo(i => Math.min(total - 1, i + 1));
    const prev = () => setAtivo(i => Math.max(0, i - 1));

    const gridButtons = useMemo(() => {
        return Array.from({ length: total }).map((_, i) => {
            const ativoNow = i === ativo;
            const isAnswered = respondidas[i];
            const isMarked = marked[i];
            return (
                <button
                    key={i}
                    onClick={() => setAtivo(i)}
                    className={cn(
                        'w-9 h-9 grid place-items-center border text-sm font-medium rounded-full transition',
                        ativoNow
                            ? 'bg-gradient-to-r from-purple-800 to-fuchsia-800 text-white border-transparent ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-gray-900'
                            : isMarked
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700'
                            : isAnswered
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                >
                    {i + 1}
                </button>
            );
        });
    }, [ativo, total, respondidas, marked]);

    return (
        <div className="min-h-screen">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo - icon only on mobile, full logo on desktop */}
                    <div className="block sm:hidden">
                        <Logo onClick={onVoltar} iconOnly={true} size={40} />
                    </div>
                    <div className="hidden sm:block">
                        <Logo onClick={onVoltar} />
                    </div>
                    <div className="flex items-center gap-3">
                        {onVoltar && (
                            <button
                                onClick={onVoltar}
                                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                {t('common:buttons.back')}
                            </button>
                        )}
                        <GhostButton onClick={onBack}>{t('common:buttons.exit')}</GhostButton>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">{t('common:loading_states.loading_questions')}</p>
                        </div>
                    </div>
                ) : !selectedCertId ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">{t('common:errors.no_certification_selected')}</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">{t('common:navigation.go_back')}</p>
                        </div>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">{t('common:errors.no_questions_available')}</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">{selectedCertId}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            className={cn(
                                "relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm px-4",
                                isGridCollapsed ? "py-2 min-h-[48px]" : "py-4 pt-6"
                            )}
                        >
                            <button
                                onClick={() => setIsGridCollapsed(!isGridCollapsed)}
                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                                aria-label={isGridCollapsed ? t('quiz:navigation_legend.expand_grid') : t('quiz:navigation_legend.collapse_grid')}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isGridCollapsed ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    )}
                                </svg>
                            </button>

                            {!isGridCollapsed && (
                                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 flex-wrap pr-8">
                                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-full" />{t('quiz:navigation_legend.answered')}</div>
                                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full" />{t('quiz:navigation_legend.marked')}</div>
                                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 border border-gray-400 rounded-full" />{t('quiz:navigation_legend.pending')}</div>
                                </div>
                            )}
                            {!isGridCollapsed && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {gridButtons}
                                </div>
                            )}
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
