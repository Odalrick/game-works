import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig({
  base: "/game-works/",
  plugins: [react()],
  resolve: {
    alias: {
      "@games": resolve(__dirname, "./src/games"),
    },
  },
})
