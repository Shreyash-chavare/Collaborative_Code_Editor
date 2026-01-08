import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';



// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, 'public/dashboard.html')
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log("Original path:", path);
          const newPath = path.replace(/^\/api/, '/');
          console.log("Rewritten path:", newPath);
          return newPath;
        }
      }
    }
  }
  
})