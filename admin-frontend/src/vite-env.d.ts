/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCK_API: string;
  readonly VITE_SPLINE_BG_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
