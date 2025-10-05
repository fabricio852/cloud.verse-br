
import React from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

interface PaywallModalProps {
    open: boolean;
    onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ open, onClose }) => {
    if (!open) return null;
    return (
        <Modal open={open} onClose={onClose} title="Recurso PRO">
            <div className="text-sm text-gray-700 space-y-2">
                <p>Faça upgrade para o plano PRO para desbloquear esta e outras funcionalidades exclusivas, como revisão completa, quizzes ilimitados e explicações detalhadas com IA.</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <Button onClick={onClose}>Ok</Button>
            </div>
        </Modal>
    );
};
