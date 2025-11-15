import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface SupportButtonProps {
  onClick: () => void;
  variant?: 'floating' | 'inline' | 'compact';
  className?: string;
  showPulse?: boolean;
}

export const SupportButton: React.FC<SupportButtonProps> = ({
  onClick,
  variant = 'floating',
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

  const baseClasses = 'transition-all duration-300 ease-out focus:outline-none';

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
          rounded-full
          font-semibold text-sm
          text-white
          shadow-lg hover:shadow-2xl
          transform hover:scale-110
          ${isAnimating ? 'animate-pulse' : ''}
          ${baseClasses}
          ${className}
        `}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: isHovered
            ? '0 20px 40px rgba(16, 185, 129, 0.3)'
            : '0 10px 25px rgba(16, 185, 129, 0.15)',
        }}
        title="Apoiar com PIX"
      >
        {/* Animated background glow */}
        <div
          className="absolute inset-0 rounded-full opacity-0 blur-lg"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            animation: isHovered ? 'glow-pulse 1.5s ease-in-out infinite' : 'none',
          }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-2">
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
          <span className="hidden sm:inline font-medium text-white">Apoiar</span>
        </div>

        {/* Styles */}
        <style>{`
          @keyframes glow-pulse {
            0%, 100% {
              opacity: 0;
              transform: scale(0.95);
            }
            50% {
              opacity: 0.3;
              transform: scale(1.1);
            }
          }

          @keyframes heartbeat {
            0%, 100% {
              transform: scale(1);
            }
            25% {
              transform: scale(1.3);
            }
            50% {
              transform: scale(1);
            }
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
          rounded-xl
          font-semibold text-sm
          text-white
          shadow-md hover:shadow-lg
          transform hover:scale-105 active:scale-95
          ${baseClasses}
          ${className}
        `}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: isHovered
            ? '0 15px 30px rgba(16, 185, 129, 0.25)'
            : '0 8px 16px rgba(16, 185, 129, 0.12)',
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

        <style>{`
          button:hover {
            letter-spacing: 0.5px;
          }
        `}</style>
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
        rounded-full
        text-white
        shadow-md hover:shadow-lg
        transform hover:scale-110 active:scale-95
        ${baseClasses}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        boxShadow: isHovered
          ? '0 12px 24px rgba(16, 185, 129, 0.3)'
          : '0 6px 12px rgba(16, 185, 129, 0.15)',
      }}
      title="Apoiar com PIX"
    >
      <Heart
        size={20}
        fill="currentColor"
        className={`transition-transform duration-300 ${
          isHovered ? 'scale-125' : 'scale-100'
        }`}
        style={{
          animation: isAnimating && !isHovered ? 'heartbeat 0.6s ease-in-out' : 'none',
        }}
      />

      <style>{`
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.3);
          }
          50% {
            transform: scale(1);
          }
        }
      `}</style>
    </button>
  );
};
