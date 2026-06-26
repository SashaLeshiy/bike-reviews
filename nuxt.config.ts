export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
    cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    public: {
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  future: {
    compatibilityVersion: 4
  }
})