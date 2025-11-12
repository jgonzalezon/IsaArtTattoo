import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración del entorno de desarrollo
export default defineConfig({
  plugins: [react()],
  server: {
    port: 54395, // puerto por defecto de Vite
    proxy: {
      "/api": {
        target: "http://localhost:5088", // puerto de tu API Identity
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
