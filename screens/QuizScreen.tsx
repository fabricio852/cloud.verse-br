import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionViewer } from '../components/quiz/QuestionViewer';
import { Logo } from '../components/common/Logo';
import { Button, GhostButton } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MoonIcon, SunIcon } from '../components/common/Icons';
import { ContributionOverlay } from '../components/quiz/ContributionOverlay';
import { KofiWidget } from '../components/quiz/KofiWidget';
import { Question, Plano, ResultSummary, DomainStats } from '../types';
import { Q_BANK } from '../constants';
import { fmtTime, weightedAccuracy } from '../utils';
import { useQuizAttempt } from '../hooks/useQuizAttempt';
import { useContributionReminder } from '../hooks/useContributionReminder';
import { useCertificationStore } from '../store/certificationStore';
import { useLanguageStore } from '../stores/languageStore';
import { trackEvent } from '../services/analytics';

const toRgba = (hex: string, alpha = 1) => {
    const sanitized = hex.replace('#', '');
    const expanded = sanitized.length === 3
        ? sanitized.split('').map((char) => char + char).join('')
        : sanitized;
    const parsed = parseInt(expanded, 16);
    const r = (parsed >> 16) & 255;
    const g = (parsed >> 8) & 255;
    const b = parsed & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface QuizScreenProps {
    plano: Plano;
    tamanho?: number;
    onSair: (summary: ResultSummary) => void;
    level: 'basic' | 'detailed';
    timed?: boolean;
    durationSec?: number;
    navAfterBack?: boolean;
    questions?: Question[];
    onExit: () => void;
    onVoltar?: () => void;
    diagramUrl?: string | null;
    theme?: string;
    toggleTheme?: () => void;
    quizType?: 'daily' | 'full' | 'practice' | 'domains' | 'review';
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
    plano, tamanho, onSair, level = 'basic', timed = false, durationSec = 0, navAfterBack = false, questions, onExit, onVoltar, diagramUrl, theme = 'light', toggleTheme, quizType = 'practice'
}) => {
    const { t } = useTranslation(['quiz', 'common']);
    const { getTheme } = useCertificationStore();
    const certTheme = getTheme();
    const backgroundStyle = {
        background: `
            radial-gradient(120% 120% at 15% 10%, ${toRgba(certTheme.primary, 0.32)} 0%, transparent 58%),
            radial-gradient(135% 125% at 85% -10%, ${toRgba(certTheme.secondary, 0.26)} 0%, transparent 60%),
            radial-gradient(130% 135% at 50% 110%, ${toRgba(certTheme.accent, 0.22)} 0%, transparent 68%)
        `,
    };
    const [i, setI] = useState(0);
    const [resps, setResps] = useState<(string[] | null)[]>([]);
    const [marked, setMarked] = useState<{ [key: number]: boolean }>({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [byDomCorrect, setByDomCorrect] = useState<DomainStats>({});
    const [byDomTotal, setByDomTotal] = useState<DomainStats>({});
    const [secsLeft, setSecsLeft] = useState(durationSec);
    const [isGridCollapsed, setIsGridCollapsed] = useState(false);

    const quizBank = questions && questions.length > 0 ? questions : Q_BANK;
    const quizSize = tamanho || quizBank.length;
    const questao = quizBank.length > 0 ? quizBank[i % quizBank.length] : null;

    const normalizeSelection = (selection: string[] | null | undefined) =>
        selection && selection.length ? selection.slice().sort().join('|') : '';
    const normalizeAnswerKey = (answers: string[]) =>
        answers.slice().sort().join('|');
    const answersEqual = (selection: string[] | null | undefined, correctAnswers: string[]) =>
        normalizeSelection(selection) === normalizeAnswerKey(correctAnswers);

    // Quiz attempt hook para persistência no Supabase
    const {
        startAttempt,
        startQuestionTimer,
        recordAnswer,
        finishAttempt,
        isSaving,
    } = useQuizAttempt({
        certificationId: 'CLF-C02',
        quizType,
        totalQuestions: quizSize,
        timeLimit: timed ? durationSec : undefined,
        questions: quizBank,
    });

    // Hook para gerenciar lembretes de contribuição
    const {
        shouldShowReminder,
        closeReminder,
        incrementQuestions,
        forceShowReminder,
    } = useContributionReminder({
        questionsBeforeReminder: 15,
        minTimeBetweenReminders: 1000 * 60 * 60 * 24, // 24 horas
    });

    // Iniciar quiz attempt ao montar componente (se houver questões)
    useEffect(() => {
        if (quizBank && quizBank.length > 0) {
            startAttempt();
            // Analytics: quiz started
            trackEvent('quiz_started', {
                quizType,
                total: quizSize,
            }).catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Iniciar timer da questão quando mudar de índice
    useEffect(() => {
        startQuestionTimer(i);
    }, [i, startQuestionTimer]);

    // Mostrar lembrete de contribuição ao iniciar o quiz
    useEffect(() => {
        const timer = setTimeout(() => {
            forceShowReminder();
        }, 3000); // Mostrar após 3 segundos de iniciar o quiz

        return () => clearTimeout(timer);
    }, [forceShowReminder]);

    const finalize = async () => {
        console.log('[QuizScreen] finalize() chamado');
        const correct = resps.filter((answer, idx) => {
            const question = quizBank[idx % quizBank.length];
            if (!question) return false;
            return answersEqual(answer, question.answerKey);
        }).length;
        console.log('[QuizScreen] correct:', correct, 'total:', quizSize);
        console.log('[QuizScreen] byDomainCorrect:', byDomCorrect);
        console.log('[QuizScreen] byDomainTotal:', byDomTotal);

        const wAcc = weightedAccuracy(byDomCorrect, byDomTotal);
        console.log('[QuizScreen] weightedAccuracy:', wAcc);

        const calculatedScore = 100 + Math.round(wAcc * 900);
        console.log('[QuizScreen] calculated score:', calculatedScore);

        const summary: ResultSummary = {
            correct,
            total: quizSize,
            score: calculatedScore,
            byDomainCorrect: byDomCorrect,
            byDomainTotal: byDomTotal,
        };
        console.log('[QuizScreen] summary:', summary);

        try {
            // Salvar tentativa no Supabase
            console.log('[QuizScreen] Salvando no Supabase...');
            await finishAttempt(correct, {
                byDomainCorrect,
                byDomainTotal,
            });
            console.log('[QuizScreen] Salvo com sucesso!');
            // Analytics: quiz finished
            trackEvent('quiz_finished', {
                quizType,
                correct,
                total: quizSize,
                score: calculatedScore,
            }).catch(() => {});
        } catch (error) {
            console.error('[QuizScreen] Erro ao salvar:', error);
        }

        // Ir direto para tela de resultados
        console.log('[QuizScreen] Chamando onSair...');
        onSair(summary);
        console.log('[QuizScreen] onSair chamado!');
    };

    useEffect(() => {
        if (timed) setSecsLeft(durationSec);
    }, [timed, durationSec]);

    useEffect(() => {
        if (!timed) return;
        const id = setInterval(() => {
            setSecsLeft(s => {
                if (s <= 1) {
                    clearInterval(id);
                    finalize();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timed]);

    const enviar = async (answer: string[]) => {

        if (!questao) return;



        const prevAnswer = resps[i];

        const isFirstTimeAnswered = !prevAnswer || prevAnswer.length === 0;

        const wasCorrect = answersEqual(prevAnswer, questao.answerKey);

        const isNowCorrect = answersEqual(answer, questao.answerKey);



        const newResps = [...resps];

        newResps[i] = answer;

        setResps(newResps);



        if (isFirstTimeAnswered) {

            // Incrementar contador de questoes para o lembrete de contribuicao

            incrementQuestions();



            setByDomTotal(prev => ({

                ...prev,

                [questao.domain]: (prev[questao.domain] || 0) + 1

            }));

            if (isNowCorrect) {

                setByDomCorrect(prev => ({

                    ...prev,

                    [questao.domain]: (prev[questao.domain] || 0) + 1

                }));

            }

        } else {

            if (wasCorrect && !isNowCorrect) {

                setByDomCorrect(prev => ({

                    ...prev,

                    [questao.domain]: Math.max(0, (prev[questao.domain] || 1) - 1)

                }));

            } else if (!wasCorrect && isNowCorrect) {

                setByDomCorrect(prev => ({

                    ...prev,

                    [questao.domain]: (prev[questao.domain] || 0) + 1

                }));

            }

        }



        // Salvar resposta no Supabase

        await recordAnswer(i, normalizeSelection(answer), isNowCorrect);

    };

    
    const proxima = () => {
        if (i + 1 < quizSize) {
            setI(i + 1);
        } else if (!navAfterBack) {
            finalize();
        }
    };
    
    const goPrev = () => { if (i > 0) setI(i - 1); };

    // Proteção: não renderizar se não houver questões
    if (!quizBank || quizBank.length === 0 || !questao) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        {t('quiz:loading.loading_questions')}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                        {t('quiz:loading.check_connection')}
                    </div>
                    <div className="mt-6">
                        <Button onClick={onExit}>{t('common:navigation.back_to_dashboard')}</Button>
                    </div>
                </div>
            </div>
        );
    }

    const correctCount = resps.filter((answer, idx) => {

        const question = quizBank[idx % quizBank.length];

        if (!question) return false;

        return answersEqual(answer, question.answerKey);

    }).length;
    const timePct = timed && durationSec ? Math.max(0, Math.min(100, Math.round((secsLeft / durationSec) * 100))) : 0;

    const answeredCount = resps.filter(r => Array.isArray(r) && r.length > 0).length;
    const markedCount = Object.values(marked).filter(m => m).length;
    const unansweredCount = quizSize - answeredCount;

    let modalText = t('quiz:finish_modal.answered_count', { answered: answeredCount, total: quizSize });
    if (markedCount > 0) {
        modalText += ' ' + t(`quiz:finish_modal.marked_count_${markedCount === 1 ? 'one' : 'other'}`, { count: markedCount });
    }
    if (unansweredCount > 0) {
        modalText += ' ' + t(`quiz:finish_modal.unanswered_count_${unansweredCount === 1 ? 'one' : 'other'}`, { count: unansweredCount });
    }
    modalText += ' ' + t('quiz:finish_modal.confirm');

    const Grid = () => (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl shadow-sm">
            <div className={`flex items-center ${isGridCollapsed ? 'justify-end' : 'justify-between mb-4'}`}>
                {!isGridCollapsed && (
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-full" />{t('quiz:navigation_legend.answered')}</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full" />{t('quiz:navigation_legend.marked')}</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 border border-gray-400 rounded-full" />{t('quiz:navigation_legend.pending')}</div>
                    </div>
                )}
                <button
                    onClick={() => setIsGridCollapsed(!isGridCollapsed)}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
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
            </div>
            {!isGridCollapsed && (
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: quizSize }).map((_, index) => {
                        const responseEntry = resps[index];
                        const hasResponse = Array.isArray(responseEntry) && responseEntry.length > 0;
                        const isMarked = marked[index];
                        const isActive = i === index;

                        let buttonClass = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                        if (isMarked) { // Marked takes precedence over response
                            buttonClass = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
                        } else if (hasResponse) {
                            buttonClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => { console.log(`[Quiz] Navegar para questão`, index + 1); setI(index); }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${buttonClass} ${isActive ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                            >{index + 1}</button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#050b1a]">
            <div aria-hidden className="absolute inset-0 opacity-100" style={backgroundStyle} />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-screen opacity-[0.18]"
                style={{
                    background: `radial-gradient(80% 60% at 20% 80%, ${toRgba(certTheme.primary, 0.35)} 0%, transparent 70%)`,
                }}
            />

            <div className="relative z-10 flex min-h-screen flex-col">
                <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b dark:border-gray-700 sticky top-0 z-30">
                    <div className={`mx-auto px-4 py-3 ${navAfterBack ? 'max-w-7xl' : 'max-w-4xl'}`}>
                        <div className="flex items-center justify-between">
                            {/* Logo - icon only on mobile, full logo on desktop */}
                            <div className="block sm:hidden">
                                <Logo onClick={onVoltar} iconOnly={true} size={40} />
                            </div>
                            <div className="hidden sm:block">
                                <Logo onClick={onVoltar} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                                <div data-tour="quiz-progress" className="text-xs font-semibold">{i + 1}/{quizSize}</div>
                                {timed && <div className="hidden sm:block text-xs font-semibold" data-tour="quiz-timer">{fmtTime(secsLeft)}</div>}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const store = useLanguageStore.getState();
                                      if (store.language !== 'en') {
                                        store.setLanguage('en');
                                      }
                                    }}
                                    className={`flex items-center justify-center hover:opacity-70 transition-opacity rounded-sm overflow-hidden border ${useLanguageStore.getState().language === 'en' ? 'border-blue-500 border-2' : 'border-gray-300 dark:border-gray-600'}`}
                                    title="English"
                                    style={{ aspectRatio: '16/10', width: '36px' }}
                                  >
                                    <img
                                      src="/flag-us.png"
                                      alt="English"
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const store = useLanguageStore.getState();
                                      if (store.language !== 'pt-BR') {
                                        store.setLanguage('pt-BR');
                                      }
                                    }}
                                    className={`flex items-center justify-center hover:opacity-70 transition-opacity rounded-sm overflow-hidden border ${useLanguageStore.getState().language === 'pt-BR' ? 'border-green-500 border-2' : 'border-gray-300 dark:border-gray-600'}`}
                                    title="Português"
                                    style={{ aspectRatio: '16/10', width: '36px' }}
                                  >
                                    <img
                                      src="/flag-br.png"
                                      alt="Português"
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                </div>
                                {navAfterBack && <Button onClick={() => setShowConfirm(true)} data-tour="quiz-finish">{t('quiz:header.finish')}</Button>}
                                {toggleTheme && (
                                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                                    </button>
                                )}
                                {onVoltar && (
                                    <button
                                        onClick={onVoltar}
                                        className="hidden sm:block rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        {t('quiz:header.back')}
                                    </button>
                                )}
                                <GhostButton onClick={onExit}>{t('quiz:header.exit')}</GhostButton>
                            </div>
                        </div>
                        {timed && (<div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 w-full overflow-hidden rounded-full"><div className="h-1 bg-gradient-to-r from-blue-600 to-rose-500 transition-all rounded-full" style={{ width: `${timePct}%` }} /></div>)}
                    </div>
                </header>

            <main className={`mx-auto px-4 py-8 ${navAfterBack ? 'max-w-7xl' : 'max-w-4xl'}`}>
                {diagramUrl && (
                    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 rounded-xl mb-6">
                        <img src={diagramUrl} alt="Diagrama da Arquitetura" className="w-full h-auto rounded-lg" />
                    </div>
                )}
                <div className="mb-6" data-tour="quiz-navigation">
                    <Grid />
                </div>
                
                {navAfterBack ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-3">
                            <QuestionViewer
                                questao={questao}
                                indice={i}
                                total={quizSize}
                                onEnviar={enviar}
                                onProxima={proxima}
                                level={level}
                                onPrev={i > 0 ? goPrev : undefined}
                                initialAnswer={resps[i] || []}
                                plano={plano}
                                isMarked={!!marked[i]}
                                onMark={() => setMarked(prev => ({ ...prev, [i]: !prev[i] }))}
                                navAfterBack={navAfterBack}
                            />
                         </div>
                     </div>
                ) : (
                    <QuestionViewer
                        questao={questao}
                        indice={i}
                        total={quizSize}
                        onEnviar={enviar}
                        onProxima={proxima}
                        level={level}
                        onPrev={undefined}
                        initialAnswer={resps[i] || []}
                        plano={plano}
                        isMarked={!!marked[i]}
                        onMark={() => setMarked(prev => ({ ...prev, [i]: !prev[i] }))}
                        navAfterBack={navAfterBack}
                    />
                )}

                {/* Ko-fi Widget positioned below answer cards (mobile only) */}
                <div className="flex justify-center mt-6 mb-8 md:hidden">
                    <KofiWidget showFloatingButton={true} inline={true} className="" />
                </div>
            </main>

            <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title={t('quiz:finish_modal.title')}>
                <p className="text-gray-800 dark:text-gray-300">{modalText}</p>
                {markedCount > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-sm">{t('quiz:finish_modal.reminder_marked')}</span>
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={() => setShowConfirm(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('quiz:finish_modal.cancel')}</Button>
                    <Button onClick={() => {
                        console.log('[QuizScreen] Botão "Sim, finalizar" clicado');
                        setShowConfirm(false);
                        finalize();
                    }} className="bg-red-600 hover:bg-red-700">{t('quiz:finish_modal.confirm_finish')}</Button>
                </div>
            </Modal>

            {/* Lembrete de Contribuição */}
            <ContributionOverlay
                isOpen={shouldShowReminder}
                onClose={closeReminder}
            />

            {/* Ko-fi Widget fixed position (desktop only) */}
            <div className="hidden md:block">
                <KofiWidget showFloatingButton={true} className="" />
            </div>
        </div>
    </div>
    );
};
