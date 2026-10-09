import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Rutas relativas: permite servir la app tanto en local como en GitHub Pages.
  base: './',
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
