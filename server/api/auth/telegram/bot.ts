import TelegramBot from 'node-telegram-bot-api'
import { addAuthCode } from '~~/server/utils/telegramAuth'
import { getRedisClient } from '~~/server/utils/redis'

let bot: TelegramBot | null = null
let isPollingStarted = false

export const startTelegramBot = async () => {
  if (isPollingStarted) {
    console.log('🤖 Bot polling already started')
    return
  }

  const config = useRuntimeConfig()
  const token = config.telegramBotToken
  
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env')
    return
  }

  try {
    await getRedisClient()
  } catch (error) {
    console.error('❌ Redis is not available, bot will not start:', error)
    return
  }
  
  try {
    bot = new TelegramBot(token, { 
      polling: true
    })
    
    // Обработка команды /start с кодом
    bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id
      const user = msg.from
      const code = match?.[1] || ''
      
      console.log('🔑 Auth code received:', code)
      console.log('👤 User:', user?.id, user?.first_name)
      
      if (!user) {
        bot?.sendMessage(chatId, '❌ Ошибка: не удалось определить пользователя')
        return
      }
      
      // Проверяем формат кода (UUID или наш формат)
      const codePattern = /^[a-f0-9-]{8,}$/i
      if (!codePattern.test(code)) {
        bot?.sendMessage(chatId, '❌ Неверный код авторизации')
        return
      }
      
      try {
        // Сохраняем код в Redis
        await addAuthCode(code, user.id.toString(), {
          first_name: user.first_name,
          last_name: user.last_name || '',
          username: user.username || '',
          photo_url: user.photo_url || ''
        })
        
        const siteUrl = config.public?.siteUrl || 'https://your-domain.com'
        
        bot?.sendMessage(chatId, 
          '✅ Успешная авторизация!\n\n' +
          'Вернитесь на сайт, авторизация произойдет автоматически.',
          {
            reply_markup: {
              inline_keyboard: [[{
                text: '🚀 Перейти на сайт',
                url: `${siteUrl}?auth=success`
              }]]
            }
          }
        )
      } catch (error) {
        console.error('❌ Error saving auth code:', error)
        bot?.sendMessage(chatId, '❌ Ошибка авторизации. Попробуйте позже.')
      }
    })
    
    // Обработка обычного /start без кода
    bot.onText(/\/start$/, (msg) => {
      const chatId = msg.chat.id
      bot?.sendMessage(chatId, 
        '👋 Привет!\n\n' +
        'Для авторизации на сайте:\n' +
        '1. Нажмите "Войти" на сайте\n' +
        '2. Нажмите кнопку "Войти через Telegram"\n' +
        '3. Вернитесь на сайт — авторизация произойдет автоматически'
      )
    })
    
    // Обработка ошибок polling
    bot.on('polling_error', (error) => {
      console.error('⚠️ Polling error:', error)
    })
    
    isPollingStarted = true
    console.log('🤖 Telegram bot started with long polling (Redis ready)')
    
  } catch (error) {
    console.error('❌ Failed to start Telegram bot:', error)
  }
}

export const stopTelegramBot = () => {
  if (bot) {
    bot.stopPolling()
    bot = null
    isPollingStarted = false
    console.log('🛑 Telegram bot stopped')
  }
}