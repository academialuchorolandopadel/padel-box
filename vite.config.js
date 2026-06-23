import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "/padel-box/" porque GitHub Pages publica en
// academialuchorolandopadel.github.io/padel-box/ (un subdirectorio).
// Si algún día cambiás el nombre del repo, hay que cambiar esto también.
export default defineConfig({
  base: "/padel-box/",
  plugins: [react()],
});
