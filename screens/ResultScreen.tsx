import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResultSummary, Domain } from '../types';
import { GhostButton, Button } from '../components/ui/Button';
import { DonutChart } from '../components/charts/DonutChart';
import { MoonIcon, SunIcon } from '../components/common/Icons';
import { Logo } from '../components/common/Logo';
import { DOMAIN_LABELS, DONUT_COLORS } from '../constants';
import { cn } from '../utils';
import { useCertificationStore } from '../store/certificationStore';
import { DomainTag } from '../components/common/DomainTag';
import { ThemedDonationModal } from '../components/donation/ThemedDonationModal';
import { Modal } from '../components/ui/Modal';
import { getPixEnvConfig } from '../utils/pixUtils';

interface ResultScreenProps {
    summary: ResultSummary | null;
    onBack: () => void;
    onVoltar?: () => void;
    theme?: string;
    toggleTheme?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
    summary,
    onBack,
    onVoltar,
    theme = 'light',
    toggleTheme,
}) => {
    const { t } = useTranslation(['results', 'common']);
    const { selectedCertId } = useCertificationStore();
    const [loading, setLoading] = useState(true);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showExitPrompt, setShowExitPrompt] = useState(false);
    const [pendingNav, setPendingNav] = useState<'back' | 'exit' | null>(null);
    const { chave: pixKey, nomeRecebedor: pixReceiverName } = getPixEnvConfig();

    useEffect(() => {
        const tId = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(tId);
    }, []);

    // Mostrar modal de doação após 3 segundos se o usuário passou.
    useEffect(() => {
        if (!loading && summary) {
            const percentage = summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0;
            const pass = percentage >= 70;
            if (pass) {
                const timer = setTimeout(() => setShowDonationModal(true), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [loading, summary]);

    const score = summary?.score ?? 100;
    const total = summary?.total ?? 0;
    const correct = summary?.correct ?? 0;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const pass = percentage >= 70;

    const domains = useMemo(() => {
        const totals = summary?.byDomainTotal || {};
        const corrects = summary?.byDomainCorrect || {};
        const keys = new Set<string>([...Object.keys(totals), ...Object.keys(corrects)]);
        return Array.from(keys) as Domain[];
    }, [summary]);

    const chartData = domains.map((k) => ({
        key: k,
        name: DOMAIN_LABELS[k] || k,
        value: summary?.byDomainCorrect?.[k] ?? 0,
        total: summary?.byDomainTotal?.[k] ?? 0,
    }));

    const DOMAIN_LABELS_PT: Record<string, string> = {
        SECURE: 'Arquitetura Segura',
        RESILIENT: 'Arquitetura Resiliente',
        PERFORMANCE: 'Arquitetura de Alto Desempenho',
        COST: 'Otimização de Custos',
        CLOUD_CONCEPTS: 'Conceitos de Cloud',
        CLOUD_TECHNOLOGY_SERVICES: 'Tecnologia e Serviços',
        SECURITY_COMPLIANCE: 'Segurança e Conformidade',
        BILLING_PRICING: 'Faturamento e Precificação',
        TECHNOLOGY: 'Tecnologia e Serviços',
        RESPONSIBLE_AI: 'IA Responsável',
        AI_SERVICES: 'Serviços de IA',
        AI_FUNDAMENTALS: 'Fundamentos de IA',
        ML_DEVELOPMENT: 'Desenvolvimento de ML',
        AI_SECURITY: 'Segurança de IA',
        AI_APPLICATIONS: 'Aplicações de IA',
        AI_GOVERNANCE: 'Governança de IA',
        DESIGN_SECURE_APPLICATIONS_ARCHITECTURES: 'Arquiteturas Seguras',
        DESIGN_RESILIENT_ARCHITECTURES: 'Arquiteturas Resilientes',
        DESIGN_COST_OPTIMIZED_ARCHITECTURES: 'Arquiteturas Otimizadas em Custo',
        DESIGN_HIGH_PERFORMING_ARCHITECTURES: 'Arquiteturas de Alto Desempenho',
    };

    const domainReport = useMemo(() => {
        const entries = domains.map((d) => {
            const totalD = summary?.byDomainTotal?.[d] ?? 0;
            const correctD = summary?.byDomainCorrect?.[d] ?? 0;
            const pct = totalD > 0 ? Math.round((correctD / totalD) * 100) : 0;
            return {
                key: d,
                label: DOMAIN_LABELS_PT[d] || DOMAIN_LABELS[d] || d,
                correct: correctD,
                total: totalD,
                pct,
            };
        });
        return entries.sort((a, b) => a.pct - b.pct);
    }, [domains, summary]);

    const wrongAnswers = useMemo(() => {
        if (!summary?.reviews) return [];
        return summary.reviews.filter((r) => !r.isCorrect);
    }, [summary]);

    const formatAnswers = (arr: string[]) => (arr.length ? arr.join(', ') : '-');

    const askToSupportBeforeLeave = (nav: 'back' | 'exit') => {
        setPendingNav(nav);
        setShowExitPrompt(true);
    };

    const handleLeaveAfterPrompt = () => {
        setShowExitPrompt(false);
        if (pendingNav === 'back') onBack();
        if (pendingNav === 'exit' && onVoltar) onVoltar();
        setPendingNav(null);
    };

    return (
        <div className="min-h-screen grid place-items-center p-6 relative overflow-hidden">
            <style>{`
                @keyframes confetti-explode { 0% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 100% { transform: translate(var(--x), var(--y)) scale(0) rotate(720deg); opacity: 0; } }
                @keyframes screen-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); } 20%, 40%, 60%, 80% { transform: translateX(2px); } }
                .animate-screen-shake { animation: screen-shake 0.4s ease-in-out; }
            `}</style>
            {pass && !loading && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    {Array.from({ length: 150 }).map((_, idx) => {
                        const angle = Math.random() * 360;
                        const distance = Math.random() * 50 + 50;
                        const x = `calc(-50% + ${Math.cos((angle * Math.PI) / 180) * distance}vw)`;
                        const y = `calc(-50% + ${Math.sin((angle * Math.PI) / 180) * distance}vh)`;
                        return (
                            <div
                                key={idx}
                                className="absolute w-2 h-4 top-1/2 left-1/2"
                                style={
                                    {
                                        '--x': x,
                                        '--y': y,
                                        backgroundColor: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#a855f7'][idx % 5],
                                        animation: `confetti-explode ${1 + Math.random()}s ease-out forwards`,
                                    } as React.CSSProperties
                                }
                            />
                        );
                    })}
                </div>
            )}
            <div
                className={cn(
                    'w-full max-w-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-2xl shadow-2xl relative z-10',
                    pass && !loading && 'animate-screen-shake'
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="block sm:hidden">
                        <Logo onClick={onVoltar} iconOnly size={40} />
                    </div>
                    <div className="hidden sm:block">
                        <Logo onClick={onVoltar} />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => askToSupportBeforeLeave('back')}
                            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            {t('results:actions.back')}
                        </button>
                        {toggleTheme && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            >
                                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                            </button>
                        )}
                        {onVoltar && (
                            <GhostButton onClick={() => askToSupportBeforeLeave('exit')}>
                                {t('results:actions.exit')}
                            </GhostButton>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid place-items-center py-12">
                        <div className="w-10 h-10 rounded-full border-4 border-purple-800 border-t-transparent animate-spin" />
                        <div className="mt-4 text-gray-600 dark:text-gray-400">{t('results:loading.calculating')}</div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pass && (
                            <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                    {t('results:congratulations.title')}
                                </div>
                                <p className="text-lg text-gray-700 dark:text-gray-300">
                                    {t('results:congratulations.message', { cert: selectedCertId })}
                                </p>
                            </div>
                        )}

                        <div className="text-center">
                            <div
                                className={cn(
                                    'inline-block px-5 py-4 border-2',
                                    pass
                                        ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-300'
                                        : 'border-red-600 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300'
                                )}
                                style={{ borderRadius: 14 }}
                            >
                                <div className="text-xs font-semibold uppercase tracking-wider">
                                    {t('results:congratulations.aws_score')}
                                </div>
                                <div className="mt-1 font-extrabold tracking-tight tabular-nums">
                                    <span className="text-5xl">{score}</span>
                                    <span className="mx-1 text-5xl">/</span>
                                    <span className="text-5xl">1000</span>
                                </div>
                                <div className="mt-3 text-2xl font-bold">
                                    {t('results:congratulations.percentage', { percent: percentage })}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        {t('results:charts.overall')}
                                    </div>
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {correct}/{total}
                                    </div>
                                </div>
                                <DonutChart
                                    data={[
                                        { name: t('results:charts.correct'), value: correct, color: '#10b981' },
                                        { name: t('results:charts.wrong'), value: total - correct, color: '#ef4444' },
                                    ]}
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {t('results:charts.by_domain')}
                                </div>
                                <div className="space-y-2">
                                    {chartData.map((item) => {
                                        const totalDomain = item.total;
                                        const value = item.value;
                                        const pct = totalDomain > 0 ? Math.round((value / totalDomain) * 100) : 0;
                                        const color = DONUT_COLORS[item.key] || '#6366f1';
                                        return (
                                            <div key={item.key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                        {DOMAIN_LABELS_PT[item.key] || item.name}
                                                    </span>
                                                    <span className="text-sm font-semibold" style={{ color }}>
                                                        {value}/{totalDomain} ({pct}%)
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 0.5s ease' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {t('results:review.title')}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {wrongAnswers.length === 0
                                        ? t('results:review.all_correct')
                                        : t('results:review.wrong_count', { count: wrongAnswers.length })}
                                </div>
                            </div>

                            {wrongAnswers.length === 0 ? (
                                <div className="text-center text-green-600 dark:text-green-400 font-semibold py-6">
                                    {t('results:review.all_correct_message')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {wrongAnswers.map((w, idx) => (
                                        <div
                                            key={w.questionId}
                                            className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Q{idx + 1}</div>
                                                <DomainTag domain={w.domain as Domain} />
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{w.stem}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                                <div>
                                                    <span className="font-semibold text-red-600 dark:text-red-400">Sua resposta: </span>
                                                    {formatAnswers(w.userAnswer)}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">Correta: </span>
                                                    {formatAnswers(w.correctAnswer)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* PIX Donation Modal - shown after completion */}
            <ThemedDonationModal
                isOpen={showDonationModal}
                onClose={() => setShowDonationModal(false)}
                pixKey={pixKey}
                pixReceiverName={pixReceiverName}
                pixReceiverCity="Sao Joao de Meriti"
                theme="landing"
                onDonationComplete={(amount) => {
                    console.log(`Doação de R$ ${amount} realizada via PIX`);
                }}
            />

            {/* Prompt ao tentar sair da tela de resultados */}
            <Modal
                open={showExitPrompt}
                onClose={() => {
                    setShowExitPrompt(false);
                    setPendingNav(null);
                }}
                title="Gostou do treino?"
            >
                <div className="space-y-4">
                    <p className="text-gray-800 dark:text-gray-200">
                        Gostou? Ajude a manter este projeto vivo com uma pequena doação. Seu apoio mantém o conteúdo gratuito.
                    </p>
                    <div className="grid gap-2 sm:flex sm:justify-end">
                        <GhostButton onClick={handleLeaveAfterPrompt}>Sair mesmo assim</GhostButton>
                        <Button
                            onClick={() => {
                                setShowExitPrompt(false);
                                setShowDonationModal(true);
                            }}
                        >
                            Apoiar agora
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
