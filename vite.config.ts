import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Plugin para copiar diretório data para dist
    const copyDataPlugin = {
      name: 'copy-data',
      apply: 'build',
      writeBundle() {
        try {
          mkdirSync('./dist/data', { recursive: true });
          copyFileSync('./data/saa-questions-br.json', './dist/data/saa-questions-br.json');
          copyFileSync('./data/clf-questions-br.json', './dist/data/clf-questions-br.json');
          copyFileSync('./data/aif-questions-br.json', './dist/data/aif-questions-br.json');
          console.log('✓ Arquivos de questões PT-BR copiados para dist/data');
        } catch (err) {
          console.warn('⚠️ Aviso ao copiar dados:', err);
        }
      }
    };

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), copyDataPlugin],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_PIX_KEY': JSON.stringify(env.VITE_PIX_KEY),
        'import.meta.env.VITE_PIX_RECEIVER_NAME': JSON.stringify(env.VITE_PIX_RECEIVER_NAME),
        'import.meta.env.VITE_PIX_RECEIVER_CITY': JSON.stringify(env.VITE_PIX_RECEIVER_CITY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
