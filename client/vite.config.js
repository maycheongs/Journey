import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8000,
    fs: {
      strict: false,
    },
     proxy: {
      '/api': {
        target: 'http://localhost:8001', // your backend
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Requesting:', req.method, req.url);
          });
      },
    },
    middlewareMode: false,
    configureServer(server) {
      // Add this *before* Vite's internal middlewares
      server.middlewares.use((req, res, next) => {
        try {
          decodeURI(req.url);
          console.log('[VITE REQUEST]', req.url);
        } catch (e) {
          console.error('Malformed URI detected:', req.url);
          // Optionally send a 400 response and end early to avoid crash:
          res.statusCode = 400;
          return res.end('Malformed URI');
        }
        next();
      });
    },
  },
});
