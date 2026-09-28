// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages 项目站：https://evilevil.github.io/changsha-guide/
  site: 'https://evilevil.github.io',
  base: '/changsha-guide',
  trailingSlash: 'ignore',
  build: {
    // 小体积内联，减少请求；大文件外链
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
