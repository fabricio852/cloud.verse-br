
export enum Domain {
    SECURE = 'SECURE',
    RESILIENT = 'RESILIENT',
    PERFORMANCE = 'PERFORMANCE',
    COST = 'COST'
}

export interface Question {
    id: string;
    domain: Domain;
    stem: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    answerKey: string;
    explanation_detailed: string;
    explanation_basic?: string;
    incorrect?: { [key: string]: string };
}

export interface DomainStats {
    SECURE: number;
    RESILIENT: number;
    PERFORMANCE: number;
    COST: number;
}

export interface ResultSummary {
    correct: number;
    total: number;
    score: number;
    byDomainCorrect: DomainStats;
    byDomainTotal: DomainStats;
}

export type Plano = 'FREE' | 'PRO';

export type Rota = 
    | 'landing' 
    | 'painel' 
    | 'cenario' 
    | 'quiz-cenario' 
    | 'quiz-rapido' 
    | 'quiz-completo' 
    | 'quiz-dominios' 
    | 'revisao'
    | 'flashcards'
    | 'evolucao'
    | 'resultado'
    | 'dominios';

export interface DomainConfig {
    qtd: number;
    dom: { [key in Domain]: boolean };
}
