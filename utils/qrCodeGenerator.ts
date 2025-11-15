/**
 * Utilitários para gerar QR Codes usando a biblioteca qrcode
 * Especializado em PIX estático
 */

import QRCode from 'qrcode';

/**
 * Gera uma string de dados de QR Code a partir de um payload
 * Usa a biblioteca 'qrcode' para gerar QR codes de alta qualidade
 *
 * @param payload Dados a serem codificados no QR
 * @returns Promise com string em data URL do QR code ou URI de fallback
 */
export const generatePixQRCode = async (pixPayload: string): Promise<string> => {
  try {
    // Valida o payload
    if (!isValidPixPayload(pixPayload)) {
      console.warn('Invalid PIX payload:', pixPayload);
      return generateFallbackQRPlaceholder(pixPayload);
    }

    // Gera QR code como data URL com qualidade alta
    const dataUrl = await QRCode.toDataURL(pixPayload, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H', // Máxima capacidade de correção de erros
    });

    return dataUrl;
  } catch (error) {
    // Fallback: retorna um placeholder ou gera um SVG simples
    console.warn('QR Code generation failed, using fallback:', error);
    return generateFallbackQRPlaceholder(pixPayload);
  }
};

/**
 * Gera um placeholder SVG para QR code quando a biblioteca não está disponível
 * Exibe uma mensagem informativa ao usuário
 *
 * @param pixPayload Dados do PIX (usado para gerar um hash visual)
 * @returns Data URL com SVG placeholder
 */
export const generateFallbackQRPlaceholder = (pixPayload: string): string => {
  // Gera um "padrão visual" baseado no payload para debugging
  const hash = pixPayload.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const bgColor = colors[hash % colors.length];

  const svg = `
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="${bgColor}" opacity="0.1"/>
      <rect width="300" height="300" fill="white" stroke="${bgColor}" stroke-width="2"/>
      <text x="150" y="140" text-anchor="middle" font-size="14" fill="#666">
        QR Code não disponível
      </text>
      <text x="150" y="165" text-anchor="middle" font-size="12" fill="#999">
        Use a chave PIX:
      </text>
      <text x="150" y="185" text-anchor="middle" font-size="11" font-family="monospace" fill="#666">
        ${pixPayload.substring(0, 20)}...
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

/**
 * Gera múltiplos formatos de saída para PIX
 * Suporta: data URL, canvas, etc
 */
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Gera QR code com opções customizáveis
 */
export const generateQRCodeWithOptions = async (
  pixPayload: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const {
    size = 300,
    margin = 1,
    darkColor = '#000000',
    lightColor = '#ffffff',
  } = options;

  try {
    // Valida o payload
    if (!isValidPixPayload(pixPayload)) {
      console.warn('Invalid PIX payload:', pixPayload);
      return generateFallbackQRPlaceholder(pixPayload);
    }

    // Gera QR code como data URL
    const dataUrl = await QRCode.toDataURL(pixPayload, {
      width: size,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'H',
    });

    return dataUrl;
  } catch (error) {
    console.warn('QR Code generation with options failed:', error);
    return generateFallbackQRPlaceholder(pixPayload);
  }
};

/**
 * Valida se a string de payload PIX é válida
 * (Verificações básicas)
 */
export const isValidPixPayload = (payload: string): boolean => {
  // Payload não pode ser vazio
  if (!payload || payload.length === 0) return false;

  // Payload deve ter comprimento razoável (mín 10 chars, máx 512)
  if (payload.length < 10 || payload.length > 512) return false;

  // Não deve conter caracteres de controle (exceto espaços)
  const controlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (controlCharRegex.test(payload)) return false;

  return true;
};
