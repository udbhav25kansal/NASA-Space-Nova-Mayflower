import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three']
  },
  // Copy JSON files to dist during build
  plugins: [
    {
      name: 'copy-json-files',
      writeBundle() {
        const distDataDir = resolve(__dirname, 'dist/src/data');
        mkdirSync(distDataDir, { recursive: true });
        copyFileSync(
          resolve(__dirname, 'src/data/psych-model-params.json'),
          resolve(distDataDir, 'psych-model-params.json')
        );
        copyFileSync(
          resolve(__dirname, 'src/data/nasa-constraints.json'),
          resolve(distDataDir, 'nasa-constraints.json')
        );
      }
    }
  ]
});
