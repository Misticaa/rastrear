import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        tracking: 'rastreamento.html',
        obrigado: 'obrigado.html'
      }
    }
  },
  server: {
    proxy: {
      '/apela-api': {
        target: 'https://apela-api.tech',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apela-api/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  }
})