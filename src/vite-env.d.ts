/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_MAIN_TOOLS_URL?: string;
  readonly VITE_COMMUNITY_TOOLS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment BeforeInstallPromptEvent — TS doesn't ship types for it.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
  appinstalled: Event;
}
