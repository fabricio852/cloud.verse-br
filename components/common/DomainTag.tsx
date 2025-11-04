
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
    CLOUD_CONCEPTS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    CLOUD_TECHNOLOGY_SERVICES: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    SECURITY_COMPLIANCE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    BILLING_PRICING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    RESPONSIBLE_AI: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    AI_SERVICES: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    AI_FUNDAMENTALS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    ML_DEVELOPMENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
};

export const DomainTag: React.FC<DomainTagProps> = ({ domain }) => {
    const label = DOMAIN_LABELS[domain] || domain;
    const cls = DOMAIN_STYLES[domain] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

    return (
        <span className={cn('inline-block px-2 py-0.5 text-xs font-medium rounded-full', cls)}>
            {label}
        </span>
    );
};
