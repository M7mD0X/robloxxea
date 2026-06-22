# RobloxXea

> Advanced mobile-first PWA toolkit for Roblox scripters — built with Vite + React + TypeScript + Tailwind.

Three tabs, native-app-style bottom navigation, dark "hacker" aesthetic with neon cyan/purple accents, offline-first PWA caching, and a real data feed of open-source Roblox scripting tools.

---

## Vite Setup Instructions

```bash
# 1. Scaffold the project (this exact stack — React + TS + Vite)
npm create vite@latest robloxxea -- --template react-ts
cd robloxxea

# 2. Install runtime deps
npm install react-router-dom@^6

# 3. Install dev deps — Tailwind, PostCSS, Autoprefixer, PWA plugin
npm install -D tailwindcss@^3 postcss autoprefixer \
                vite-plugin-pwa@^0.20 \
                @types/node

# 4. Initialize Tailwind
npx tailwindcss init -p

# 5. Start dev server
npm run dev

# 6. Production build (also generates service worker for PWA)
npm run build && npm run preview
```

Then drop in the files from this repo (everything under `src/`, plus `index.html`,
`vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `.env.example`).

---

## Project Structure

```
robloxxea/
├── index.html              # PWA-aware HTML shell (dark theme, fonts, safe-area)
├── vite.config.ts          # Vite + React + PWA plugin + runtime caching
├── tailwind.config.js      # Dark hacker palette (void-900, neon cyan/purple)
├── postcss.config.js
├── tsconfig.json
├── .env.example            # VITE_MAIN_TOOLS_URL / VITE_COMMUNITY_TOOLS_URL
├── public/
│   └── favicon.svg         # RobloxXea "RX" mark
└── src/
    ├── main.tsx            # React Router bootstrap
    ├── App.tsx             # Layout: sticky header + Routes + fixed BottomNav
    ├── index.css           # Tailwind base + component classes (.card, .btn-neon, etc.)
    ├── vite-env.d.ts       # Vite env type augmentation
    ├── components/
    │   ├── ToolCard.tsx    # Reusable card with Clipboard API + "Copied!" state
    │   ├── CodeBlock.tsx   # Luau syntax-highlighted code viewer + copy button
    │   └── BottomNav.tsx   # Fixed 3-tab bottom navigation
    ├── pages/
    │   ├── MainTools.tsx   # Tab 1: curated toolkit (fetches from API or bundled fallback)
    │   ├── CommunityTools.tsx  # Tab 2: auto-updating JSON feed + debounced search
    │   └── Docs.tsx        # Tab 3: 3 real Luau articles
    └── data/
        ├── mainTools.json       # 12 real tools with working GitHub loadstrings
        └── communityTools.json  # 12 community tools feed
```

---

## Wiring Up Live Data Feeds

Both tabs accept a `VITE_*_URL` env var. When unset, they fall back to the bundled JSON in `src/data/` so the app always renders something useful — perfect for offline-first PWA behavior.

```bash
# .env (or .env.local)
VITE_MAIN_TOOLS_URL=https://your-api.example.com/mainTools.json
VITE_COMMUNITY_TOOLS_URL=https://raw.githubusercontent.com/your-org/RobloxXea-CommunityFeed/main/communityTools.json
```

The JSON shape is identical for both feeds:

```json
{
  "_meta": { "name": "...", "version": "1.0.0", "updated": "2026-06-22" },
  "tools": [
    {
      "id": "infinite-yield",
      "name": "Infinite Yield",
      "author": "EdgeIY",
      "category": "Admin Commands",
      "description": "...",
      "loadstring": "loadstring(game:HttpGet('https://...'))()",
      "repo": "https://github.com/...",
      "icon": "IY",
      "iconColor": "#22d3ee",
      "tags": ["admin", "universal"],
      "featured": true
    }
  ]
}
```

---

## PWA Notes

- `vite-plugin-pwa` generates a service worker that precaches the app shell.
- `runtimeCaching` in `vite.config.ts` is pre-configured to cache `raw.githubusercontent.com` requests with a NetworkFirst strategy — perfect for the community tools feed.
- Add `public/icon-192.png` and `public/icon-512.png` for install icons (the manifest references them).

---

## Real Tools Disclaimer

Every loadstring in `src/data/mainTools.json` points at a real, publicly available open-source GitHub repository. Roblox tooling moves fast — repos get renamed, branches get retagged, and executors drop support for old APIs. **Verify each loadstring still resolves** before shipping to production. The bundled list is a starting point curated as of June 2026.
