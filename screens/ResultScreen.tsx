import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResultSummary, Domain } from '../types';
import { GhostButton, Button } from '../components/ui/Button';
import { DonutChart } from '../components/charts/DonutChart';
import { Logo } from '../components/common/Logo';
import { DOMAIN_LABELS, DONUT_COLORS } from '../constants';
import { cn } from '../utils';
import { useCertificationStore } from '../store/certificationStore';
import { ThemedDonationModal } from '../components/donation/ThemedDonationModal';
import { Modal } from '../components/ui/Modal';
import { getPixEnvConfig } from '../utils/pixUtils';
import { ThemedSupportButton } from '../components/donation/ThemedSupportButton';

interface ResultScreenProps {
    summary: ResultSummary | null;
    onBack: () => void;
    onVoltar?: () => void;
    theme?: string;
    toggleTheme?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ summary, onBack, onVoltar }) => {
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
        // SAA-C03
        SECURE: "Arquitetura Segura",
        RESILIENT: "Arquitetura Resiliente",
        PERFORMANCE: "Arquitetura de Alto Desempenho",
        COST: "Otimização de Custos",
        DESIGN_SECURE_APPLICATIONS_ARCHITECTURES: "Arquiteturas Seguras",
        DESIGN_RESILIENT_ARCHITECTURES: "Arquiteturas Resilientes",
        DESIGN_COST_OPTIMIZED_ARCHITECTURES: "Arquiteturas Otimizadas em Custo",
        DESIGN_HIGH_PERFORMING_ARCHITECTURES: "Arquiteturas de Alto Desempenho",
        // CLF-C02
        CLOUD_CONCEPTS: "Conceitos de Cloud",
        CLOUD_TECHNOLOGY_SERVICES: "Tecnologia e Serviços",
        SECURITY_COMPLIANCE: "Segurança e Conformidade",
        BILLING_PRICING: "Faturamento e Precificação",
        TECHNOLOGY: "Tecnologia e Serviços",
        // AIF-C01
        RESPONSIBLE_AI: "IA Responsável",
        AI_SERVICES: "Serviços de IA",
        AI_FUNDAMENTALS: "Fundamentos de IA",
        ML_DEVELOPMENT: "Desenvolvimento de ML",
        // DVA-C02
        DEPLOYMENT: "Implantação",
        DVA_SECURITY: "Segurança",
        SECURITY: "Segurança",
        DEVELOPMENT: "Desenvolvimento",
        REFACTORING: "Refatoração",
        MONITORING: "Monitoramento",
        // Extras
        AI_SECURITY: "Segurança de IA",
        AI_APPLICATIONS: "Aplicações de IA",
        AI_GOVERNANCE: "Governança de IA",
    };

    const resolveLabel = (raw: string) => {
        const key = (raw || '').trim();
        const upperKey = key.toUpperCase();
        return (
            DOMAIN_LABELS_PT[key] ||
            DOMAIN_LABELS_PT[upperKey] ||
            DOMAIN_LABELS[key] ||
            DOMAIN_LABELS[upperKey] ||
            key
        );
    };

    const domainReport = useMemo(() => {
        const entries = domains.map((d) => {
            const totalD = summary?.byDomainTotal?.[d] ?? 0;
            const correctD = summary?.byDomainCorrect?.[d] ?? 0;
            const pct = totalD > 0 ? Math.round((correctD / totalD) * 100) : 0;
            return {
                key: d,
                label: resolveLabel(d),
                correct: correctD,
                total: totalD,
                pct,
            };
        });
        return entries.sort((a, b) => a.pct - b.pct);
    }, [domains, summary]);

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
                                    {t('results:congratulations.percentage', { percentage })}
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
                                        { key: 'correct', value: correct, color: '#10b981' },
                                        { key: 'wrong', value: Math.max(total - correct, 0), color: '#ef4444' },
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
                                        const color = DONUT_COLORS[item.key as keyof typeof DONUT_COLORS] || '#6366f1';
                                        return (
                                            <div key={item.key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                        {resolveLabel(item.key)}
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

            <div className="mt-8">
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#0f172a] via-[#1f2937] to-[#0b1021] shadow-2xl">
                    <div className="pointer-events-none absolute inset-0 opacity-50 blur-3xl" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.25), transparent 35%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.2), transparent 40%)' }} />
                    <div className="relative flex flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
                        <div className="space-y-1 text-left md:max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-100/80">Apoie o projeto</p>
                            <h3 className="text-2xl font-bold text-white">O simulado foi útil pra você?</h3>
                            <p className="text-sm text-purple-50/90">
                                Considere uma pequena doação para manter este projeto vivo, acessível e sempre atualizado.
                            </p>
                        </div>
                        <ThemedSupportButton
                            variant="inline"
                            theme="landing"
                            onClick={() => setShowDonationModal(true)}
                            className="drop-shadow-[0_10px_25px_rgba(99,102,241,0.45)]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
