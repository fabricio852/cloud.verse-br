import React, { useState, useEffect } from 'react';

interface LoadingOverlayProps {
    open: boolean;
    message?: string;
}

const LOADING_MESSAGES = [
    "Burning the midnight oil...",
    "Getting the ball rolling...",
    "Dotting the i's and crossing the t's...",
    "Breaking the ice...",
    "Cutting to the chase..."
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ open, message }) => {
    const [randomMessage] = useState(() => {
        return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    });

    const displayMessage = message || randomMessage;

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-40 grid place-items-center">
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70" />
            <div className="relative bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg px-6 py-4 text-gray-800 dark:text-gray-200 flex items-center gap-3" style={{ borderRadius: 12 }}>
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="font-medium">{displayMessage}</span>
            </div>
        </div>
    );
};
