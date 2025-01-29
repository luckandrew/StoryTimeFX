import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  define: {
    'process.env.REACT_APP_FREESOUND_API_KEY': JSON.stringify(process.env.REACT_APP_FREESOUND_API_KEY)
  }
})