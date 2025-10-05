
import React from 'react';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/common/Logo';
import { StatPill } from '../components/common/StatPill';
import { LockIcon, MoonIcon, SunIcon } from '../components/common/Icons';
import { Plano } from '../types';

interface PainelProps {
    plano: Plano;
    totalQuestoes: number;
    onQuizRapido: () => void;
    onQuizCompleto: () => void;
    onDominios: () => void;
    onRevisao: () => void;
    onCenario: () => void;
    onFlashcards: () => void;
    onEvolucao: () => void;
    theme: string;
    toggleTheme: () => void;
}

export const Painel: React.FC<PainelProps> = ({
    plano, totalQuestoes, onQuizRapido, onQuizCompleto, onDominios, onRevisao, onCenario, onFlashcards, onEvolucao, theme, toggleTheme
}) => {
    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200">
            <header className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <StatPill label="Total" value={`${totalQuestoes}`} />
                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                            Plano: {plano === 'FREE' ? <b className="ml-1 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Gratuito</b> : <b className="ml-1 text-blue-300">PRO</b>}
                        </div>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card
                        title="Quiz Rápido"
                        subtitle={plano === 'PRO' ? "35 questões. Acesso total ao banco de questões." : "35 questões. Acesso limitado ao banco de questões."}
                        onClick={onQuizRapido}
                        badge={<div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full text-xs font-semibold shadow-sm">GRATUITO</div>}
                    />
                    <Card
                        title={<div className="flex items-center gap-2">Quiz Completo {plano !== "PRO" && <LockIcon />}</div>}
                        subtitle="Responda 65 questões em até 130 minutos. Acesso total ao pool de questões."
                        onClick={onQuizCompleto}
                        disabled={plano !== "PRO"}
                        badge={<div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-full text-xs font-semibold shadow-sm">PRO</div>}
                    />
                    <Card
                        title={<div className="flex items-center gap-2">Prática por Domínios {plano !== "PRO" && <LockIcon />}</div>}
                        subtitle="Pratique seus conhecimentos sobre os domínios da prova oficial da AWS."
                        onClick={onDominios}
                        disabled={plano !== "PRO"}
                        badge={<div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-full text-xs font-semibold shadow-sm">PRO</div>}
                    />
                    <Card
                        title={<div className="flex items-center gap-2">Modo Revisão {plano !== "PRO" && <LockIcon />}</div>}
                        subtitle="Pratique sem pressa, no seu tempo."
                        onClick={onRevisao}
                        disabled={plano !== "PRO"}
                        badge={<div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-full text-xs font-semibold shadow-sm">PRO</div>}
                    />
                    <Card
                        title={<div className="flex items-center gap-2">Gerador de Cenários {plano !== "PRO" && <LockIcon />}</div>}
                        subtitle="Descreva um problema e criamos um quiz rápido sob medida."
                        onClick={onCenario}
                        disabled={plano !== "PRO"}
                        badge={<div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-full text-xs font-semibold shadow-sm">PRO</div>}
                    />
                    <Card
                        title={<div className="flex items-center gap-2">Flashcards {plano !== "PRO" && <LockIcon />}</div>}
                        subtitle="Memorize com repetição espaçada."
                        onClick={onFlashcards}
                        disabled={plano !== "PRO"}
                        badge={<div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-full text-xs font-semibold shadow-sm">PRO</div>}
                    />
                    <Card
                        title={<div className="flex items-center gap-2">Meu Progresso {plano !== "PRO" && <LockIcon />}</div>}
                        subtitle="Acompanhe sua evolução e receba dicas de aprendizado."
                        onClick={onEvolucao}
                        disabled={plano !== "PRO"}
                        badge={<div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-full text-xs font-semibold shadow-sm">PRO</div>}
                    />
                </div>
            </main>
        </div>
    );
}
