import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the apex custom domain (fortpain.com), so the base path is root.
// Multi-page build: a landing page at "/" and the Alabama roster at "/alabama/".
// Input paths are relative to the project root, which Vite resolves for us.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        landing: 'index.html',
        alabama: 'alabama/index.html',
      },
    },
  },
});
