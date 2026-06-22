/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAIN_TOOLS_URL?: string;
  readonly VITE_COMMUNITY_TOOLS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
