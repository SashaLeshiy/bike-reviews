import { startTelegramBot } from '~~/server/api/auth/telegram/bot'

export default defineNitroPlugin(async () => {
  if (process.env.DISABLE_TELEGRAM_BOT !== 'true') {
    await startTelegramBot()
  }
})