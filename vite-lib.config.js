// Plugins
import dts from 'vite-plugin-dts'

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      declarationOnly: true
    })
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./core', import.meta.url)),
      '^': fileURLToPath(new URL('./widgets', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  root: resolve(__dirname, ''),
  publicDir: false,
  build: {
    outDir: 'dist/types',
    lib: {
      entry: 'core/eodash-d.ts',
      fileName: 'eodash',
      name: 'eodash',
      formats: ['es']
    },
    target: "esnext"
  }
});
