
import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { GhostButton } from '../components/ui/Button';
import { QuestionViewer } from '../components/quiz/QuestionViewer';
import { Q_BANK } from '../constants';
import { Plano } from '../types';
import { cn } from '../utils';

interface ReviewScreenProps {
    onBack: () => void;
    plano: Plano;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ onBack, plano }) => {
    const total = 65;
    const [ativo, setAtivo] = useState(0);
    const [respondidas, setRespondidas] = useState<{ [key: number]: boolean }>({});
    const [marked, setMarked] = useState<{ [key: number]: boolean }>({});
    const questao = Q_BANK[ativo % Q_BANK.length];

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
                        initialAnswer=""
                    />
                </div>
            </main>
        </div>
    );
};
