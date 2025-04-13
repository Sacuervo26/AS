// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false, // Desactiva completamente la barra de herramientas
  },
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://sacuervo26.github.io', // Formato correcto para GitHub Pages
  base: '/Alma/', // Base debe ser la ruta del repositorio (sin "https://")
  adapter: vercel() // Ahora funcionará
}); 