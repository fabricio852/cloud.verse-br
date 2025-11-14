
import React from 'react';
import { BRAND } from '../../constants';

interface LogoProps {
    size?: number;
    onClick?: () => void;
    iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 56, onClick, iconOnly = false }) => {
    return (
        <div
            className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer hover:opacity-90 transition-all hover:drop-shadow-[0_0_8px_#00FFFF]' : ''}`}
            onClick={onClick}
        >
            <img src="/logo.png" alt="CLOUD.VERSE Logo" style={{ width: size, height: size, background: 'transparent' }} className="object-contain" />
            {!iconOnly && (
                <div className="leading-tight">
                    <div
                        className="text-2xl tracking-[0.15em] font-bold text-transparent bg-clip-text"
                        style={{
                            fontFamily: '"Press Start 2P", cursive',
                            backgroundImage: 'linear-gradient(90deg, #00FFFF 0%, #FF9900 100%)',
                            textShadow: '0 0 10px rgba(0,255,255,0.5), 0 0 20px rgba(255,153,0,0.3)',
                        }}
                    >
                        {BRAND.name}
                    </div>
                </div>
            )}
        </div>
    );
};
