import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';
import { tokenSourceDir, writeTokenFiles } from './scripts/tokens/build-tokens.mjs';

/** Regenerates token outputs at startup and whenever a token source changes. */
function designTokens(): Plugin {
  const sourceDir = resolve(tokenSourceDir);
  return {
    name: 'system-lab:design-tokens',
    buildStart() {
      writeTokenFiles();
    },
    configureServer(server) {
      server.watcher.add(sourceDir);
      server.watcher.on('change', (file) => {
        if (!resolve(file).startsWith(sourceDir) || !file.endsWith('.json')) return;
        try {
          const { written } = writeTokenFiles();
          if (written.length) server.config.logger.info(`[tokens] regenerated ${written.length} file(s)`);
        } catch (error) {
          server.config.logger.error(`[tokens] ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    },
  };
}

export default defineConfig({
  // GitHub Pages serves the site from /<repository>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), designTokens()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
  },
});
