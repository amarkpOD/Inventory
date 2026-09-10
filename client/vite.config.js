import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Testing API (port 5002) when VITE_API_PROXY=http://localhost:5002
// Default local server now also uses Testing DB on port 5001
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
