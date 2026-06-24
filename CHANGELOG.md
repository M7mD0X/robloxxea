# Changelog

All notable changes to RobloxXea are documented in this file. Dates are in UTC.

## [Unreleased]

### Changed — sidebar layout + restructured tabs
- Replaced the 4-tab bottom nav with a responsive layout: **sidebar on desktop** (lg+), **bottom nav on mobile**.
- New tab structure:
  - **Main** (`/`) — home/overview page with stats, featured tools, and quick-access cards.
  - **Tools** (`/tools`) — combines Official Tools + Community Tools as subtabs (segmented control at the top).
  - **App Tools** (`/apps`) — contains URL to Loadstring (and future app tools).
  - **Docs** (`/docs`) — unchanged.

## [1.4.0] — 2026-06-22

### Added — URL to Loadstring converter (P4)
- New "Convert" tab (4th nav item) with a chain icon.
- Paste a raw Lua file URL → get a ready-to-paste `loadstring(game:HttpGet('...'))()` wrapper.
- Smart URL normalization: auto-converts `github.com/.../blob/...` URLs to `raw.githubusercontent.com/...`.
- 3 wrapper styles: `game:HttpGet` (default), `game:HttpGetAsync`, plain `loadstring`.
- "Verify URL" button fetches the URL and confirms it returns real Lua source (>100 bytes + Lua tokens).
- .lua/.luau extension validation with amber warning.
- Quick-fill example buttons.

## [1.3.0] — 2026-06-22

### Added — Tool detail page (P3)
- Dedicated page at `/tool/:id` for each tool.
- **Compatibility detector** (`src/lib/compatibility.ts`): fetches the actual Lua source and scans for 15+ executor-only APIs (`getgenv`, `hookfunction`, `hookmetamethod`, `syn.*`, `Drawing.new`, `game:HttpGet`, `loadstring(`, etc.). Shows badges: "Universal" (green) if no executor APIs found, "Executor Required" (pink) with specific API names if found, plus "Luau" (cyan) info badge.
- **GitHub changelog** (`src/lib/github.ts`): fetches the latest 5 releases from the tool's repo via the public GitHub API. Handles 403 (rate limit) and 404 (no releases) gracefully. Cached for 10 min.
- ToolCard's icon + name + description area is now clickable → navigates to detail page. Tool data passed via router state (no refetch).

## [1.2.0] — 2026-06-22

### Added — Favorites + Recently Copied (P2)
- `useLocalStorage` hook — generic localStorage with JSON serialization + cross-tab sync.
- `useToolStorage` context — app-wide favorites + recently-copied state.
- **Favorites**: star button on every ToolCard (top-right, amber when favorited). "Favorites" filter chip on Main Tools + "Favorites only" toggle on Community Tools.
- **Recently Copied**: horizontal scroll strip at the top of Main Tools. Shows last 10 copied tools. Tap to re-copy. Shared across tabs (copy on Community → appears in Main's strip). Includes "Clear" button.
- Data persists to localStorage (`robloxxea:favorites:v1`, `robloxxea:recent:v1`).

## [1.1.0] — 2026-06-22

### Added — PWA polish (P0) + self-verifying data feed (P1)
- **PWA icons**: generated `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` from a custom SVG RX logo with gradients + glow.
- **InstallButton** component: captures `beforeinstallprompt` event, shows "Install" button in header. On iOS Safari (no API), shows a tooltip pointing at Share → Add to Home Screen.
- **UpdateToast** component: uses `vite-plugin-pwa`'s `useRegisterSW` hook to detect new bundles. Shows "New version available — Reload" toast above bottom nav. Also fires a one-time "Ready for offline" confirmation.
- **`robloxxea-data` repo** created at `https://github.com/M7mD0X/robloxxea-data`:
  - `mainTools.json` (12 verified tools) + `communityTools.json` (9 verified tools).
  - `verify_loadstrings.py` — re-fetches every loadstring URL weekly, checks 200 OK + >1KB + Lua tokens. Updates `verified`/`lastVerified`/`verifiedSizeBytes` fields.
  - Weekly GitHub Action (Mondays 08:00 UTC) opens a `loadstrings-broken` issue when any tool 404s, auto-closes when all pass.
- Deploy workflow updated to set `VITE_MAIN_TOOLS_URL` + `VITE_COMMUNITY_TOOLS_URL` env vars pointing at the data repo.

## [1.0.2] — 2026-06-22

### Added — issue-driven tool submission workflow
- YAML issue form (`.github/ISSUE_TEMPLATE/submit-a-tool.yml`) with structured fields: name, author, repo URL, loadstring, category, description, optional tags/icon/color.
- `process_submission.py` — parses issue body, validates fields, HTTP-verifies the loadstring, appends to `communityTools.json`.
- `submit-tool.yml` workflow — fires on issue open/edit. On success: creates branch, commits, opens auto-PR, comments with PR link. On failure: comments with exact error + remediation hints.
- **Feed policy lock**: submissions are hardcoded to Community feed only. `process_submission.py` rejects any hand-edited issue body containing `Feed: Main Tools`. Main Tools feed is maintainer-curated via direct PR.
- "Submit a tool" button in the app (Main Tools + Community tabs) deep-links to the issue form.
- Labels: `submission`, `pending-review`, `needs-revision`, `auto-generated`.

## [1.0.1] — 2026-06-22

### Fixed — responsive layout
- Removed `max-w-md` constraint that left huge empty margins on wide screens.
- Header + main now use `max-w-screen-xl` with responsive padding (`px-4 sm:px-6 lg:px-8`).
- Tool card lists are now a responsive grid: 1 column (mobile) → 2 (tablet) → 3 (desktop).
- Bottom nav widened from `max-w-md` to `max-w-2xl`.
- Removed `maximum-scale=1.0, user-scalable=no` from viewport meta (was blocking accessibility zoom).
- SPA routing fixed for GitHub Pages: `base: '/robloxxea/'` in vite config, `BrowserRouter basename`, `public/404.html` SPA-redirect hack, `index.html` decode script.
- Auto-deploy workflow (`.github/workflows/deploy.yml`) — every push to `main` builds and deploys to Pages via `actions/deploy-pages@v4`.

## [1.0.0] — 2026-06-21

### Added — initial release
- Vite + React + TypeScript + Tailwind CSS + `vite-plugin-pwa`.
- Dark "hacker" aesthetic: deep `#0a0a0f` background, neon cyan/purple accents, JetBrains Mono code.
- **Tab 1 (Main Tools)**: 12 curated tools with real GitHub loadstrings (Infinite Yield, Unnamed ESP, Hydroxide, Fates Admin, WindUI, Orion Library, etc.).
- **Tab 2 (Community Tools)**: auto-updating JSON feed + debounced search.
- **Tab 3 (Docs)**: 3 real Luau articles (Advanced Functions, Metatables/Hooking, Remote Spies) with custom syntax highlighter + copy buttons.
- `ToolCard` component with `navigator.clipboard` + "Copied!" success state.
- `CodeBlock` component with dependency-free Luau syntax highlighter.
- Fixed bottom navigation (3 tabs) with neon-cyan active glow.
- PWA manifest + service worker.
