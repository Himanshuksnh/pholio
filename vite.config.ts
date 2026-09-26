import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import { seoFiles } from './vite-plugin-seo-files.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `loadEnv` is used instead of `import.meta.env` so the sitemap/robots origin
  // matches what the app renders from `src/config/site.ts`.
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL ?? 'https://example.com'

  return {
    plugins: [react(), tailwindcss(), seoFiles(siteUrl)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2022',
      cssTarget: 'chrome111',
      reportCompressedSize: false,
    },
  }
})
