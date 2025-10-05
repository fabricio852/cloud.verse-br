
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/common/Logo';
import { LoginModal } from './LoginModal';

interface LandingPageProps {
    onLoginSuccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let particles: {x: number, y: number, vx: number, vy: number, radius: number}[] = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.random() * 0.5 - 0.25,
                vy: Math.random() * 0.5 - 0.25,
                radius: Math.random() * 1.5 + 0.5
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    const dist = Math.sqrt((particles[i].x - particles[j].x) ** 2 + (particles[i].y - particles[j].y) ** 2);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        }

    }, []);

    return (
        <div className="min-h-screen bg-[#0b1120] text-white flex flex-col items-center justify-center text-center p-4 relative">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-50"></canvas>
            <div className="relative z-10 flex flex-col items-center">
                <Logo size={80} />
                <h1 className="text-4xl md:text-6xl font-bold mt-6">Domine a Nuvem AWS</h1>
                <p className="max-w-2xl mt-4 text-lg text-gray-300">
                    A plataforma de estudos definitiva para sua certificação SAA-C03. Quizzes, flashcards e um treinador de IA para acelerar sua aprovação.
                </p>
                <Button className="mt-8 px-8 py-4 text-lg" onClick={() => setIsLoginModalOpen(true)}>Acessar Plataforma</Button>
            </div>
            {isLoginModalOpen && (
                <LoginModal
                    onSignIn={onLoginSuccess}
                    onClose={() => setIsLoginModalOpen(false)}
                />
            )}
        </div>
    );
};
