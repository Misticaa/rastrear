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
        secure: false,
        timeout: 30000,
        followRedirects: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy error:', {
              message: err.message,
              code: err.code,
              errno: err.errno,
              syscall: err.syscall,
              address: err.address,
              port: err.port
            });
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🚀 Sending Request to Target:', {
              method: req.method,
              url: req.url,
              headers: proxyReq.getHeaders(),
              target: 'https://apela-api.tech'
            });
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ Received Response from Target:', {
              status: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              url: req.url,
              headers: proxyRes.headers
            });
          });
          proxy.on('proxyReqError', (err, req, res) => {
            console.error('❌ Proxy Request Error:', {
              message: err.message,
              code: err.code,
              url: req.url
            });
          });
          proxy.on('proxyResError', (err, req, res) => {
            console.error('❌ Proxy Response Error:', {
              message: err.message,
              code: err.code,
              url: req.url
            });
          });
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  }
})