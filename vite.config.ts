/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
  },
  server: {
    // The notification backend does not exist yet (see README milestone 2).
    // When it does, it will run on :4000 and this proxy makes `npm run dev`
    // talk to it on the same origin, exactly as nginx does in production.
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
