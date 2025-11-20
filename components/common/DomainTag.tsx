import React from 'react';
import { DOMAIN_LABELS } from '../../constants';
import { cn } from '../../utils';

interface DomainTagProps {
    domain: string;
}

const DOMAIN_STYLES: Record<string, string> = {
    SECURE: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    RESILIENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    PERFORMANCE: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    COST: 'bg-yellow-100 text-orange-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    DESIGN_SECURE_APPLICATIONS_ARCHITECTURES: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    DESIGN_RESILIENT_ARCHITECTURES: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    DESIGN_COST_OPTIMIZED_ARCHITECTURES: 'bg-yellow-100 text-orange-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    DESIGN_HIGH_PERFORMING_ARCHITECTURES: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    CLOUD_CONCEPTS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    CLOUD_TECHNOLOGY_SERVICES: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    SECURITY_COMPLIANCE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    BILLING_PRICING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    RESPONSIBLE_AI: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    AI_SERVICES: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    AI_FUNDAMENTALS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    ML_DEVELOPMENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    // DVA-C02
    DEPLOYMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    DVA_SECURITY: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    DEVELOPMENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    REFACTORING: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    MONITORING: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
};

const DOMAIN_LABELS_PT: Record<string, string> = {
    // SAA-C03
    SECURE: 'Arquitetura Segura',
    RESILIENT: 'Arquitetura Resiliente',
    PERFORMANCE: 'Arquitetura de Alto Desempenho',
    COST: 'Otimização de Custos',
    DESIGN_SECURE_APPLICATIONS_ARCHITECTURES: 'Arquiteturas Seguras',
    DESIGN_RESILIENT_ARCHITECTURES: 'Arquiteturas Resilientes',
    DESIGN_COST_OPTIMIZED_ARCHITECTURES: 'Arquiteturas Otimizadas em Custo',
    DESIGN_HIGH_PERFORMING_ARCHITECTURES: 'Arquiteturas de Alto Desempenho',
    // CLF-C02
    CLOUD_CONCEPTS: 'Conceitos de Cloud',
    CLOUD_TECHNOLOGY_SERVICES: 'Tecnologia e Serviços',
    SECURITY_COMPLIANCE: 'Segurança e Conformidade',
    BILLING_PRICING: 'Faturamento e Precificação',
    TECHNOLOGY: 'Tecnologia e Serviços',
    // AIF-C01
    RESPONSIBLE_AI: 'IA Responsável',
    AI_SERVICES: 'Serviços de IA',
    AI_FUNDAMENTALS: 'Fundamentos de IA',
    ML_DEVELOPMENT: 'Desenvolvimento de ML',
    // DVA-C02
    DEPLOYMENT: 'Implantação',
    DVA_SECURITY: 'Segurança',
    SECURITY: 'Segurança', // fallback caso não seja convertido
    DEVELOPMENT: 'Desenvolvimento',
    REFACTORING: 'Refatoração',
    MONITORING: 'Monitoramento',
    // Extras (metadados antigos)
    AI_SECURITY: 'Segurança de IA',
    AI_APPLICATIONS: 'Aplicações de IA',
    AI_GOVERNANCE: 'Governança de IA',
};

export const DomainTag: React.FC<DomainTagProps> = ({ domain }) => {
    const label = DOMAIN_LABELS_PT[domain] || DOMAIN_LABELS[domain] || domain;
    const cls = DOMAIN_STYLES[domain] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

    return (
        <span className={cn('inline-block px-2 py-0.5 text-xs font-medium rounded-full normal-case no-underline', cls)}>
            {label}
        </span>
    );
};
