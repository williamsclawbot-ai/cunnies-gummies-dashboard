import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './',
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api/mock-orders': {
        target: 'http://localhost:3001',
        rewrite: (path) => path,
      },
      '/api/shopify': {
        target: 'http://localhost:3001',
        rewrite: (path) => path,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
