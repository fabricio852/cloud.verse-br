import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KofiWidgetProps {
    className?: string;
    desktopOnly?: boolean;
    showFloatingButton?: boolean;
    inline?: boolean;
}

export interface KofiWidgetHandle {
    open: () => void;
    close: () => void;
}

export const KofiWidget = forwardRef<KofiWidgetHandle, KofiWidgetProps>(({ className = '', desktopOnly = false, showFloatingButton = true, inline = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const initialDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const releaseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    }), []);

    useEffect(() => {
        const triggerAnimation = () => {
            setIsAnimating(true);
            if (releaseRef.current) {
                clearTimeout(releaseRef.current);
            }
            releaseRef.current = setTimeout(() => {
                setIsAnimating(false);
            }, 1100);
        };

        initialDelayRef.current = setTimeout(() => {
            triggerAnimation();
            intervalRef.current = setInterval(() => {
                triggerAnimation();
            }, 6000);
        }, 3000);

        return () => {
            if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (releaseRef.current) clearTimeout(releaseRef.current);
        };
    }, []);

    const baseButtonClass =
        "fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 border border-transparent";
    const attentionClass = isAnimating ? " kofi-shake kofi-glow" : "";
    const visibilityClass = desktopOnly ? 'hidden lg:flex' : 'flex';
    const symbolUrl = new URL('../../kofi_symbol.png', import.meta.url).href;

    return (
        <>
            <style>{`
                @keyframes kofi-shake {
                    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
                    20% { transform: translate3d(-2px, 0, 0) rotate(-4deg); }
                    40% { transform: translate3d(3px, 0, 0) rotate(3deg); }
                    60% { transform: translate3d(-3px, 0, 0) rotate(-3deg); }
                    80% { transform: translate3d(2px, 0, 0) rotate(2deg); }
                }

                @keyframes kofi-glow-pulse {
                    0%, 100% {
                        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
                    }
                    50% {
                        filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 40px rgba(250, 204, 21, 0.4));
                    }
                }

                .kofi-shake {
                    animation: kofi-shake 0.9s ease-in-out;
                }

                .kofi-glow {
                    animation: kofi-glow-pulse 1.2s ease-in-out forwards;
                }
            `}</style>

            {/* Floating Button with Ko-fi Symbol */}
            {showFloatingButton && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`${inline ? 'relative' : 'fixed right-4 bottom-4 md:right-6 md:bottom-6 z-40'} transition-all duration-200 transform hover:scale-110 ${attentionClass} ${inline ? '' : visibilityClass} ${className}`.trim()}
                    title="Support on Ko-fi"
                    style={{
                        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                    }}
                >
                    <img
                        src={symbolUrl}
                        alt="Support me on Ko-fi"
                        className="h-12 md:h-14 w-auto"
                        style={{ display: 'block' }}
                        onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement & { _fallback?: boolean };
                            if (!el._fallback) {
                                el._fallback = true;
                                el.src = 'https://storage.ko-fi.com/cdn/cup-border.png';
                            } else {
                                el.style.display = 'none';
                            }
                        }}
                    />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop - Fundo Borrado */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                        />

                        {/* Centered modal */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md"
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-1.735 1.904.047 2.276 1.103 2.276 1.103.663 1.418.148 2.678-.553 3.98z" />
                                            </svg>
                                            <h3 className="text-lg font-semibold text-white">Support on Ko-fi</h3>
                                        </div>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="text-white hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-white/10"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Iframe Ko-fi */}
                                    <div className="p-0">
                                        <iframe
                                            id="kofiframe"
                                            src="https://ko-fi.com/fabriciocosta/?hidefeed=true&widget=true&embed=true&preview=true"
                                            style={{ border: 'none', width: '100%', padding: '4px', background: '#f9f9f9' }}
                                            height="712"
                                            title="fabriciocosta"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
});

KofiWidget.displayName = 'KofiWidget';
