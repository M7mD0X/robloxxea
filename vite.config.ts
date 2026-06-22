import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves project sites at <user>.github.io/<repo>/.
// We only know the repo name at build time inside Actions, so we set base
// conditionally: '/robloxxea/' for Pages, '/' for local dev.
const isPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const BASE = isPagesBuild ? '/robloxxea/' : '/';

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', '404.html'],
      manifest: {
        name: 'RobloxXea',
        short_name: 'RobloxXea',
        description: 'Advanced toolkit for Roblox scripters — main tools, community library, and Luau docs.',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        // Relative URLs so the manifest works on both local dev (/) and
        // GitHub Pages (/robloxxea/) without modification.
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Increase the precache limit slightly so the Docs chunk + community
        // JSON fallback get cached for offline use.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Cache the community tools JSON feed for offline use.
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'community-tools-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
});
