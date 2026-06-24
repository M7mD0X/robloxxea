import UrlToLoadstring from './UrlToLoadstring';

/**
 * AppToolsPage — wrapper for app utilities. The subtab (URL to Loadstring)
 * is controlled by the sidebar, not a segmented control here. When more
 * app tools are added, they become sidebar subitems under "App Tools".
 */
export default function AppToolsPage() {
  return <UrlToLoadstring />;
}
