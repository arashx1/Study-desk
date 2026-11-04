import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({ plugins: [react()], build: { target: 'chrome116', rollupOptions: { input: { panel: resolve(__dirname, 'index.html'), background: resolve(__dirname, 'src/background.ts'), readability: resolve(__dirname, 'src/readability.ts') }, output: { entryFileNames: '[name].js', chunkFileNames: 'assets/[name]-[hash].js' } } } });
