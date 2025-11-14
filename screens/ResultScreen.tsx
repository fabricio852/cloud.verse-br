
import React, { useState, useEffect, useMemo } from 'react';
import { ResultSummary, Domain } from '../types';
import { GhostButton } from '../components/ui/Button';
import { DonutChart } from '../components/charts/DonutChart';
import { MoonIcon, SunIcon } from '../components/common/Icons';
import { Logo } from '../components/common/Logo';
import { DOMAIN_LABELS, DONUT_COLORS } from '../constants';
import { cn } from '../utils';
import { useCertificationStore } from '../store/certificationStore';

interface ResultScreenProps {
    summary: ResultSummary | null;
    onBack: () => void;
    onVoltar?: () => void;
    theme?: string;
    toggleTheme?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ summary, onBack, onVoltar, theme = 'light', toggleTheme }) => {
    const { selectedCertId } = useCertificationStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    const score = summary?.score ?? 100;
    const total = summary?.total ?? 0;
    const correct = summary?.correct ?? 0;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const pass = percentage >= 70; // 70% é passing score para AWS

    // Obter domínios baseado na certificação
    const domains = useMemo(() => {
        const byDomain = summary?.byDomainCorrect || {};
        return Object.keys(byDomain) as Domain[];
    }, [summary]);

    const chartData = domains.map(k => ({
        key: k,
        name: DOMAIN_LABELS[k] || k,
        value: summary?.byDomainCorrect?.[k] ?? 0,
        total: summary?.byDomainTotal?.[k] ?? 0,
    }));

    return (
        <div className="min-h-screen grid place-items-center p-6 relative overflow-hidden">
            <style>{`
                @keyframes confetti-explode { 0% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 100% { transform: translate(var(--x), var(--y)) scale(0) rotate(720deg); opacity: 0; } }
                @keyframes screen-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); } 20%, 40%, 60%, 80% { transform: translateX(2px); } }
                .animate-screen-shake { animation: screen-shake 0.4s ease-in-out; }
            `}</style>
            {pass && !loading && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    {Array.from({ length: 150 }).map((_, i) => {
                        const angle = Math.random() * 360;
                        const distance = Math.random() * 50 + 50;
                        const x = `calc(-50% + ${Math.cos(angle * Math.PI / 180) * distance}vw)`;
                        const y = `calc(-50% + ${Math.sin(angle * Math.PI / 180) * distance}vh)`;
                        return (
                            // FIX: Cast style object to React.CSSProperties to allow CSS custom properties.
                            <div key={i} className="absolute w-2 h-4 top-1/2 left-1/2" style={{ '--x': x, '--y': y, backgroundColor: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#a855f7'][i % 5], animation: `confetti-explode ${1 + Math.random()}s ease-out forwards` } as React.CSSProperties} />
                        )
                    })}
                </div>
            )}
            <div className={cn("w-full max-w-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-2xl shadow-2xl relative z-10", pass && !loading && "animate-screen-shake")}>
                <div className="flex items-center justify-between mb-4">
                    {/* Logo - icon only on mobile, full logo on desktop */}
                    <div className="block sm:hidden">
                        <Logo onClick={onVoltar} iconOnly={true} size={40} />
                    </div>
                    <div className="hidden sm:block">
                        <Logo onClick={onVoltar} />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBack}
                            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Back
                        </button>
                        {toggleTheme && (
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                            </button>
                        )}
                        {onVoltar && <GhostButton onClick={onVoltar}>Exit</GhostButton>}
                    </div>
                </div>
                {loading ? (
                    <div className="grid place-items-center py-12"><div className="w-10 h-10 rounded-full border-4 border-purple-800 border-t-transparent animate-spin" /><div className="mt-4 text-gray-600 dark:text-gray-400">Calculating AWS standard score...</div></div>
                ) : (
                    <div className="space-y-6">
                        {pass && (
                            <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Congratulations!</div>
                                <p className="text-lg text-gray-700 dark:text-gray-300">You are prepared for the {selectedCertId} certification!</p>
                            </div>
                        )}
                        <div className="text-center">
                            <div className={cn("inline-block px-5 py-4 border-2", pass ? "border-green-600 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-300" : "border-red-600 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300")} style={{ borderRadius: 14 }}>
                                <div className="text-xs font-semibold uppercase tracking-wider">AWS SCORE</div>
                                <div className="mt-1 font-extrabold tracking-tight tabular-nums"><span className="text-5xl">{score}</span><span className="mx-1 text-5xl">/</span><span className="text-5xl">1000</span></div>
                                <div className="mt-3 text-2xl font-bold">{percentage}%</div>
                            </div>
                            {pass ? (<div className="mt-3 text-lg font-bold text-green-700 dark:text-green-400">✓ Approved</div>) : (<div className="mt-3 text-lg font-bold text-red-700 dark:text-red-400">✗ Failed (minimum 70%)</div>)}
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Estimated score based on correct answers. Not an official AWS score.</div>
                        </div>
                        <div className="border dark:border-gray-700 p-4" style={{ borderRadius: 12 }}>
                            <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">Correct answers by domain</div>
                            <div className="w-full flex items-center justify-center py-4"><DonutChart data={chartData} size={240} thickness={28} /></div>
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                                {chartData.map(e => (<span key={e.key} className="inline-flex items-center gap-2 font-medium text-gray-800 dark:text-gray-300"><span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: DONUT_COLORS[e.key] }} /><span>{DOMAIN_LABELS[e.key]}</span><span className="text-gray-500 dark:text-gray-400">({e.total ? Math.round((e.value / e.total) * 100) : 0}%)</span></span>))}
                            </div>
                        </div>
                        <div className="text-center text-gray-700 dark:text-gray-300">Total correct: <b>{correct}</b> of <b>{total}</b></div>
                    </div>
                )}
            </div>
        </div>
    );
};
