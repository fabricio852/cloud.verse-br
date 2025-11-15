import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface ThemedSupportButtonProps {
  onClick: () => void;
  variant?: 'floating' | 'inline' | 'compact';
  theme?: 'landing' | 'dashboard' | 'default';
  className?: string;
  showPulse?: boolean;
}

export const ThemedSupportButton: React.FC<ThemedSupportButtonProps> = ({
  onClick,
  variant = 'floating',
  theme = 'default',
  className = '',
  showPulse = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!showPulse) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1200);
    }, 6000);

    return () => clearInterval(interval);
  }, [showPulse]);

  // Theme-specific colors
  const themeStyles = {
    landing: {
      borderColor: '#00FFFF',
      borderHoverColor: '#FF9900',
      textColor: '#00FFFF',
      hoverBgColor: 'rgba(255, 153, 0, 0.1)',
      shadowColor: 'rgba(0, 255, 255, 0.4)',
      hoverShadowColor: 'rgba(255, 153, 0, 0.5)',
    },
    dashboard: {
      borderColor: '#10b981',
      borderHoverColor: '#059669',
      textColor: '#10b981',
      hoverBgColor: 'rgba(16, 185, 129, 0.1)',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      hoverShadowColor: 'rgba(16, 185, 129, 0.5)',
    },
    default: {
      borderColor: '#10b981',
      borderHoverColor: '#059669',
      textColor: '#10b981',
      hoverBgColor: 'rgba(16, 185, 129, 0.1)',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      hoverShadowColor: 'rgba(16, 185, 129, 0.5)',
    },
  };

  const styles = themeStyles[theme];

  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed bottom-6 right-6 z-40
          flex items-center justify-center gap-2.5
          px-5 py-3.5
          font-semibold text-sm
          transition-all duration-300 ease-out
          transform hover:scale-110 hover:-translate-y-1 active:scale-95
          focus:outline-none focus-visible:ring-2
          border-2
          ${isAnimating ? 'animate-pulse' : ''}
          ${className}
        `}
        style={{
          borderColor: isHovered ? styles.borderHoverColor : styles.borderColor,
          color: styles.textColor,
          backgroundColor: isHovered ? styles.hoverBgColor : 'rgba(10, 10, 18, 0.8)',
          boxShadow: isHovered
            ? `0 0 20px ${styles.hoverShadowColor}, 0 0 30px ${styles.hoverShadowColor}`
            : `0 0 10px ${styles.shadowColor}`,
          backdropFilter: 'blur(8px)',
          focusVisible: `2px solid ${styles.borderColor}`,
        }}
        title="Apoiar com PIX"
      >
        <Heart
          size={20}
          fill="currentColor"
          className={`transition-transform duration-500 ${
            isHovered ? 'scale-125' : 'scale-100'
          }`}
          style={{
            animation: isAnimating && !isHovered ? 'heartbeat 0.6s ease-in-out' : 'none',
          }}
        />
        <span className="hidden sm:inline">Apoiar</span>

        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.3); }
            50% { transform: scale(1); }
          }
        `}</style>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          inline-flex items-center justify-center gap-2
          px-6 py-3
          font-semibold text-sm
          transition-all duration-300 ease-out
          transform hover:scale-105 hover:-translate-y-1 active:scale-95
          focus:outline-none
          border-2
          ${isAnimating ? 'animate-pulse' : ''}
          ${className}
        `}
        style={{
          borderColor: isHovered ? styles.borderHoverColor : styles.borderColor,
          color: styles.textColor,
          backgroundColor: isHovered ? styles.hoverBgColor : 'rgba(10, 10, 18, 0.5)',
          boxShadow: isHovered
            ? `0 0 20px ${styles.hoverShadowColor}, inset 0 0 10px ${styles.hoverShadowColor}`
            : `0 0 10px ${styles.shadowColor}`,
          backdropFilter: 'blur(8px)',
        }}
        title="Apoiar com PIX"
      >
        <Heart
          size={18}
          fill="currentColor"
          className={`transition-transform duration-300 ${
            isHovered ? 'scale-125' : 'scale-100'
          }`}
        />
        <span>Apoiar com PIX</span>
      </button>
    );
  }

  // compact variant
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        inline-flex items-center justify-center
        w-12 h-12
        transition-all duration-300 ease-out
        transform hover:scale-110 hover:-translate-y-1 active:scale-95
        focus:outline-none
        border-2
        ${className}
      `}
      style={{
        borderColor: isHovered ? styles.borderHoverColor : styles.borderColor,
        color: styles.textColor,
        backgroundColor: isHovered ? styles.hoverBgColor : 'rgba(10, 10, 18, 0.5)',
        boxShadow: isHovered
          ? `0 0 20px ${styles.hoverShadowColor}`
          : `0 0 10px ${styles.shadowColor}`,
        backdropFilter: 'blur(8px)',
      }}
      title="Apoiar com PIX"
    >
      <Heart
        size={20}
        fill="currentColor"
        className={`transition-transform duration-300 ${
          isHovered ? 'scale-125' : 'scale-100'
        }`}
      />
    </button>
  );
};
