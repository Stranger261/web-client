import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Allow serving model files
  assetsInclude: ['**/*.json', '**/*.shard1', '**/*.shard2'],

  server: {
    fs: {
      strict: false,
    },
    // Ensure correct MIME types
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  build: {
    assetsInlineLimit: 0, // Don't inline large files
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },

  publicDir: 'public',
});
