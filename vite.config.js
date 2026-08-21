import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Dev'de /api/* isteklerini Express backend'e yönlendir
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React runtime & DOM
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
              return 'vendor-react';
            }
            // Router & Navigation
            if (id.includes('react-router') || id.includes('@remix-run')) {
              return 'vendor-router';
            }
            // Motion & Animation
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Internationalization
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
          }
        },
      },
    },
  },
})
