// Функция намеренно не импортирует ничего из проекта: любые файлы вне папки
// api/ могут не попасть в бандл на Vercel, и тогда функция падает целиком
// (FUNCTION_INVOCATION_FAILED). Поэтому справочник для сообщения лежит здесь.
//
// Списки должны совпадать с shared/options.js, откуда их берёт фронтенд.
// Проверка расхождений: npm run check
export const CATALOG = {
  dinners: {
    sushi: 'Суши и роллы — свежее, с васаби и имбирём',
    salad: 'Салат — легко, без тяжести к вечеру',
    fish: 'Рыба — запечённая, с гарниром',
    chicken: 'Курица — сытно и по-домашнему',
  },
  soupDinnerId: 'soup',
  soups: {
    solyanka: 'Солянка',
    rassolnik: 'Рассольник',
    'soup-fish': 'Рыбный',
    'soup-chicken': 'Куриный',
    'soup-plain': 'Обычный',
  },
  drinkKinds: {
    alcohol: 'С алкоголем',
    soft: 'Без алкоголя',
  },
  drinks: {
    alcohol: {
      'wine-red': 'Красное вино',
      'wine-white': 'Белое вино',
      cocktails: 'Коктейли',
      cider: 'Сидр или крафт',
    },
    soft: {
      lemonade: 'Домашний лимонад',
      mocktail: 'Безалкогольный коктейль',
      tea: 'Чай или матча',
      coffee: 'Кофе или какао',
    },
  },
  limits: {
    dinnerCustom: 300,
    drinkNote: 80,
  },
}

// Простейшая защита от «шаловливых рук»: не больше 5 отправок с одного IP
// за 10 минут в пределах одного тёплого инстанса функции.
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT = 5
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > RATE_LIMIT
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function trim(value, limit) {
  return String(value || '')
    .slice(0, limit)
    .trim()
}

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function stamp() {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: process.env.TIMEZONE || 'Europe/Berlin',
  }).format(new Date())
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Нужен POST-запрос' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (!token || chatIds.length === 0) {
    // Называем конкретную переменную: так видно, что именно не доехало до Vercel.
    const missing = [
      !token && 'TELEGRAM_BOT_TOKEN',
      chatIds.length === 0 && 'TELEGRAM_CHAT_ID',
    ]
      .filter(Boolean)
      .join(' и ')
    console.error(`Не заданы переменные окружения: ${missing}`)
    return res.status(500).json({
      ok: false,
      error: `На сервере не задано: ${missing} (добавь в Vercel и нажми Redeploy)`,
    })
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    return res
      .status(429)
      .json({ ok: false, error: 'Слишком много отправок, подожди немного' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}

  // Клиент присылает id вариантов — текст сообщения собирается здесь,
  // поэтому подменить содержимое нельзя.
  const customDinner = trim(body.dinnerCustom, CATALOG.limits.dinnerCustom)
  const soup = CATALOG.soups[body.soup] || null
  // Суп требует уточнения; иначе — известное блюдо либо её собственный текст.
  const dinner =
    body.dinner === CATALOG.soupDinnerId
      ? soup && `Суп — ${soup.toLowerCase()}`
      : CATALOG.dinners[body.dinner] ||
        (customDinner.length >= 2 ? `${customDinner} (свой вариант)` : null)

  const kind = CATALOG.drinkKinds[body.drinkKind] || null
  const drink = (CATALOG.drinks[body.drinkKind] || {})[body.drink] || null

  if (!dinner || !kind || !drink) {
    return res.status(400).json({ ok: false, error: 'Выбор не распознан' })
  }

  // Уточнение имеет смысл только для алкоголя.
  const drinkNote =
    body.drinkKind === 'alcohol'
      ? trim(body.drinkNote, CATALOG.limits.drinkNote)
      : ''

  const lines = [
    '✦ <b>Ответ на приглашение</b>',
    '',
    `🍽 <b>Ужин:</b> ${escapeHtml(dinner)}`,
    `🥂 <b>Напитки:</b> ${escapeHtml(drink)} (${escapeHtml(kind.toLowerCase())})`,
  ]
  if (drinkNote) lines.push(`🍾 <b>Уточнение:</b> ${escapeHtml(drinkNote)}`)
  lines.push('', `<i>${escapeHtml(stamp())}</i>`)

  const text = lines.join('\n')

  try {
    const results = await Promise.all(
      chatIds.map((chat_id) =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        }).then((r) => r.json()),
      ),
    )

    const failed = results.find((r) => !r.ok)
    if (failed) {
      console.error('Telegram отказал:', failed)
      return res.status(502).json({
        ok: false,
        error: `Telegram не принял сообщение: ${failed.description || 'причина неизвестна'}`,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Ошибка отправки:', err)
    return res.status(500).json({ ok: false, error: 'Не получилось отправить' })
  }
}
