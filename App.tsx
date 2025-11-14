import React, { useState, useEffect } from 'react';
import { Rota, Plano, ResultSummary, DomainConfig, Question } from './types';
import { LandingPage } from './screens/LandingPage';
import { Painel } from './screens/Painel';
import { QuizScreen } from './screens/QuizScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { ResultScreen } from './screens/ResultScreen';
import { DominiosScreen } from './screens/DominiosScreen';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { EmptyQuestions } from './components/common/EmptyQuestions';
import { ScreenTransition, QuizTransition, ResultTransition, PanelTransition } from './components/common/PageTransition';
import { useCertificationStore } from './store/certificationStore';
import { useQuestions } from './hooks/useQuestions';
import { getWeeklySeed } from './utils';
import { ensureSession, trackPageview } from './services/analytics';

export default function App() {
    // Certification state
    const { selectedCertId, fetchCertifications } = useCertificationStore();
    const certificationId = selectedCertId || 'CLF-C02';

    const [rota, setRota] = useState<Rota>("landing");
    const [loading, setLoading] = useState(false);
    const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
    const [domCfg, setDomCfg] = useState<DomainConfig | null>(null);

    const weeklySeed = getWeeklySeed({ certificationId });

    // Inicializa sessão de analytics (pageviews são registrados no efeito de rota)
    useEffect(() => {
        ensureSession();
    }, []);

    // Buscar questoes do Supabase (agora todos têm acesso total)
    const { questions: questionsQuick, loading: loadingQuick } = useQuestions({
        certificationId,
        tier: 'ALL',
        limit: 100,
        enabled: rota === 'quiz-rapido'
    });

    const { questions: questionsCompleto, loading: loadingCompleto } = useQuestions({
        certificationId,
        tier: 'ALL',
        limit: 65,
        enabled: rota === 'quiz-completo'
    });

    const { questions: questionsDominios, loading: loadingDominios } = useQuestions({
        certificationId,
        domains: domCfg ? Object.keys(domCfg.dom).filter(d => domCfg.dom[d as keyof typeof domCfg.dom]) : undefined,
        tier: 'ALL',
        limit: domCfg?.qtd,
        enabled: rota === 'quiz-dominios' && !!domCfg
    });

const total = 650;
const theme = 'dark';

useEffect(() => {
    if (typeof window !== 'undefined' && window.document) {
            const root = window.document.documentElement;
            root.classList.add('dark');
            root.classList.remove('light');
        }
    }, []);

const start = (fn: () => void) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); fn(); }, 900);
};

    const handleQuizExit = (summary: ResultSummary) => {
        console.log('[App] handleQuizExit chamado com summary:', summary);
        setResultSummary(summary);
        console.log('[App] Mudando rota para resultado');
        setRota('resultado');
        console.log('[App] Rota alterada para:', 'resultado');
    }

    // Registrar pageview a cada mudança de rota
    useEffect(() => {
        trackPageview(rota);
    }, [rota]);

    const renderContent = () => {
        switch (rota) {
            case 'landing': return (
                <ScreenTransition screenKey="landing">
                    <LandingPage onStart={() => setRota('painel')} />
                </ScreenTransition>
            );
            case 'painel': return (
                <PanelTransition screenKey="painel">
                    <Painel
                        totalQuestoes={total}
                        onQuizRapido={() => start(() => setRota('quiz-rapido'))}
                        onQuizCompleto={() => start(() => setRota('quiz-completo'))}
                        onDominios={() => setRota('dominios')}
                        onRevisao={() => setRota('revisao')}
                        onVoltar={() => setRota('landing')}
                        theme={theme}
                    />
                </PanelTransition>
            );
            case 'quiz-rapido': return (
                <QuizTransition screenKey="quiz-rapido">
                    {loadingQuick ? (
                        <LoadingOverlay open={true} />
                    ) : questionsQuick.length === 0 ? (
                        <EmptyQuestions
                            certificationId={certificationId}
                            onBack={() => setRota('painel')}
                        />
                    ) : (
                        <QuizScreen
                            plano="PRO"
                            tamanho={35}
                            level="detailed"
                            onSair={handleQuizExit}
                            onExit={() => setRota('landing')}
                            onVoltar={() => setRota('painel')}
                            timed
                            durationSec={40 * 60}
                            navAfterBack={true}
                            theme={theme}
                            questions={questionsQuick}
                            quizType="daily"
                        />
                    )}
                </QuizTransition>
            );
            case 'quiz-completo': return (
                <QuizTransition screenKey="quiz-completo">
                    {loadingCompleto ? (
                        <LoadingOverlay open={true} />
                    ) : questionsCompleto.length === 0 ? (
                        <EmptyQuestions
                            certificationId={certificationId}
                            onBack={() => setRota('painel')}
                        />
                    ) : (
                        <QuizScreen
                            plano="PRO"
                            tamanho={65}
                            level="detailed"
                            timed
                            durationSec={130 * 60}
                            navAfterBack
                            onSair={handleQuizExit}
                            onExit={() => setRota('landing')}
                            onVoltar={() => setRota('painel')}
                            theme={theme}
                            questions={questionsCompleto}
                            quizType="full"
                        />
                    )}
                </QuizTransition>
            );
            case 'quiz-dominios': return (
                <QuizTransition screenKey="quiz-dominios">
                    {loadingDominios ? (
                        <LoadingOverlay open={true} />
                    ) : questionsDominios.length === 0 ? (
                        <EmptyQuestions
                            certificationId={certificationId}
                            onBack={() => setRota('painel')}
                        />
                    ) : (
                        <QuizScreen
                            plano="PRO"
                            tamanho={(domCfg && domCfg.qtd) || 20}
                            level="detailed"
                            navAfterBack
                            onSair={handleQuizExit}
                            onExit={() => setRota('landing')}
                            onVoltar={() => setRota('painel')}
                            theme={theme}
                            questions={questionsDominios}
                            quizType="domains"
                        />
                    )}
                </QuizTransition>
            );
            case 'revisao': return (
                <ScreenTransition screenKey="revisao">
                    <ReviewScreen onBack={() => setRota('landing')} onVoltar={() => setRota('painel')} plano="PRO" theme={theme} />
                </ScreenTransition>
            );
            case 'resultado': return (
                <ResultTransition screenKey="resultado">
                    <ResultScreen summary={resultSummary} onBack={() => setRota('painel')} onVoltar={() => setRota('landing')} theme={theme} />
                </ResultTransition>
            );
            case 'dominios': return (
                <ScreenTransition screenKey="dominios">
                    <DominiosScreen onVoltar={() => setRota('painel')} onBackToLanding={() => setRota('landing')} onIniciar={(cfg) => { setDomCfg(cfg); start(() => setRota('quiz-dominios')); }} />
                </ScreenTransition>
            );
            default: return (
                <ScreenTransition screenKey="default">
                    <LandingPage onStart={() => setRota('painel')} />
                </ScreenTransition>
            );
        }
    }
    
    return (
        <div className="min-h-screen cloudy-bg">
            <style>{`
                .cloudy-bg { background-color: #f0f4f8; background-image: radial-gradient(circle at 10% 20%, hsla(0,0%,100%,.3) 0%, transparent 40%), radial-gradient(circle at 80% 50%, hsla(0,0%,100%,.2) 0%, transparent 50%), radial-gradient(circle at 50% 90%, hsla(0,0%,100%,.1) 0%, transparent 40%); transition: background-color 0.5s; }
                .dark .cloudy-bg { background-color: #0b1120; background-image: radial-gradient(circle at 25% 30%, rgba(30, 58, 138, 0.35) 0%, #0b1120 35%), radial-gradient(circle at 80% 60%, rgba(30, 64, 175, 0.25) 0%, #0b1120 40%); }
                .dashboard-bg { background-color: #020617; background-image: radial-gradient(circle at 1% 1%, #1e293b 0%, #020617 25%), radial-gradient(circle at 99% 99%, #334155 0%, #020617 25%); transition: background-color 0.5s; }
                .recharts-cartesian-axis-tick-value { font-size: 0.75rem; fill: #94a3b8; }
                .recharts-tooltip-cursor { stroke: rgba(148, 163, 184, 0.3); stroke-width: 1; stroke-dasharray: 5 5; }
            `}</style>
            
            {renderContent()}

            <LoadingOverlay open={loading} />
        </div>
    );
}



