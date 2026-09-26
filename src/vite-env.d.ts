/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public origin of the deployed site, e.g. `https://example.com`. */
  readonly VITE_SITE_URL?: string
  /**
   * HTTPS endpoint that accepts a JSON `POST` for the contact form.
   * When unset the form degrades to a pre-filled `mailto:` handoff.
   * See `.env.example` for the full integration contract.
   */
  readonly VITE_CONTACT_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
