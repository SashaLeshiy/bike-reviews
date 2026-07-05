import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    redisPassword: process.env.REDIS_PASSWORD || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
    // cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    public: {
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  css: [
    '~/assets/css/main.css',
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css'
  ],

  build: {
    transpile: ['vuetify']
  },

  vite: {
    plugins: [
      vuetify({ autoImport: true })
    ],
    vue: {
      template: {
        transformAssetUrls
      }
    }
  },

  future: {
    compatibilityVersion: 4
  }
})