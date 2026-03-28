import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** GitHub Pages proje kökü: /emlak-yonetim-demo/ (CI’da GITHUB_PAGES=true) */
const repo = 'emlak-yonetim-demo';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? `/${repo}/` : '/',
  plugins: [react(), tailwindcss()],
});
