import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server: anything starting with /api goes to the .NET app so we don't need CORS while coding.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5198',
        changeOrigin: true,
      },
    },
  },
})
