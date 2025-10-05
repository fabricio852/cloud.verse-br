import React, { useState, useMemo } from 'react';
import { GhostButton } from '../components/ui/Button';
import { Logo } from '../components/common/Logo';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Checkbox } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { R } from '../constants';
import { cn } from '../utils';

interface EvolucaoScreenProps {
    onBack: () => void;
}

// --- Mock Data ---
// Function to generate realistic mock data for the last N days
const generateMockData = (days: number) => {
    const data = [];
    let cumulativeTime = 0;
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const questions = Math.floor(Math.random() * 30) + 10 * (1 - i / (days * 1.5));
        const correct = Math.floor(questions * (0.6 + Math.random() * 0.35));
        const time = Math.floor(questions * (1 + Math.random() * 0.5));
        cumulativeTime += time;
        data.push({
            date: date.toISOString().split('T')[0],
            questions,
            correct,
            time,
            cumulativeTime
        });
    }
    return data;
};
const rawData = generateMockData(90);

const METRICS = {
    avgScore: { name: 'Pontuação Média (%)', color: '#ec4899', key: 'avgScore' },
    questions: { name: 'Questões Respondidas', color: '#8b5cf6', key: 'questions' },
    time: { name: 'Tempo de Estudo (min)', color: '#3b82f6', key: 'time' },
};

export const EvolucaoScreen: React.FC<EvolucaoScreenProps> = ({ onBack }) => {
    const [timeRange, setTimeRange] = useState('30d');
    const [granularity, setGranularity] = useState('daily');
    const [visibleMetrics, setVisibleMetrics] = useState<string[]>(['avgScore']);

    const toggleMetric = (metricKey: string) => {
        setVisibleMetrics(prev =>
            prev.includes(metricKey)
                ? prev.filter(m => m !== metricKey)
                : [...prev, metricKey]
        );
    };

    const processedData = useMemo(() => {
        const now = new Date();
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : rawData.length;
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);

        const filtered = rawData.filter(d => new Date(d.date) >= startDate);

        if (granularity === 'daily') {
            return filtered.map(d => ({
                name: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                avgScore: d.questions > 0 ? Math.round((d.correct / d.questions) * 100) : 0,
                questions: d.questions,
                time: d.time,
            }));
        }

        // Weekly granularity
        const weeklyData: { [key: string]: { questions: number; correct: number; time: number; count: number } } = {};
        filtered.forEach(d => {
            const date = new Date(d.date);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)));
            const weekKey = weekStart.toISOString().split('T')[0];
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { questions: 0, correct: 0, time: 0, count: 0 };
            }
            weeklyData[weekKey].questions += d.questions;
            weeklyData[weekKey].correct += d.correct;
            weeklyData[weekKey].time += d.time;
            weeklyData[weekKey].count += 1;
        });

        return Object.entries(weeklyData).map(([key, value]) => ({
            name: new Date(key).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            avgScore: value.questions > 0 ? Math.round((value.correct / value.questions) * 100) : 0,
            questions: value.questions,
            time: value.time,
        })).sort((a,b) => new Date(a.name.split('/').reverse().join('-')).getTime() - new Date(b.name.split('/').reverse().join('-')).getTime());

    }, [timeRange, granularity]);


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-3 rounded-lg text-sm shadow-lg">
                    <p className="font-bold text-slate-200 mb-2">{`Período: ${label}`}</p>
                    {payload.map((pld: any) => (
                        <div key={pld.dataKey} style={{ color: pld.color }} className="flex justify-between items-center">
                            <span>{METRICS[pld.dataKey as keyof typeof METRICS].name}:</span>
                            <span className="font-bold ml-4">{pld.value}{pld.dataKey === 'avgScore' ? '%' : ''}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };


    return (
        <div className="min-h-screen dashboard-bg text-slate-300">
            <header className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Logo />
                    <GhostButton onClick={onBack} className="text-slate-300 hover:bg-slate-700/50 hover:text-white">Voltar</GhostButton>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white">Painel de Performance</h1>
                    <div className="flex items-center gap-4">
                        <Select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                            <option value="7d">Últimos 7 Dias</option>
                            <option value="30d">Últimos 30 Dias</option>
                            <option value="all">Todo o Período</option>
                        </Select>
                        <Select value={granularity} onChange={e => setGranularity(e.target.value)}>
                            <option value="daily">Agrupar por Dia</option>
                            <option value="weekly">Agrupar por Semana</option>
                        </Select>
                    </div>
                </div>

                <div className={cn("bg-slate-900/50 border border-white/10 backdrop-blur-xl p-6", R.xl)}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-white">Métricas de Estudo</h2>
                        <div className="flex items-center gap-4">
                            {Object.values(METRICS).map(metric => (
                                <Checkbox
                                    key={metric.key}
                                    label={metric.name}
                                    checked={visibleMetrics.includes(metric.key)}
                                    onChange={() => toggleMetric(metric.key)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="h-96 pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    {Object.values(METRICS).map(metric => (
                                        <linearGradient key={metric.key} id={`color-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis yAxisId="left" stroke="#94a3b8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                                <Tooltip content={<CustomTooltip />} />
                                {visibleMetrics.includes('avgScore') && (
                                    <>
                                        <Area type="monotone" dataKey="avgScore" yAxisId="left" fillOpacity={1} fill="url(#color-avgScore)" stroke="transparent" />
                                        <Line type="monotone" dataKey="avgScore" yAxisId="left" stroke={METRICS.avgScore.color} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                    </>
                                )}
                                {visibleMetrics.includes('questions') && (
                                    <>
                                        <Area type="monotone" dataKey="questions" yAxisId="right" fillOpacity={1} fill="url(#color-questions)" stroke="transparent" />
                                        <Line type="monotone" dataKey="questions" yAxisId="right" stroke={METRICS.questions.color} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                    </>
                                )}
                                {visibleMetrics.includes('time') && (
                                     <>
                                        <Area type="monotone" dataKey="time" yAxisId="right" fillOpacity={1} fill="url(#color-time)" stroke="transparent" />
                                        <Line type="monotone" dataKey="time" yAxisId="right" stroke={METRICS.time.color} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                    </>
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
};