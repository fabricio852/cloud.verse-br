/**
 * Tela de Autenticação (Login/Signup)
 */

import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { signUp, signIn } from '../services/authService';
import { cn } from '../utils';
import { R } from '../constants';

interface AuthScreenProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

type AuthMode = 'login' | 'signup';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onCancel }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Verificar se Supabase está acessível
  React.useEffect(() => {
    console.log('[Auth] Componente montado');
    console.log('[Auth] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('[Auth] Supabase Key (primeiros 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Auth] Submit iniciado', { mode, email, name });
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        console.log('[Auth] Chamando signUp...');
        const { user, error } = await signUp(email, password, name);
        console.log('[Auth] Resposta signUp:', { user: user?.email, error: error?.message });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (user) {
          // Sucesso - usuário criado
          console.log('[Auth] Cadastro realizado:', user.email);
          onSuccess();
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      } else {
        console.log('[Auth] Chamando signIn...');
        const { user, error } = await signIn(email, password);
        console.log('[Auth] Resposta signIn:', { user: user?.email, error: error?.message });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (user) {
          console.log('[Auth] Login realizado:', user.email);
          onSuccess();
        } else {
          setError('Email ou senha incorretos.');
        }
      }
    } catch (err: any) {
      console.error('[Auth] Erro catch:', err);
      setError(err.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <LoadingOverlay open={loading} message={mode === 'signup' ? 'Criando conta...' : 'Entrando...'} />

      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
            {mode === 'login'
              ? 'Entre para acessar seu histórico e progresso'
              : 'Crie sua conta e comece a estudar para a certificação AWS'}
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 border border-gray-300 dark:border-gray-600",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                    "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                    R.md
                  )}
                  placeholder="Seu nome"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                  "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                  R.md
                )}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                  "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                  R.md
                )}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {/* Toggle de modo */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  disabled={loading}
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  disabled={loading}
                >
                  Entre
                </button>
              </>
            )}
          </div>

          {/* Botão Cancelar (opcional) */}
          {onCancel && (
            <div className="mt-4 text-center">
              <button
                onClick={onCancel}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                disabled={loading}
              >
                Continuar sem login
              </button>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-center text-gray-500 dark:text-gray-400">
          Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </main>
    </div>
  );
};
