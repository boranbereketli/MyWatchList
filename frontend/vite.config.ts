import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Expose only what the app reads. Passing all of process.env would bake every environment
  // variable of the build machine (tokens, paths, ...) into the public JS bundle.
  define: {
    "process.env.API_URL": JSON.stringify(process.env.API_URL ?? ""),
  },
});
