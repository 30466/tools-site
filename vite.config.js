import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://abm48.com',
        changeOrigin: true
      },
      '/pocketapi': {
        target: 'https://pocketapi.48.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pocketapi/, '/live/api/v1/live'),
        headers: {
          'Origin': 'https://h5.48.cn',
          'Referer': 'https://h5.48.cn/'
        }
      },
      '/cdn': {
        target: 'https://idol-vod.48.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, ''),
        headers: {
          'Origin': 'https://h5.48.cn',
          'Referer': 'https://h5.48.cn/'
        }
      },
      '/proxy': {
        target: 'http://localhost:3099',
        changeOrigin: true
      },
      '/source48': {
        target: 'https://source.48.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/source48/, '')
      }
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  }
})