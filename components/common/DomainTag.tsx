
import React from 'react';
import { Domain } from '../../types';
import { DOMAIN_LABELS } from '../../constants';
import { cn } from '../../utils';

interface DomainTagProps {
    domain: Domain;
}

export const DomainTag: React.FC<DomainTagProps> = ({ domain }) => {
    const map: { [key in Domain]: string } = {
        SECURE: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        RESILIENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        PERFORMANCE: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        COST: 'bg-yellow-100 text-orange-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    };
    const label = DOMAIN_LABELS[domain] || domain;
    const cls = map[domain] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    return (
        <span className={cn("inline-block px-2 py-0.5 text-xs font-medium rounded-full", cls)}>
            {label}
        </span>
    );
};
