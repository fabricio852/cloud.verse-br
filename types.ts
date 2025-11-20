
export enum Domain {
    // SAA-C03 domains
    SECURE = 'SECURE',
    RESILIENT = 'RESILIENT',
    PERFORMANCE = 'PERFORMANCE',
    COST = 'COST',

    // CLF-C02 domains
    CLOUD_CONCEPTS = 'CLOUD_CONCEPTS',
    CLOUD_TECHNOLOGY_SERVICES = 'CLOUD_TECHNOLOGY_SERVICES',
    SECURITY_COMPLIANCE = 'SECURITY_COMPLIANCE',
    TECHNOLOGY = 'TECHNOLOGY',
    BILLING_PRICING = 'BILLING_PRICING',

    // AIF-C01 domains
    RESPONSIBLE_AI = 'RESPONSIBLE_AI',
    AI_SERVICES = 'AI_SERVICES',
    AI_FUNDAMENTALS = 'AI_FUNDAMENTALS',
    ML_DEVELOPMENT = 'ML_DEVELOPMENT',

    // DVA-C02 domains
    DEPLOYMENT = 'DEPLOYMENT',
    DVA_SECURITY = 'DVA_SECURITY',
    DEVELOPMENT = 'DEVELOPMENT',
    REFACTORING = 'REFACTORING',
    MONITORING = 'MONITORING'
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
        E?: string;
    };
    answerKey: string[];
    requiredSelections: number;
    explanation_detailed: string;
    explanation_basic?: string;
    incorrect?: { [key: string]: string };
}

export type DomainStats = {
    [key: string]: number;
};

export interface ResultSummary {
    correct: number;
    total: number;
    score: number;
    byDomainCorrect: DomainStats;
    byDomainTotal: DomainStats;
    reviews?: AnswerReview[];
}

export interface AnswerReview {
    questionId: string;
    baseId: string;
    domain: Domain | string;
    stem: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
        E?: string;
    };
    correctAnswer: string[];
    userAnswer: string[];
    isCorrect: boolean;
}

export type Plano = 'FREE' | 'PRO';

export type Rota =
    | 'landing'
    | 'certification-selector'
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
