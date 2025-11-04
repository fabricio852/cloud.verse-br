
import React, { useRef } from 'react';
import { cn } from '../../utils';
import { R } from '../../constants';

interface CardProps {
    title: React.ReactNode;
    subtitle?: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: React.ReactNode;
    'data-tour'?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, onClick, disabled, badge, ...props }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current && !disabled) {
            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            cardRef.current.style.setProperty('--mouse-x', `${x}px`);
            cardRef.current.style.setProperty('--mouse-y', `${y}px`);
        }
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "card-spotlight relative text-left border bg-white dark:bg-slate-800 transition p-4 border-gray-200 dark:border-slate-700 overflow-hidden",
                R.lg,
                disabled ? "opacity-60" : "hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-600"
            )}
            {...props}
        >
            <button disabled={disabled} onClick={onClick} className="w-full h-full inset-0 absolute z-20" />
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{title}</div>
                    {subtitle && <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</div>}
                </div>
                <div className="text-right mt-4 self-end">{badge}</div>
            </div>
        </div>
    );
};
