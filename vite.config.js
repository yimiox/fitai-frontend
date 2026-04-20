// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to your FastAPI backend during development
    proxy: {
      '/profile': 'http://localhost:8000',
      '/retrieve': 'http://localhost:8000',
      '/papers': 'http://localhost:8000',
    }
  }
})
