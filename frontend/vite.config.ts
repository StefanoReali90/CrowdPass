import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = (env.API_PROXY_TARGET || 'http://127.0.0.1:8080').replace(/\/$/, '')

  const createApiProxy = (): ProxyOptions => ({
    target: proxyTarget,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyRequest) => {
        // The browser talks to Vite on the same public origin. The forwarded
        // request is server-to-server, so it must not trigger backend CORS.
        proxyRequest.removeHeader('origin')
      })
    },
  })

  return {
    plugins: [react()],
    server: {
      allowedHosts: ['.trycloudflare.com'],
      proxy: {
        '/api': createApiProxy(),
      },
    },
    preview: {
      allowedHosts: ['.trycloudflare.com'],
      proxy: {
        '/api': createApiProxy(),
      },
    },
  }
})
