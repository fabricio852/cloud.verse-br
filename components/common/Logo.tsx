
import React from 'react';
import { BRAND } from '../../constants';

interface LogoProps {
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 56 }) => {
    return (
        <div className="flex items-center gap-3 select-none">
            <img src="https://i.imgur.com/i87q06F.png" alt="Nuvem Mestra Logo" style={{ width: size, height: size }} />
            <div className="leading-tight">
                <div className="text-2xl tracking-wider font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    {BRAND.name}
                </div>
            </div>
        </div>
    );
};
