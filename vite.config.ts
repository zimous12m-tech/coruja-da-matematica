import { defineConfig } from 'vite';

export default defineConfig({
  base: '/coruja-da-matematica/',
  build: {
    target: 'es2020',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets'
  }
});