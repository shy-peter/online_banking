import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Manual chunking to keep heavy modules (appwrite, UI libs) out of the main chunk
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return;
          if (id.includes('node_modules/appwrite')) return 'vendor-appwrite';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/recharts') || id.includes('node_modules/lucide-react')) return 'vendor-ui';
          if (id.includes('src/pages/AdminDashboard')) return 'admin';
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  }
})


