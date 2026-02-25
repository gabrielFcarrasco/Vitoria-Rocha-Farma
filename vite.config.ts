import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Isso permite que o pop-up do Google Login funcione localmente
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
})