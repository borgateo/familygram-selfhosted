import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    env: {
      DATABASE_URL: 'postgresql://familygram:test@127.0.0.1:5432/familygram',
      APP_URL: 'http://127.0.0.1:3000',
      S3_ENDPOINT: 'http://127.0.0.1:9000',
      S3_PUBLIC_ENDPOINT: 'http://127.0.0.1:9000',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY: 'test',
      S3_SECRET_KEY: 'test',
      S3_BUCKET: 'familygram',
    },
  },
  resolve: {
    alias: { '@': import.meta.dirname },
  },
})
