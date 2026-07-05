import { startTelegramBot } from '~~/server/api/auth/telegram/bot'

export default defineNitroPlugin(() => {
  // Запускаем бота только если он не отключен через переменную окружения
  if (process.env.DISABLE_TELEGRAM_BOT !== 'true') {
    startTelegramBot()
  }
})