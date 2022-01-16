const { Telegraf } = require('telegraf')
const rateLimit = require('telegraf-ratelimit')
const axios = require('axios')

const bot = new Telegraf(process.env.TOKEN)

const limitConfig = {
  window: 10000,
  limit: 1,
  onLimitExceeded: (ctx, next) => ctx.replyWithHTML('<b>Ошибка ☹️</b>\nЯ не могу так часто с тобой работать.\nПиши не так быстро.')
}


bot.start( ctx => {
  ctx.replyWithHTML(`<b>👋 Привет, ${ctx.from.first_name}!</b>\n\nЯ могу исккать релизы по <b>UPC и ISRC</b>, благодаря <a href='https://muscode.co'>MusCodeApi</a>\n\n<b>Комманды:</b>\n/upc {upc} - поиск по UPC\n/isrc {isrc} - поиск по ISRC\n\nРазработчик - @kirillsaint | kirillsaint.xyz`)
})

const UpcSearch = async (ctx) => {
  console.log(ctx.message.text)
  if(ctx.message.text === "/upc") {
    ctx.replyWithHTML('<b>Неправильное использование комманды!</b>\n\nПример: <code>/upc 886449675692</code>')
  } else {
    var upc = ctx.message.text.replace('/upc ', '')
    ctx.replyWithHTML(`<b>Начинаю поиск по UPC:</b> <code>${upc}</code>`).then((m) => {
      const response = axios.get(`https://muscode.co/api/getUpc?upc=${upc}`).then(function (response) {
        try {
          ctx.replyWithPhoto(response.data.cover)
        } catch {
          console.log('error')
        }
        try {
          if(response.data.error) {
            ctx.replyWithHTML('<b>Ничего не найдено!</b>')
          } else {
            ctx.replyWithHTML(`<b>${response.data.artist} - ${response.data.title}</b>\n\n<b>Альбом:</b> ${response.data.album_name}\n<b>Длительность:</b> ${response.data.duration}\n<b>ISRC:</b> ${response.data.isrc}\n<b>Лейбл:</b> ${response.data.label}\n<b>Дата релиза:</b> ${response.data.release_date}\n\n<b>Ссылка на все площадки:</b> ${response.data.link}`)
          }
        } catch {
          ctx.replyWithHTML(`<b>${response.data.artist} - ${response.data.title}</b>\n\n<b>Альбом:</b> ${response.data.album_name}\n<b>Длительность:</b> ${response.data.duration}\n<b>ISRC:</b> ${response.data.isrc}\n<b>Лейбл:</b> ${response.data.label}\n<b>Дата релиза:</b> ${response.data.release_date}\n\n<b>Ссылка на все площадки:</b> ${response.data.link}`)
        }
        bot.telegram.deleteMessage(ctx.chat.id, m.message_id)
      })
    })
  }
}
const IsrcSearch = async (ctx) => {
  if(ctx.message.text == "/isrc") {
    ctx.replyWithHTML('<b>Неправильное использование комманды!</b>\n\nПример: <code>/isrc RUA012101050</code>')
  } else {
    var isrc = ctx.message.text.replace('/isrc ', '')
    ctx.replyWithHTML(`<b>Начинаю поиск по ISRC:</b> <code>${isrc}</code>`).then((m) => {
      const response = axios.get(`https://muscode.co/api/getIsrc?isrc=${isrc}`).then(function (response) {
        try {
          ctx.replyWithPhoto(response.data.cover)
        } catch {
          console.log('error')
        }
        try {
          if(response.data.error) {
            ctx.replyWithHTML('<b>Ничего не найдено!</b>')
          } else {
            ctx.replyWithHTML(`<b>${response.data.artist} - ${response.data.title}</b>\n\n<b>Альбом:</b> ${response.data.album_name}\n<b>Длительность:</b> ${response.data.duration}\n<b>UPC:</b> ${response.data.upc}\n<b>Лейбл:</b> ${response.data.label}\n<b>Дата релиза:</b> ${response.data.release_date}\n\n<b>Ссылка на все площадки:</b> ${response.data.link}`)
          }
        } catch {
          ctx.replyWithHTML(`<b>${response.data.artist} - ${response.data.title}</b>\n\n<b>Альбом:</b> ${response.data.album_name}\n<b>Длительность:</b> ${response.data.duration}\n<b>UPC:</b> ${response.data.upc}\n<b>Лейбл:</b> ${response.data.label}\n<b>Дата релиза:</b> ${response.data.release_date}\n\n<b>Ссылка на все площадки:</b> ${response.data.link}`)
        }
        bot.telegram.deleteMessage(ctx.chat.id, m.message_id)
      })
    })
  }
}

bot.command('upc', rateLimit(limitConfig), UpcSearch)
bot.command('isrc', rateLimit(limitConfig), IsrcSearch)

if(process.env.TOKEN) {
  bot.launch().then(() => {
    console.log('bot start polling')
  })
} else {
  console.log("Token in .env not found.")
}
