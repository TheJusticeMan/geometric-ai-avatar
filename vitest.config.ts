import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: true }
});
