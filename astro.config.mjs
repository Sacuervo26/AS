import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel'; // Asegúrate de que esta importación existe

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://sacuervo26.github.io', // Opcional: solo si también usas GitHub Pages
  base: '/Alma/', // Opcional: solo si usas GitHub Pages (conflicto con Vercel)
  adapter: vercel()
});