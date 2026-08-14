// Сверяет справочник внутри api/notify.js со списками фронтенда.
// Запуск: npm run check
import { CATALOG } from '../api/notify.js'
import {
  DINNERS,
  SOUPS,
  SOUP_DINNER_ID,
  DRINK_KINDS,
  DRINKS,
  DINNER_CUSTOM_LIMIT,
  DRINK_NOTE_LIMIT,
  dinnerLabel,
  soupLabel,
  drinkLabel,
  drinkKindLabel,
} from '../shared/options.js'

const problems = []

// Блюда, кроме супа: id и текст должны совпадать.
for (const item of DINNERS) {
  if (item.id === SOUP_DINNER_ID) continue
  const server = CATALOG.dinners[item.id]
  if (!server) problems.push(`api/notify.js не знает блюдо «${item.id}»`)
  else if (server !== dinnerLabel(item.id))
    problems.push(`расходится текст блюда «${item.id}»:\n    фронт:  ${dinnerLabel(item.id)}\n    сервер: ${server}`)
}
for (const id of Object.keys(CATALOG.dinners))
  if (!DINNERS.some((d) => d.id === id))
    problems.push(`лишнее блюдо в api/notify.js: «${id}»`)

if (CATALOG.soupDinnerId !== SOUP_DINNER_ID)
  problems.push('не совпадает id карточки супа')

// Супы.
for (const s of SOUPS) {
  if (CATALOG.soups[s.id] !== soupLabel(s.id))
    problems.push(`расходится суп «${s.id}»: фронт «${soupLabel(s.id)}», сервер «${CATALOG.soups[s.id]}»`)
}
for (const id of Object.keys(CATALOG.soups))
  if (!SOUPS.some((s) => s.id === id)) problems.push(`лишний суп в api/notify.js: «${id}»`)

// Напитки.
for (const kind of DRINK_KINDS) {
  if (CATALOG.drinkKinds[kind.id] !== drinkKindLabel(kind.id))
    problems.push(`расходится вид напитка «${kind.id}»`)
  for (const d of DRINKS[kind.id]) {
    const server = (CATALOG.drinks[kind.id] || {})[d.id]
    if (server !== drinkLabel(kind.id, d.id))
      problems.push(`расходится напиток «${d.id}»: фронт «${drinkLabel(kind.id, d.id)}», сервер «${server}»`)
  }
  for (const id of Object.keys(CATALOG.drinks[kind.id] || {}))
    if (!DRINKS[kind.id].some((d) => d.id === id))
      problems.push(`лишний напиток в api/notify.js: «${id}»`)
}

// Лимиты.
if (CATALOG.limits.dinnerCustom !== DINNER_CUSTOM_LIMIT)
  problems.push(`лимит своего варианта: фронт ${DINNER_CUSTOM_LIMIT}, сервер ${CATALOG.limits.dinnerCustom}`)
if (CATALOG.limits.drinkNote !== DRINK_NOTE_LIMIT)
  problems.push(`лимит уточнения: фронт ${DRINK_NOTE_LIMIT}, сервер ${CATALOG.limits.drinkNote}`)

if (problems.length) {
  console.error('Справочники расходятся:\n')
  for (const p of problems) console.error('  • ' + p)
  console.error('\nПоправь api/notify.js или shared/options.js.')
  process.exit(1)
}
console.log('Справочники совпадают: блюда, супы, напитки и лимиты.')
