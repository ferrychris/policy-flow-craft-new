/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_STRIPE_WEBHOOK_SECRET: string
  readonly VITE_STRIPE_FOUNDATIONAL_PRICE_ID: string
  readonly VITE_STRIPE_OPERATIONAL_PRICE_ID: string
  readonly VITE_STRIPE_STRATEGIC_PRICE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
