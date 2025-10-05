
import React from 'react';
import { cn } from '../../utils';
import { R } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", onClick, disabled }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 shadow",
                R.md,
                className
            )}
        >
            {children}
        </button>
    );
};

export const GhostButton: React.FC<ButtonProps> = ({ children, className = "", onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-3 py-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors",
                R.md,
                className
            )}
        >
            {children}
        </button>
    );
};
