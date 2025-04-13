// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false, // Desactiva completamente la barra de herramientas
  },
  vite: {
    plugins: [tailwindcss()]
  }
});