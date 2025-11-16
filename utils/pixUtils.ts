/**
 * Utilitários para gerar QR Code PIX e gerenciar doações via PIX
 * Suporta PIX estático com chave (CPF, email, telefone ou aleatória)
 */

import { payload } from 'pix-payload';

/**
 * Remove acentos e caracteres especiais de uma string
 * Necessário para gerar códigos PIX válidos
 */
const removerAcentos = (texto: string): string => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
};

export interface PixConfig {
  chave: string; // CPF, email, telefone ou UUID
  nomeRecebedor: string;
  cidadeRecebedor: string;
  valor?: number; // Opcional - PIX com valor fixo
}

export interface PixPayload {
  qrCode: string;
  chaveFormatada: string;
  descricao: string;
}

/**
 * Lê configuração de PIX a partir das variáveis de ambiente do Vite.
 * Se não estiverem configuradas, usa valores de placeholder e emite um warning no console.
 */
export const getPixEnvConfig = (): PixConfig => {
  const chave = import.meta.env.VITE_PIX_KEY || '00000000000';
  const nomeRecebedor = import.meta.env.VITE_PIX_RECEIVER_NAME || 'Fabricio Felix Ourem Costa';
  const cidadeRecebedor = import.meta.env.VITE_PIX_RECEIVER_CITY || 'Sao Joao de Meriti';

  if (chave === '00000000000') {
    // Ajuda de debug para lembrar de configurar a chave real
    console.warn(
      '[PIX] VITE_PIX_KEY não configurada. Usando chave placeholder "00000000000".'
    );
  }

  // Debug: Verificar se as variáveis estão sendo carregadas corretamente
  console.log(
    '[PIX] Config loaded - Receiver:',
    nomeRecebedor,
    'City:',
    cidadeRecebedor
  );

  return {
    chave,
    nomeRecebedor,
    cidadeRecebedor,
  };
};

/**
 * Gera a string EMV para QR Code PIX
 * Baseado no padrão BR Code (ISO 20022)
 *
 * @param config Configuração PIX
 * @returns String em formato EMV para gerar QR Code
 */
export const gerarPixEmv = (config: PixConfig): string => {
  const {
    chave,
    nomeRecebedor,
    cidadeRecebedor,
    valor,
  } = config;

  // Valida inputs
  if (!chave || !nomeRecebedor || !cidadeRecebedor) {
    throw new Error('Chave PIX, nome e cidade são obrigatórios');
  }

  // Usa biblioteca pix-payload para gerar BR Code EMV válido
  // Remove acentos para garantir compatibilidade com validadores
  const pixPayload = payload({
    name: removerAcentos(nomeRecebedor),
    city: removerAcentos(cidadeRecebedor),
    key: chave,
    amount: valor || undefined,
  });

  // Retorna o payload EMV (BR Code) pronto para gerar QR Code
  return pixPayload;
};

/**
 * Formata a chave PIX para exibição
 * Máscara CPF/CNPJ, criptografa email/telefone parcialmente
 */
export const formatarChavePix = (chave: string): string => {
  // CPF: 123.456.789-00
  if (/^\d{11}$/.test(chave)) {
    return chave.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // CNPJ: 12.345.678/0001-90
  if (/^\d{14}$/.test(chave)) {
    return chave.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }

  // Email: user***@example.com
  if (chave.includes('@')) {
    const [local, dominio] = chave.split('@');
    const localMask = local.substring(0, 2) + '***';
    return `${localMask}@${dominio}`;
  }

  // Telefone: (11) 9****-1234
  if (/^\d{11}$/.test(chave.replace(/\D/g, ''))) {
    const tel = chave.replace(/\D/g, '');
    return tel.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) 9****-$4');
  }

  // UUID/Aleatória: mostra primeiros e últimos 6 chars
  return `${chave.substring(0, 6)}...${chave.substring(chave.length - 6)}`;
};

/**
 * Validações de chave PIX
 */
export const validarChavePix = (chave: string): boolean => {
  // CPF: 11 dígitos
  if (/^\d{11}$/.test(chave)) return true;

  // CNPJ: 14 dígitos
  if (/^\d{14}$/.test(chave)) return true;

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) return true;

  // Telefone: 11 dígitos com (xx) 9xxxx-xxxx
  if (/^(\+55)?(\d{2})9\d{4}-?\d{4}$/.test(chave)) return true;

  // UUID aleatória: 36 caracteres com hífens
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chave)) return true;

  return false;
};

/**
 * Valores sugeridos para doação
 * Baseado em análise de mercado BR
 */
export const VALORES_SUGESTAO_PIX = [
  { label: 'Café ☕', valor: 5 },
  { label: 'Almoço 🍽️', valor: 25 },
  { label: 'Presente 🎁', valor: 50 },
  { label: 'VIP 👑', valor: 100 },
];

/**
 * Mensagens de doação personalizadas por valor
 */
export const getMensagemDoacaoPersonalizada = (valor: number): string => {
  if (valor <= 5) {
    return 'Obrigado pelo café! ☕';
  }
  if (valor <= 25) {
    return 'Almoço delicioso! Muito obrigado! 🍽️';
  }
  if (valor <= 50) {
    return 'Que presente maravilhoso! 🎁 Gratidão!';
  }
  if (valor <= 100) {
    return 'VIP! Você é incrível! 👑 Obrigado!';
  }
  return `Wow! ${valor} reais?! Você é um herói! 🦸`;
};

/**
 * Formata valores em reais
 */
export const formatarValorReal = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Gera dados para analytics de doação
 */
export const gerarDoacaoEvent = (valor: number, metodo: 'pix' | 'mp' | 'stripe') => {
  return {
    event: 'doacao_realizada',
    valor,
    metodo,
    timestamp: new Date().toISOString(),
    usuario_id: null, // Anônimo
    sessao_id: typeof window !== 'undefined' ? sessionStorage.getItem('sessao_id') : null,
  };
};
