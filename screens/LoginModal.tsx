
import React, { useState } from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Checkbox } from '../components/ui/Input';
import { GoogleIcon, LinkedInIcon } from '../components/common/Icons';
import { cn } from '../utils';

interface LoginModalProps {
    onSignIn: () => void;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSignIn, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <Modal open={true} onClose={onClose}>
            <div className="bg-white/80 dark:bg-gray-800/80 p-2" style={{ borderRadius: 16 }}>
                <div className="flex border-b border-gray-300 dark:border-gray-600 mb-6">
                    <button onClick={() => setIsLogin(true)} className={cn("w-1/2 pb-3 text-center font-semibold", isLogin ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500")}>Entrar</button>
                    <button onClick={() => setIsLogin(false)} className={cn("w-1/2 pb-3 text-center font-semibold", !isLogin ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500")}>Cadastro</button>
                </div>

                {isLogin ? (
                    <>
                        <div className="space-y-4">
                            <Input placeholder="Email" type="email" />
                            <Input placeholder="Senha" type="password" rightIcon={<span aria-hidden="true">👁️</span>} />
                        </div>
                        <div className="mt-5 flex items-center justify-between"><Checkbox label="Lembrar-me" checked={false} onChange={() => {}}/><a className="text-blue-600 dark:text-blue-400 hover:underline text-sm" href="#">Esqueceu a senha?</a></div>
                        <Button className="w-full mt-5" onClick={onSignIn}>Entrar</Button>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <Input placeholder="Email" type="email" />
                            <Input placeholder="Senha" type="password" />
                            <Input placeholder="Confirmar Senha" type="password" />
                        </div>
                        <div className="mt-5"><Checkbox label="Aceito os Termos de Serviço" checked={false} onChange={() => {}}/></div>
                        <Button className="w-full mt-5" onClick={onSignIn}>Cadastrar</Button>
                    </>
                )}

                <div className="mt-6"><div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">Ou entre com</div>
                    <div className="flex justify-center gap-3">
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"><GoogleIcon /></button>
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-[#0A66C2]"><LinkedInIcon /></button>
                    </div></div>
            </div>
        </Modal>
    );
}
