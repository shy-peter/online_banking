/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_MESSAGES_COLLECTION_ID: string
  readonly VITE_APPWRITE_USERS_COLLECTION_ID: string
  readonly VITE_APPWRITE_INVESTMENTS_COLLECTION_ID: string
  readonly VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID: string
  readonly VITE_APPWRITE_INTEREST_PAYMENTS_COLLECTION_ID: string
  readonly VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID: string
  readonly VITE_APPWRITE_PAYMENT_METHODS_COLLECTION_ID: string
  readonly VITE_APPWRITE_BONUS_CODES_COLLECTION_ID: string
  readonly VITE_APPWRITE_TRANSFERS_COLLECTION_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}