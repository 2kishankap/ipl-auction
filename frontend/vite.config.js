import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['.loca.lt', '.lhr.life', '.trycloudflare.com', '.ngrok-free.dev', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
         target: 'http://localhost:5001',
         changeOrigin: true
      },
      '/socket.io': {
         target: 'ws://localhost:5001',
         ws: true
      }
    }
  },
  preview: {
    allowedHosts: ['.loca.lt', '.lhr.life', '.trycloudflare.com', '.ngrok-free.dev', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
         target: 'http://localhost:5001',
         changeOrigin: true
      },
      '/socket.io': {
         target: 'ws://localhost:5001',
         ws: true
      }
    }
  }
})
