import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut", type: "tween" }}
        className={className}
    >
        {children}
    </motion.div>
);

interface ScreenTransitionProps {
    children: React.ReactNode;
    screenKey: string;
    className?: string;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, screenKey, className = "" }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={screenKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut", type: "tween" }}
            className={className}
        >
            {children}
        </motion.div>
    </AnimatePresence>
);

export const QuizTransition: React.FC<ScreenTransitionProps> = ({ children, screenKey, className = "" }) => (
    <AnimatePresence mode="wait">
        <motion.div key={screenKey} {...quizTransition} className={className}>
            {children}
        </motion.div>
    </AnimatePresence>
);

export const ResultTransition: React.FC<ScreenTransitionProps> = ({ children, screenKey, className = "" }) => (
    <AnimatePresence mode="wait">
        <motion.div key={screenKey} {...resultTransition} className={className}>
            {children}
        </motion.div>
    </AnimatePresence>
);

export const PanelTransition: React.FC<ScreenTransitionProps> = ({ children, screenKey, className = "" }) => (
    <AnimatePresence mode="wait">
        <motion.div key={screenKey} {...panelTransition} className={className}>
            {children}
        </motion.div>
    </AnimatePresence>
);

export const fadeInUp = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

export const slideInRight = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

export const slideInLeft = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

export const scaleIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

export const quizTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

export const resultTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

export const panelTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

export const StaggeredCards: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const AnimatedCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <motion.div
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);
