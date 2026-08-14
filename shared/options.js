// Единый список вариантов для фронтенда и для серверной функции.
// Клиент отправляет только id — текст для Telegram собирается на сервере,
// поэтому подделать содержимое сообщения нельзя.

export const DINNERS = [
  {
    id: 'sushi',
    title: 'Суши и роллы',
    subtitle: 'Свежее, с васаби и имбирём',
    glyph: '🍣',
  },
  {
    id: 'salad',
    title: 'Салат',
    subtitle: 'Легко, без тяжести к вечеру',
    glyph: '🥗',
  },
  {
    id: 'fish',
    title: 'Рыба',
    subtitle: 'Запечённая, с гарниром',
    glyph: '🐟',
  },
  {
    id: 'chicken',
    title: 'Курица',
    subtitle: 'Сытно и по-домашнему',
    glyph: '🍗',
  },
  {
    id: 'soup',
    title: 'Суп',
    subtitle: 'Горячее в начале вечера',
    glyph: '🍲',
  },
]

// У супа есть уточнение: выбрав карточку, нужно указать какой.
export const SOUP_DINNER_ID = 'soup'

// Без подписей: названия говорят за себя.
export const SOUPS = [
  { id: 'solyanka', title: 'Солянка', glyph: '🫒' },
  { id: 'rassolnik', title: 'Рассольник', glyph: '🥒' },
  { id: 'soup-fish', title: 'Рыбный', glyph: '🐟' },
  { id: 'soup-chicken', title: 'Куриный', glyph: '🍗' },
  { id: 'soup-plain', title: 'Обычный', glyph: '🥣' },
]

export const DRINK_KINDS = [
  {
    id: 'alcohol',
    title: 'С алкоголем',
    subtitle: 'Бокал под ужин',
    glyph: '🍷',
  },
  {
    id: 'soft',
    title: 'Без алкоголя',
    subtitle: 'Тоже празднично',
    glyph: '🍋',
  },
]

export const DRINKS = {
  alcohol: [
    { id: 'wine-red', title: 'Красное вино', subtitle: 'Сухое, к мясу и пасте', glyph: '🍇' },
    { id: 'wine-white', title: 'Белое вино', subtitle: 'Прохладное и лёгкое', glyph: '🥂' },
    { id: 'cocktails', title: 'Коктейли', subtitle: 'Что-нибудь с цитрусом', glyph: '🍸' },
    { id: 'cider', title: 'Сидр или крафт', subtitle: 'Без церемоний', glyph: '🍺' },
  ],
  soft: [
    { id: 'lemonade', title: 'Домашний лимонад', subtitle: 'Мята, лайм, лёд', glyph: '🍋' },
    { id: 'mocktail', title: 'Безалкогольный коктейль', subtitle: 'Вкус есть, утра ясные', glyph: '🍹' },
    { id: 'tea', title: 'Чай или матча', subtitle: 'Долгие разговоры', glyph: '🍵' },
    { id: 'coffee', title: 'Кофе или какао', subtitle: 'И десерт побольше', glyph: '☕' },
  ],
}

// Шага с датой в текущем потоке нет — список оставлен, если захочешь вернуть.
export const DAYS = [
  { id: 'friday', title: 'Пятница' },
  { id: 'saturday', title: 'Суббота' },
  { id: 'sunday', title: 'Воскресенье' },
  { id: 'any', title: 'Реши сам' },
]

export const DINNER_CUSTOM_LIMIT = 300
// Уточнение появляется только при выборе алкоголя.
export const DRINK_NOTE_LIMIT = 80

function find(list, id) {
  return list.find((item) => item.id === id) || null
}

export function dinnerLabel(id) {
  const d = find(DINNERS, id)
  return d ? `${d.title} — ${d.subtitle.toLowerCase()}` : null
}

export function soupLabel(id) {
  const s = find(SOUPS, id)
  return s ? s.title : null
}

export function drinkKindLabel(id) {
  const k = find(DRINK_KINDS, id)
  return k ? k.title : null
}

export function drinkLabel(kindId, id) {
  const list = DRINKS[kindId]
  if (!list) return null
  const d = find(list, id)
  return d ? d.title : null
}

export function dayLabel(id) {
  const d = find(DAYS, id)
  return d ? d.title : null
}