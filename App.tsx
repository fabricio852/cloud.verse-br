import React, { useState, useEffect } from 'react';
import { Rota, Plano, ResultSummary, DomainConfig, Question } from './types';
import { LandingPage } from './screens/LandingPage';
import { Painel } from './screens/Painel';
import { CenarioScreen } from './screens/CenarioScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { FlashcardsScreen } from './screens/FlashcardsScreen';
import { EvolucaoScreen } from './screens/EvolucaoScreen';
import { ResultScreen } from './screens/ResultScreen';
import { DominiosScreen } from './screens/DominiosScreen';
import { PaywallModal } from './screens/PaywallModal';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { Q_BANK } from './constants';

const Changelog: React.FC<{open: boolean, onClose: () => void, onAck: () => void}> = ({ open, onClose, onAck }) => (
    <Modal open={open} onClose={onClose} title="Atualização — Out/25">
        <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>SSO com Google para histórico e sincronização.</li>
            <li>Modo Revisão (PRO): grid de revisão, voltar, filtros, favoritos e explicações completas.</li>
            <li>Prática por domínios: Arquitetura segura · resiliente · alto desempenho · custo otimizado.</li>
            <li>Banco expandido para 650 questões; complementação on‑the‑fly via LLM.</li>
            <li>Quiz Rápido (GRATUITO): forward‑only; pool de 100 (rotaciona a cada 2 dias).</li>
        </ul>
        <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => { if (onAck) onAck(); onClose(); }}>Ok, entendi</Button>
        </div>
    </Modal>
);

const ModalQuizRapido: React.FC<{open: boolean, onClose: () => void, onStart: () => void, plano: Plano}> = ({ open, onClose, onStart, plano }) => (
    <Modal open={open} onClose={onClose} title="Quiz Rápido — Formato">
        <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><b>35 questões</b> por tentativa, {plano === 'PRO' ? 'selecionadas aleatoriamente do banco de questões completo.' : 'selecionadas aleatoriamente de um pool de 100 questões (renova a cada 24 horas).'}</li>
            <li>Até <b>40 minutos</b> de duração.</li>
            {plano === 'PRO' ? (
                <>
                    <li><b>Recursos PRO ativados:</b> Explicações detalhadas, aprendizado com IA e navegação completa.</li>
                </>
            ) : (
                <>
                    <li>Explicações <b>resumidas</b>.</li>
                    <li>Funcionalidades de revisão e navegação <b>desabilitadas</b>.</li>
                </>
            )}
        </ul>
        <div className="mt-6 flex justify-end gap-2">
            <Button onClick={onStart}>Iniciar</Button>
        </div>
    </Modal>
);

const ModalQuizCompleto: React.FC<{open: boolean, onClose: () => void, onStart: () => void}> = ({ open, onClose, onStart }) => (
    <Modal open={open} onClose={onClose} title="Quiz Completo — Formato Simulado">
        <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><b>Formato Oficial:</b> 65 questões com proporções de domínios baseadas no exame SAA-C03.</li>
            <li><b>Tempo Real:</b> Simulação com 130 minutos, igual à prova.</li>
            <li><b>Navegação Completa:</b> Você pode voltar para revisar e alterar suas respostas.</li>
            <li><b>Explicações Detalhadas:</b> Todas as questões incluem explicações completas (recurso PRO).</li>
            <li><b>Aprendizado profundo:</b> Aprofunde seu conhecimento com explicações alternativas e analogias geradas por IA.</li>
            <li><b>Nota Final:</b> Ao final, você receberá uma pontuação simulada no padrão AWS (100-1000).</li>
        </ul>
        <div className="mt-6 flex justify-end gap-2">
            <Button onClick={onStart}>Iniciar Simulado</Button>
        </div>
    </Modal>
);

export default function App() {
    const [rota, setRota] = useState<Rota>("landing");
    const [plano, setPlano] = useState<Plano>("FREE");
    const [showChangelog, setShowChangelog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showQuick, setShowQuick] = useState(false);
    const [showCompleto, setShowCompleto] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
    const [domCfg, setDomCfg] = useState<DomainConfig | null>(null);
    const [customQuiz, setCustomQuiz] = useState<Question[] | null>(null);
    const [customQuizDiagram, setCustomQuizDiagram] = useState<string | null>(null);
    const total = 650;

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        if (rota === 'painel') setShowChangelog(true);
    }, [rota]);

    const start = (fn: () => void) => {
        setLoading(true);
        setTimeout(() => { setLoading(false); fn(); }, 900);
    };

    const handleQuizExit = (summary: ResultSummary) => {
        setResultSummary(summary);
        setRota('resultado');
    }

    const renderContent = () => {
        switch (rota) {
            case 'landing': return <LandingPage onLoginSuccess={() => setRota('painel')} />;
            case 'painel': return (
                <>
                    <Painel
                        plano={plano}
                        totalQuestoes={total}
                        onQuizRapido={() => setShowQuick(true)}
                        onQuizCompleto={() => plano === 'PRO' ? setShowCompleto(true) : setShowPaywall(true)}
                        onDominios={() => plano === 'PRO' ? setRota('dominios') : setShowPaywall(true)}
                        onRevisao={() => plano === 'PRO' ? setRota('revisao') : setShowPaywall(true)}
                        onCenario={() => plano === 'PRO' ? setRota('cenario') : setShowPaywall(true)}
                        onFlashcards={() => plano === 'PRO' ? setRota('flashcards') : setShowPaywall(true)}
                        onEvolucao={() => plano === 'PRO' ? setRota('evolucao') : setShowPaywall(true)}
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow px-3 py-2" style={{ borderRadius: 12 }}>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Simular plano:</span>
                        <Button className="px-3 py-1" onClick={() => setPlano(p => p === 'FREE' ? 'PRO' : 'FREE')}>{plano === 'FREE' ? 'Gratuito' : 'PRO'}</Button>
                    </div>
                </>
            );
            case 'cenario': return <CenarioScreen onBack={() => setRota('painel')} onStartQuiz={(questions, diagramUrl) => {
                setCustomQuiz(questions);
                setCustomQuizDiagram(diagramUrl);
                setLoading(true);
                setTimeout(() => { setLoading(false); setRota('quiz-cenario'); }, 900);
            }} />;
            case 'quiz-cenario': return <QuizScreen plano={plano} questions={customQuiz || Q_BANK} diagramUrl={customQuizDiagram} level={'detailed'} onSair={handleQuizExit} onExit={() => setRota('painel')} navAfterBack />;
            case 'quiz-rapido': return <QuizScreen plano={plano} tamanho={35} level={plano === 'PRO' ? 'detailed' : 'basic'} onSair={handleQuizExit} onExit={() => setRota('painel')} timed durationSec={40 * 60} navAfterBack={plano === 'PRO'} />;
            case 'quiz-completo': return <QuizScreen plano={plano} tamanho={65} level={'detailed'} timed durationSec={130 * 60} navAfterBack onSair={handleQuizExit} onExit={() => setRota('painel')} />;
            case 'quiz-dominios': return <QuizScreen plano={plano} tamanho={(domCfg && domCfg.qtd) || 20} level={'detailed'} navAfterBack onSair={handleQuizExit} onExit={() => setRota('painel')} />;
            case 'revisao': return <ReviewScreen onBack={() => setRota('painel')} plano={plano} />;
            case 'flashcards': return <FlashcardsScreen onBack={() => setRota('painel')} />;
            case 'evolucao': return <EvolucaoScreen onBack={() => setRota('painel')} />;
            case 'resultado': return <ResultScreen summary={resultSummary} onBack={() => setRota('painel')} />;
            case 'dominios': return <DominiosScreen onVoltar={() => setRota('painel')} onIniciar={(cfg) => { setDomCfg(cfg); start(() => setRota('quiz-dominios')); }} />;
            default: return <LandingPage onLoginSuccess={() => setRota('painel')} />;
        }
    }
    
    return (
        <div className="min-h-screen cloudy-bg">
            <style>{`
                .cloudy-bg { background-color: #f0f4f8; background-image: radial-gradient(circle at 10% 20%, hsla(0,0%,100%,.3) 0%, transparent 40%), radial-gradient(circle at 80% 50%, hsla(0,0%,100%,.2) 0%, transparent 50%), radial-gradient(circle at 50% 90%, hsla(0,0%,100%,.1) 0%, transparent 40%); transition: background-color 0.5s; }
                .dark .cloudy-bg { background-color: #0b1120; background-image: radial-gradient(circle at 25% 30%, rgba(30, 58, 138, 0.35) 0%, #0b1120 35%), radial-gradient(circle at 80% 60%, rgba(30, 64, 175, 0.25) 0%, #0b1120 40%); }
                .dashboard-bg { background-color: #020617; background-image: radial-gradient(circle at 1% 1%, #1e293b 0%, #020617 25%), radial-gradient(circle at 99% 99%, #334155 0%, #020617 25%); transition: background-color 0.5s; }
                .card-spotlight::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(37, 99, 235, 0.15), transparent 80%); border-radius: inherit; opacity: 0; transition: opacity 0.2s; }
                .card-spotlight:hover::before { opacity: 1; }
                .dark .card-spotlight::before { background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.15), transparent 80%); }
                .recharts-cartesian-axis-tick-value { font-size: 0.75rem; fill: #94a3b8; }
                .recharts-tooltip-cursor { stroke: rgba(148, 163, 184, 0.3); stroke-width: 1; stroke-dasharray: 5 5; }
            `}</style>
            
            {renderContent()}

            <Changelog open={showChangelog} onClose={() => setShowChangelog(false)} onAck={() => { }} />
            <ModalQuizRapido open={showQuick} onClose={() => setShowQuick(false)} onStart={() => { setShowQuick(false); start(() => setRota('quiz-rapido')); }} plano={plano} />
            <ModalQuizCompleto open={showCompleto} onClose={() => setShowCompleto(false)} onStart={() => { setShowCompleto(false); start(() => setRota('quiz-completo')); }} />
            <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
            <LoadingOverlay open={loading} message={rota === 'quiz-cenario' ? "Gerando quiz e diagrama..." : "Preparando questões…"} />
        </div>
    );
}