import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  build: {
    target: 'es2015',
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              'vendor-three': ['three'],
              'vendor-motion': ['motion', 'animejs'],
              'vendor-react': ['react', 'react-dom'],
            },
          },
    },
    chunkSizeWarningLimit: 600,
  },
  ssgOptions: {
    dirStyle: 'nested',
    mock: true,
  },
}));
