import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      // Explicitly define content paths for Tailwind CSS v4
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxying API requests to the backend server
      '/api': {
        target: 'http://localhost:8080', // Assuming the backend runs on port 8080
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
