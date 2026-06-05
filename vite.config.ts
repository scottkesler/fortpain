import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the apex custom domain (fortpain.com), so the base path is root.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
