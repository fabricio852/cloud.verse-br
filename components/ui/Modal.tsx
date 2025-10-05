
import React from 'react';
import { cn } from '../../utils';
import { R } from '../../constants';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 grid place-items-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={cn("relative bg-white dark:bg-gray-800 w-full max-w-2xl p-6 shadow-xl", R.lg)}>
                {title && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
                    </div>
                )}
                <div className="text-gray-800 dark:text-gray-300 space-y-3">{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
};
