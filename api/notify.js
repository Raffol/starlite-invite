// Справочник вариантов подключается внутри обработчика (см. loadOptions):
// при статическом импорте отсутствие файла в бандле роняет функцию целиком
// и Vercel отдаёт FUNCTION_INVOCATION_FAILED вместо внятного ответа.
async function loadOptions() {
  return import('../shared/options.js')
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

  const token = process.env.8984819124:AAGK6m_atI9HOUunw-G2sjjgAv3HYFN_0Mc
  const chatIds = (process.env.912419291 || '')
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

  let opts
  try {
    opts = await loadOptions()
  } catch (err) {
    console.error('Не удалось загрузить shared/options.js:', err)
    return res.status(500).json({
      ok: false,
      error: 'На сервере нет shared/options.js — проверь, что папка попала в деплой',
    })
  }
  const {
    DINNER_CUSTOM_LIMIT,
    SOUP_DINNER_ID,
    DRINK_NOTE_LIMIT,
    dinnerLabel,
    soupLabel,
    drinkLabel,
    drinkKindLabel,
    dayLabel,
  } = opts

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}

  // Клиент присылает только id — текст сообщения собирается здесь.
  const customDinner = trim(body.dinnerCustom, DINNER_CUSTOM_LIMIT)
  // Суп требует уточнения, иначе — известный вариант либо её собственный текст.
  const soup = soupLabel(body.soup)
  const dinner =
    body.dinner === SOUP_DINNER_ID
      ? soup && `Суп — ${soup.toLowerCase()}`
      : dinnerLabel(body.dinner) ||
        (customDinner.length >= 2 ? `${customDinner} (свой вариант)` : null)
  const kind = drinkKindLabel(body.drinkKind)
  const drink = drinkLabel(body.drinkKind, body.drink)
  const day = dayLabel(body.day) // необязательно: шага с датой в потоке нет

  if (!dinner || !kind || !drink) {
    return res.status(400).json({ ok: false, error: 'Выбор не распознан' })
  }

  const time = /^\d{2}:\d{2}$/.test(body.time || '') ? body.time : ''
  const when = [day, time].filter(Boolean).join(', ')
  // Уточнение имеет смысл только для алкоголя.
  const drinkNote =
    body.drinkKind === 'alcohol' ? trim(body.drinkNote, DRINK_NOTE_LIMIT) : ''

  const lines = [
    '✦ <b>Ответ на приглашение</b>',
    '',
    `🍽 <b>Ужин:</b> ${escapeHtml(dinner)}`,
    `🥂 <b>Напитки:</b> ${escapeHtml(drink)} (${escapeHtml(kind.toLowerCase())})`,
  ]
  if (drinkNote) lines.push(`🍾 <b>Уточнение:</b> ${escapeHtml(drinkNote)}`)
  if (when) lines.push(`🗓 <b>Когда:</b> ${escapeHtml(when)}`)
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
      return res
        .status(502)
        .json({ ok: false, error: 'Telegram не принял сообщение' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Ошибка отправки:', err)
    return res.status(500).json({ ok: false, error: 'Не получилось отправить' })
  }
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
