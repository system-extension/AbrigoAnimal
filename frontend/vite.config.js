import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, /api e /arquivos vão para o Spring (porta 8080).
// Assim o navegador enxerga um endereço só: sem CORS e com o cookie de sessão funcionando.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/arquivos': 'http://localhost:8080',
    },
  },
});
