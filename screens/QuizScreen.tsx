import React, { useState, useEffect } from 'react';
import { QuestionViewer } from '../components/quiz/QuestionViewer';
import { Logo } from '../components/common/Logo';
import { Button, GhostButton } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Question, Plano, ResultSummary, DomainStats } from '../types';
import { Q_BANK } from '../constants';
import { fmtTime, weightedAccuracy } from '../utils';

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
    diagramUrl?: string | null;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
    plano, tamanho, onSair, level = 'basic', timed = false, durationSec = 0, navAfterBack = false, questions, onExit, diagramUrl
}) => {
    const [i, setI] = useState(0);
    const [resps, setResps] = useState<(string | null)[]>([]);
    const [marked, setMarked] = useState<{ [key: number]: boolean }>({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [byDomCorrect, setByDomCorrect] = useState<DomainStats>({ SECURE: 0, RESILIENT: 0, PERFORMANCE: 0, COST: 0 });
    const [byDomTotal, setByDomTotal] = useState<DomainStats>({ SECURE: 0, RESILIENT: 0, PERFORMANCE: 0, COST: 0 });
    const [secsLeft, setSecsLeft] = useState(durationSec);

    const quizBank = questions || Q_BANK;
    const quizSize = tamanho || quizBank.length;
    const questao = quizBank[i % quizBank.length];

    const finalize = () => {
        const correct = resps.filter((a, idx) => a === quizBank[idx % quizBank.length].answerKey).length;
        const wAcc = weightedAccuracy(byDomCorrect, byDomTotal);
        const summary: ResultSummary = {
            correct,
            total: quizSize,
            score: 100 + Math.round(wAcc * 900),
            byDomainCorrect: byDomCorrect,
            byDomainTotal: byDomTotal,
        };
        onSair(summary);
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

    const enviar = (answer: string) => {
        const prevAnswer = resps[i];
        const isFirstTimeAnswered = prevAnswer === undefined || prevAnswer === null;
        const wasCorrect = prevAnswer === questao.answerKey;
        const isNowCorrect = answer === questao.answerKey;
    
        const newResps = [...resps];
        newResps[i] = answer;
        setResps(newResps);
        
        if (isFirstTimeAnswered) {
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
                setByDomCorrect(prev => ({ ...prev, [questao.domain]: (prev[questao.domain] || 1) - 1 }));
            } else if (!wasCorrect && isNowCorrect) {
                setByDomCorrect(prev => ({ ...prev, [questao.domain]: (prev[questao.domain] || 0) + 1 }));
            }
        }
    };
    
    const proxima = () => {
        if (i + 1 < quizSize) {
            setI(i + 1);
        } else if (!navAfterBack) {
            finalize();
        }
    };
    
    const goPrev = () => { if (i > 0) setI(i - 1); };

    const correctCount = resps.filter((a, idx) => a === quizBank[idx % quizBank.length].answerKey).length;
    const timePct = timed && durationSec ? Math.max(0, Math.min(100, Math.round((secsLeft / durationSec) * 100))) : 0;

    const answeredCount = resps.filter(r => r != null).length;
    const modalText = `Você respondeu ${answeredCount} de ${quizSize} questões. Tem certeza de que deseja finalizar o simulado? Suas respostas serão enviadas para avaliação.`;

    const Grid = () => (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">Revisão</h3>
            <div className="flex items-center gap-4 text-xs mb-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-full" />Respondida</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-full" />Marcada</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 border border-gray-400 rounded-full" />Pendente</div>
            </div>
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: quizSize }).map((_, index) => {
                    const hasResponse = resps[index] != null;
                    const isMarked = marked[index];
                    const isActive = i === index;

                    let buttonClass = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                    if (isMarked) { // Marked takes precedence
                        buttonClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                    } else if (hasResponse) {
                        buttonClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => setI(index)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${buttonClass} ${isActive ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                        >{index + 1}</button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b dark:border-gray-700 sticky top-0 z-30">
                <div className={`mx-auto px-4 py-3 ${navAfterBack ? 'max-w-7xl' : 'max-w-4xl'}`}>
                    <div className="flex items-center justify-between">
                        <Logo />
                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <div>Progresso: <b>{i + 1}/{quizSize}</b></div>
                            {timed && <div className="hidden sm:block">Tempo: <b>{fmtTime(secsLeft)}</b></div>}
                            <div>Acertos: <b>{correctCount}</b></div>
                            {navAfterBack && <Button onClick={() => setShowConfirm(true)}>Finalizar</Button>}
                            <GhostButton onClick={onExit}>Sair</GhostButton>
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
                
                {navAfterBack ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2">
                            <QuestionViewer
                                questao={questao}
                                indice={i}
                                total={quizSize}
                                onEnviar={enviar}
                                onProxima={proxima}
                                level={level}
                                onPrev={i > 0 ? goPrev : undefined}
                                initialAnswer={resps[i] || ""}
                                plano={plano}
                                isMarked={!!marked[i]}
                                onMark={() => setMarked(prev => ({ ...prev, [i]: !prev[i] }))}
                                navAfterBack={navAfterBack}
                            />
                         </div>
                         <div className="lg:col-span-1">
                            <Grid />
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
                        initialAnswer={resps[i] || ""}
                        plano={plano}
                        isMarked={!!marked[i]}
                        onMark={() => setMarked(prev => ({ ...prev, [i]: !prev[i] }))}
                        navAfterBack={navAfterBack}
                    />
                )}
            </main>

            <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Finalizar Simulado?">
                <p>{modalText}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={() => setShowConfirm(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Continuar</Button>
                    <Button onClick={finalize} className="bg-red-600 hover:bg-red-700">Sim, finalizar</Button>
                </div>
            </Modal>
        </div>
    );
};
