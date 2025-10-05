
import React from 'react';

interface StatPillProps {
    label: string;
    value: string | number;
}

export const StatPill: React.FC<StatPillProps> = ({ label, value }) => {
    return (
        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm" style={{ borderRadius: 999 }}>
            <span className="font-medium">{label}: </span>
            <span>{value}</span>
        </div>
    );
};
