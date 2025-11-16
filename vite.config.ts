import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
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
