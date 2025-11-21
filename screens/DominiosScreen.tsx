
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/common/Logo';
import { Domain, DomainConfig } from '../types';
import { R, DOMAIN_LABELS } from '../constants';
import { cn } from '../utils';
import { useCertificationStore } from '../store/certificationStore';

interface DominiosScreenProps {
    onVoltar: () => void;
    onBackToLanding?: () => void;
    onIniciar: (config: DomainConfig) => void;
}

// Mapeamento de domínios por certificação
const CERT_DOMAINS: Record<string, Array<{ key: Domain; pct: number }>> = {
    'SAA-C03': [
        { key: Domain.SECURE, pct: 30 },
        { key: Domain.RESILIENT, pct: 26 },
        { key: Domain.PERFORMANCE, pct: 24 },
        { key: Domain.COST, pct: 20 },
    ],
    'CLF-C02': [
        { key: Domain.CLOUD_CONCEPTS, pct: 24 },
        { key: Domain.SECURITY_COMPLIANCE, pct: 30 },
        { key: Domain.TECHNOLOGY, pct: 34 },
        { key: Domain.BILLING_PRICING, pct: 12 },
    ],
    'AIF-C01': [
        { key: Domain.RESPONSIBLE_AI, pct: 24 },
        { key: Domain.AI_SERVICES, pct: 30 },
        { key: Domain.AI_FUNDAMENTALS, pct: 24 },
        { key: Domain.ML_DEVELOPMENT, pct: 22 },
    ],
    'DVA-C02': [
        { key: Domain.DEVELOPMENT, pct: 30 },
        { key: Domain.DVA_SECURITY, pct: 26 },
        { key: Domain.DEPLOYMENT, pct: 22 },
        { key: Domain.MONITORING, pct: 12 },
        { key: Domain.REFACTORING, pct: 10 },
    ],
};

export const DominiosScreen: React.FC<DominiosScreenProps> = ({ onVoltar, onBackToLanding, onIniciar }) => {
    const { t } = useTranslation(['domains', 'common']);
    const { selectedCertId } = useCertificationStore();
    const [qtd, setQtd] = useState(20);

    // Obter domínios da certificação selecionada
    const domains = useMemo(() => {
        return CERT_DOMAINS[selectedCertId || 'DVA-C02'] || CERT_DOMAINS['DVA-C02'];
    }, [selectedCertId]);

    const resolveLabel = (key: Domain) => {
        const k = (key as unknown as string) || '';
        const up = k.toUpperCase();
        return DOMAIN_LABELS[k] || DOMAIN_LABELS[up] || k;
    };

    // Inicializar state com todos os domínios marcados
    const [dom, setDom] = useState(() => {
        const initial: Record<string, boolean> = {};
        domains.forEach(d => {
            initial[d.key] = true;
        });
        return initial;
    });

    const handleCheckboxChange = (key: Domain, checked: boolean) => {
        setDom(s => ({ ...s, [key]: checked }));
    };

    return (
        <div className="min-h-screen">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo - icon only on mobile, full logo on desktop */}
                    <div className="block sm:hidden">
                        <Logo onClick={onBackToLanding} iconOnly={true} size={40} />
                    </div>
                    <div className="hidden sm:block">
                        <Logo onClick={onBackToLanding} />
                    </div>
                    <div className="flex items-center gap-2">
                        {onBackToLanding && (
                            <button
                                onClick={onBackToLanding}
                                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                {t('domains:header.back')}
                            </button>
                        )}
                        <button type="button" onClick={() => onIniciar({ qtd, dom })} className={cn("px-4 py-2 bg-gradient-to-r from-purple-800 to-fuchsia-800 text-white font-semibold", R.md)}>{t('domains:actions.start')}</button>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('domains:header.title')}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {domains.map(d => (
                        <label key={d.key} className={cn("border bg-white dark:bg-gray-800 dark:border-gray-700 p-4 flex items-start gap-3", R.lg)}>
                            <input
                                type="checkbox"
                                className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                                checked={dom[d.key]}
                                onChange={e => handleCheckboxChange(d.key, e.target.checked)}
                            />
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{resolveLabel(d.key)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{t('domains:performance.format', { cert: selectedCertId, percentage: d.pct })}</div>
                            </div>
                        </label>
                    ))}
                </div>
                <div className="mt-6 flex items-center gap-3" data-tour="dominios-quantity">
                    <label className="text-sm text-gray-700 dark:text-gray-300">{t('domains:quantity.label')}</label>
                    <input
                        type="number"
                        value={qtd}
                        onChange={(e) => {
                            const num = parseInt(e.target.value, 10);
                            if (!isNaN(num) && num >= 0) {
                                setQtd(num);
                            }
                        }}
                        className="w-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1"
                    />
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('domains:quantity.no_mandatory_proportions')}</div>
                </div>
            </main>
        </div>
    );
};
