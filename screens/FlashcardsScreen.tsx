
import React, { useState } from 'react';
import { Button, GhostButton } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Logo } from '../components/common/Logo';
import { FLASHCARD_BANK_INITIAL } from '../constants';
import { shuffle } from '../utils';
import { cn } from '../utils';
import { generateFlashcard } from '../services/geminiService';

interface Flashcard {
    id: string;
    front: string;
    back: string;
}

interface FlashcardsScreenProps {
    onBack: () => void;
}

export const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({ onBack }) => {
    const [deck, setDeck] = useState<Flashcard[]>(() => shuffle([...FLASHCARD_BANK_INITIAL]));
    const [sessionQueue, setSessionQueue] = useState<number[]>(() => deck.map((_, index) => index));
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState({ again: 0, hard: 0, good: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCardTopic, setNewCardTopic] = useState("");
    const [isCreatingCard, setIsCreatingCard] = useState(false);

    const currentCard = deck[sessionQueue[0]];

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleCreateCard = async () => {
        if (!newCardTopic.trim()) return;
        setIsCreatingCard(true);
        try {
            const newCardContent = await generateFlashcard(newCardTopic);
            const newCardWithId: Flashcard = { ...newCardContent, id: `custom-${Date.now()}` };
            // FIX: Changed to append the card to avoid re-indexing, and used `deck.length` to get the new card's index, resolving the scope issue.
            setDeck(prevDeck => [...prevDeck, newCardWithId]);
            setSessionQueue(prevQueue => [deck.length, ...prevQueue]);
            setShowCreateModal(false);
            setNewCardTopic("");
        } catch (error) {
            console.error("Error creating card:", error);
            // Optionally, show an error message to the user
        } finally {
            setIsCreatingCard(false);
        }
    };

    const handleRating = (rating: 'again' | 'hard' | 'good') => {
        let newQueue = [...sessionQueue];
        const reviewedCardIndex = newQueue.shift();
        if (reviewedCardIndex === undefined) return;

        if (rating === 'again') {
            newQueue.splice(1, 0, reviewedCardIndex);
            setStats(s => ({ ...s, again: s.again + 1 }));
        } else if (rating === 'hard') {
            const midPoint = Math.ceil(newQueue.length / 2);
            newQueue.splice(midPoint, 0, reviewedCardIndex);
            setStats(s => ({ ...s, hard: s.hard + 1 }));
        } else {
            setStats(s => ({ ...s, good: s.good + 1 }));
        }

        setSessionQueue(newQueue);
        setIsFlipped(false);
    };

    const restartSession = () => {
        const newDeck = shuffle([...FLASHCARD_BANK_INITIAL]);
        setDeck(newDeck);
        setSessionQueue(newDeck.map((_, index) => index));
        setIsFlipped(false);
        setStats({ again: 0, hard: 0, good: 0 });
    };

    if (sessionQueue.length === 0) {
        return (
            <div className="min-h-screen">
                <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700"><div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between"><Logo /><GhostButton onClick={onBack}>Voltar</GhostButton></div></header>
                <main className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Parabéns!</h2>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Você concluiu esta sessão de estudos.</p>
                        <div className="mt-4 text-gray-600 dark:text-gray-400">
                            <p>Acertos: <span className="font-bold text-green-600 dark:text-green-400">{stats.good}</span></p>
                            <p>Revisados (Difícil): <span className="font-bold text-yellow-600 dark:text-yellow-400">{stats.hard}</span></p>
                            <p>Para rever (Errei): <span className="font-bold text-red-600 dark:text-red-400">{stats.again}</span></p>
                        </div>
                        <Button onClick={restartSession} className="mt-6">Iniciar Nova Sessão</Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <Button className="px-3 py-1 text-sm" onClick={() => setShowCreateModal(true)}>✨ Criar Flashcard com IA</Button>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Cartas restantes: <span className="font-bold">{sessionQueue.length}</span></div>
                        <GhostButton onClick={onBack}>Voltar</GhostButton>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
                <div className="mb-4 text-gray-500 dark:text-gray-400 text-sm h-5">
                    {!isFlipped ? 'Clique no card para ver a resposta.' : 'Como você avalia seu conhecimento?'}
                </div>
                <div className="w-full max-w-2xl h-80 [perspective:1000px] cursor-pointer" onClick={!isFlipped ? handleFlip : undefined}>
                    <div className={cn("relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}>
                        <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-6 text-center">
                            <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{currentCard.front}</p>
                        </div>
                        <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center [transform:rotateY(180deg)]">
                            <p className="text-md md:text-lg text-gray-800 dark:text-gray-200 font-medium">{currentCard.back}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 w-full max-w-2xl h-14">
                    {isFlipped && (
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => handleRating('again')} className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/80 transition">Errei</button>
                            <button onClick={() => handleRating('hard')} className="p-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 font-semibold rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/80 transition">Difícil</button>
                            <button onClick={() => handleRating('good')} className="p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold rounded-lg hover:bg-green-200 dark:hover:bg-green-900/80 transition">Fácil</button>
                        </div>
                    )}
                </div>
            </main>
            <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Criar Flashcard com IA">
                <p className="text-sm">Digite um tópico, serviço ou conceito da AWS para a IA criar um flashcard para você.</p>
                <Input type="text" placeholder="Ex: AWS WAF" value={newCardTopic} onChange={(e) => setNewCardTopic(e.target.value)} />
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleCreateCard} disabled={isCreatingCard}>
                        {isCreatingCard ? 'Criando...' : '✨ Gerar Card'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
