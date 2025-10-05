
import React, { useState } from 'react';
import { Button, GhostButton } from '../components/ui/Button';
import { Logo } from '../components/common/Logo';
import { StatPill } from '../components/common/StatPill';
import { Domain, DomainConfig } from '../types';
import { R } from '../constants';
import { cn } from '../utils';

interface DominiosScreenProps {
    onVoltar: () => void;
    onIniciar: (config: DomainConfig) => void;
}

const DOMAIN_OPTIONS = [
    { key: Domain.SECURE, label: 'Arquitetura segura', pct: 30 },
    { key: Domain.RESILIENT, label: 'Arquitetura resiliente', pct: 26 },
    { key: Domain.PERFORMANCE, label: 'Arquitetura de alto desempenho', pct: 24 },
    { key: Domain.COST, label: 'Arquitetura com custo otimizado', pct: 20 },
];

export const DominiosScreen: React.FC<DominiosScreenProps> = ({ onVoltar, onIniciar }) => {
    const [qtd, setQtd] = useState(20);
    const [dom, setDom] = useState({ SECURE: true, RESILIENT: true, PERFORMANCE: true, COST: true });

    const handleCheckboxChange = (key: Domain, checked: boolean) => {
        setDom(s => ({ ...s, [key]: checked }));
    };

    return (
        <div className="min-h-screen">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center gap-2">
                        <StatPill label="Total" value={`${qtd}`} />
                        <GhostButton onClick={onVoltar}>Voltar</GhostButton>
                        <button type="button" onClick={() => onIniciar({ qtd, dom })} className={cn("px-4 py-2 bg-gradient-to-r from-purple-800 to-fuchsia-800 text-white font-semibold", R.md)}>Iniciar</button>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Prática por Domínios</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {DOMAIN_OPTIONS.map(d => (
                        <label key={d.key} className={cn("border bg-white dark:bg-gray-800 dark:border-gray-700 p-4 flex items-start gap-3", R.lg)}>
                            <input
                                type="checkbox"
                                className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                                checked={dom[d.key]}
                                onChange={e => handleCheckboxChange(d.key, e.target.checked)}
                            />
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{d.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">SAA‑C03 ~ {d.pct}%</div>
                            </div>
                        </label>
                    ))}
                </div>
                <div className="mt-6 flex items-center gap-3">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Quantidade de questões</label>
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
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sem proporções obrigatórias</div>
                </div>
            </main>
        </div>
    );
};
