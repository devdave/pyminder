import {defineConfig} from 'vite';

//import react from '@vitejs/plugin-react';
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from 'vite-tsconfig-paths';
import {resolve} from 'node:path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  build: {
    sourcemap: false,
    rollupOptions:{
      input: {
            main: resolve(__dirname, 'index.html'),
      }
    }
  }
});
