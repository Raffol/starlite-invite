<script setup>
import { computed, ref, watch } from 'vue'
import StarSky from './components/StarSky.vue'
import OrnatePanel from './components/OrnatePanel.vue'
import ChoiceCard from './components/ChoiceCard.vue'
import WishBurst from './components/WishBurst.vue'
import {
  DINNERS,
  SOUPS,
  SOUP_DINNER_ID,
  DRINK_KINDS,
  DRINKS,
  DINNER_CUSTOM_LIMIT,
  DRINK_CUSTOM_LIMIT,
  DATE_LABEL,
  TIME_LABEL,
  dinnerLabel,
  soupLabel,
  drinkLabel,
  drinkKindLabel,
} from '../shared/options.js'

const STEPS = ['intro', 'dinner', 'drinks', 'review', 'sent']
const TOTAL_STEPS = 2

const step = ref(0)

const dinner = ref('')
const soup = ref('')
const dinnerCustom = ref('')
const drinkKind = ref('')
const drink = ref('')
const drinkCustom = ref('')

const sending = ref(false)
const error = ref('')

const drinkOptions = computed(() => (drinkKind.value ? DRINKS[drinkKind.value] : []))

watch(drinkKind, () => {
  drink.value = ''
  drinkCustom.value = ''
})

// Тот же принцип, что у ужина: карточка либо своё поле, но не оба сразу.
function pickDrink(id) {
  drink.value = id
  drinkCustom.value = ''
}

watch(drinkCustom, (value) => {
  if (value.trim()) drink.value = ''
})

const customDrink = computed(() => drinkCustom.value.trim())

const drinkPlaceholder = computed(() =>
    drinkKind.value === 'alcohol'
        ? 'Например: апероль шприц или что-то местное'
        : 'Например: морс, кола или свежий сок',
)

// Карточка и своё поле исключают друг друга: ответ всегда один.
function pickDinner(id) {
  dinner.value = id
  dinnerCustom.value = ''
}

// Суп без уточнения не считается выбранным.
const needsSoup = computed(() => dinner.value === SOUP_DINNER_ID)

watch(dinner, (id) => {
  if (id !== SOUP_DINNER_ID) soup.value = ''
})

watch(dinnerCustom, (value) => {
  if (value.trim()) dinner.value = ''
})

const customDinner = computed(() => dinnerCustom.value.trim())

const canContinue = computed(() => {
  if (STEPS[step.value] === 'dinner') {
    if (needsSoup.value) return !!soup.value
    return !!dinner.value || customDinner.value.length >= 2
  }
  if (STEPS[step.value] === 'drinks')
    return (
        !!drinkKind.value && (!!drink.value || customDrink.value.length >= 2)
    )
  return true
})

const summary = computed(() => [
  {
    label: 'Ужин',
    value: needsSoup.value
        ? `Суп — ${(soupLabel(soup.value) || '').toLowerCase()}`
        : dinner.value
            ? dinnerLabel(dinner.value)
            : `${customDinner.value} — свой вариант`,
  },
  {
    label: 'Напитки',
    value: [
      drink.value
          ? drinkLabel(drinkKind.value, drink.value)
          : `${customDrink.value} — свой вариант`,
      drinkKindLabel(drinkKind.value),
    ]
        .filter(Boolean)
        .join(' · '),
  },
])

function next() {
  if (!canContinue.value) return
  step.value = Math.min(step.value + 1, STEPS.length - 1)
}

function back() {
  error.value = ''
  step.value = Math.max(step.value - 1, 0)
}

async function send() {
  sending.value = true
  error.value = ''
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dinner: dinner.value,
        soup: soup.value,
        dinnerCustom: customDinner.value,
        drinkKind: drinkKind.value,
        drink: drink.value,
        drinkCustom: customDrink.value,
      }),
    })
    const isJson = (res.headers.get('content-type') || '').includes('json')
    if (!isJson) {
      // Не JSON — значит запрос до серверной функции не дошёл.
      const local = ['localhost', '127.0.0.1'].includes(location.hostname)
      throw new Error(
          local
              ? 'Локально функции нет: в npm run dev её не поднимают — запусти vercel dev'
              : `Сервер ответил не JSON (код ${res.status}) — папка api/ не попала в деплой`,
      )
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Сервер не принял ответ')
    }
    step.value = STEPS.indexOf('sent')
  } catch (e) {
    error.value =
        e.message === 'Failed to fetch'
            ? 'Нет связи с сервером. Проверь интернет и нажми ещё раз.'
            : `${e.message}. Попробуй ещё раз.`
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <StarSky />

  <main class="stage">
    <div class="frame">
      <!-- Прогресс: два шага-вопроса -->
      <div
          v-if="step > 0 && STEPS[step] !== 'sent'"
          class="progress"
          aria-hidden="true"
      >
        <span class="progress-line"></span>
        <span
            v-for="i in TOTAL_STEPS"
            :key="i"
            class="pip"
            :class="{ done: i < step, now: i === step }"
        ></span>
      </div>

      <Transition name="step" mode="out-in">
        <!-- 0. Титул -->
        <OrnatePanel v-if="STEPS[step] === 'intro'" key="intro" class="panel-wrap">
          <p class="eyebrow center">Личное приглашение</p>
          <div class="crest" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <path
                  d="M50 6 C54 33 67 46 94 50 C67 54 54 67 50 94 C46 67 33 54 6 50 C33 46 46 33 50 6 Z"
              />
            </svg>
          </div>
          <h1 class="display title-xl center">Ужин под звёздами</h1>
          <p class="lede center">
            Вечер уже задуман. Осталось два вопроса — ужин и напитки, —
            остальное я беру на себя.
          </p>
          <div class="actions center-actions">
            <button class="btn" @click="next">Открыть приглашение</button>
          </div>
        </OrnatePanel>

        <!-- 1. Ужин -->
        <OrnatePanel v-else-if="STEPS[step] === 'dinner'" key="dinner" class="panel-wrap">
          <p class="eyebrow">Шаг 1 из 2 · Ужин</p>
          <h2 class="display title-md">Что бы ты хотела на ужин?</h2>
          <p class="hint">Выбери из идей ниже <em>или</em> напиши своими словами — что-то одно.</p>
          <div class="list" :class="{ 'is-muted': customDinner.length > 0 }">
            <ChoiceCard
                v-for="opt in DINNERS"
                :key="opt.id"
                :title="opt.title"
                :subtitle="opt.subtitle"
                :glyph="opt.glyph"
                :selected="dinner === opt.id"
                @select="pickDinner(opt.id)"
            />
          </div>

          <Transition name="step">
            <div v-if="needsSoup" class="sub">
              <p class="eyebrow sub-label">Какой суп?</p>
              <div class="list">
                <ChoiceCard
                    v-for="opt in SOUPS"
                    :key="opt.id"
                    :title="opt.title"
                    :subtitle="opt.subtitle"
                    :glyph="opt.glyph"
                    :selected="soup === opt.id"
                    @select="soup = opt.id"
                />
              </div>
            </div>
          </Transition>

          <div class="sub" :class="{ 'is-muted': !!dinner }">
            <label class="field">
              <span class="eyebrow">Или напиши, чего хочется (по желанию)</span>
              <textarea
                  v-model="dinnerCustom"
                  class="input textarea"
                  :maxlength="DINNER_CUSTOM_LIMIT"
                  rows="3"
                  placeholder="Например: том-ям, стейк или что-нибудь сладкое"
              ></textarea>
              <span class="counter">{{ dinnerCustom.length }} / {{ DINNER_CUSTOM_LIMIT }}</span>
            </label>
          </div>

          <div class="actions">
            <button class="btn btn-ghost" @click="back">Назад</button>
            <button class="btn" :disabled="!canContinue" @click="next">Дальше</button>
          </div>
        </OrnatePanel>

        <!-- 2. Напитки -->
        <OrnatePanel v-else-if="STEPS[step] === 'drinks'" key="drinks" class="panel-wrap">
          <p class="eyebrow">Шаг 2 из 2 · Напитки</p>
          <h2 class="display title-md">Что будем пить?</h2>
          <p class="hint">Сначала вид, потом карточка <em>или</em> своё поле.</p>
          <div class="list two">
            <ChoiceCard
                v-for="opt in DRINK_KINDS"
                :key="opt.id"
                :title="opt.title"
                :subtitle="opt.subtitle"
                :glyph="opt.glyph"
                :selected="drinkKind === opt.id"
                @select="drinkKind = opt.id"
            />
          </div>

          <Transition name="step">
            <div v-if="drinkKind" class="sub">
              <p class="eyebrow sub-label">Уточним</p>
              <div class="list" :class="{ 'is-muted': customDrink.length > 0 }">
                <ChoiceCard
                    v-for="opt in drinkOptions"
                    :key="opt.id"
                    :title="opt.title"
                    :subtitle="opt.subtitle"
                    :glyph="opt.glyph"
                    :selected="drink === opt.id"
                    @select="pickDrink(opt.id)"
                />
              </div>

              <label
                  class="field field-tight"
                  :class="{ 'is-muted': !!drink }"
              >
                <span class="eyebrow">Или напиши, что налить (по желанию)</span>
                <input
                    v-model="drinkCustom"
                    type="text"
                    class="input"
                    :maxlength="DRINK_CUSTOM_LIMIT"
                    :placeholder="drinkPlaceholder"
                />
                <span class="counter">
                  {{ drinkCustom.length }} / {{ DRINK_CUSTOM_LIMIT }}
                </span>
              </label>
            </div>
          </Transition>

          <div class="actions">
            <button class="btn btn-ghost" @click="back">Назад</button>
            <button class="btn" :disabled="!canContinue" @click="next">Дальше</button>
          </div>
        </OrnatePanel>

        <!-- 3. Проверка -->
        <OrnatePanel v-else-if="STEPS[step] === 'review'" key="review" class="panel-wrap">
          <p class="eyebrow">Проверка</p>
          <h2 class="display title-md">Всё верно?</h2>

          <dl class="summary">
            <div v-for="row in summary" :key="row.label" class="summary-row">
              <dt class="eyebrow">{{ row.label }}</dt>
              <dd class="summary-value">{{ row.value }}</dd>
            </div>
          </dl>

          <p v-if="error" class="error" role="alert">{{ error }}</p>

          <div class="actions">
            <button class="btn btn-ghost" :disabled="sending" @click="back">Изменить</button>
            <button class="btn" :disabled="sending" @click="send">
              {{ sending ? 'Отправляю…' : 'Отправить ответ' }}
            </button>
          </div>
        </OrnatePanel>

        <!-- 4. Готово -->
        <OrnatePanel v-else key="sent" tone="night" class="panel-wrap">
          <WishBurst />
          <h2 class="display title-md center">Ответ отправлен</h2>
          <p class="lede center on-night">
            Уведомление уже у меня. Место и столик — моя забота.
          </p>
          <div class="when on-night">
            <p class="eyebrow">Когда</p>
            <p class="when-value">{{ DATE_LABEL }}, будь готова к {{ TIME_LABEL }}</p>
          </div>
          <p class="signoff center">До встречи ✦</p>
        </OrnatePanel>
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.stage {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 2.5rem) 1rem calc(1.5rem + env(safe-area-inset-bottom));
}

.frame {
  width: 100%;
  max-width: 33rem;
}

/* Прогресс */
.progress {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 1.4rem;
  margin-bottom: 1.1rem;
}

.progress-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8rem;
  height: 1px;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(211, 188, 142, 0.35),
      transparent
  );
}

.pip {
  position: relative;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  border: 1px solid rgba(211, 188, 142, 0.55);
  background: var(--night);
  transition: all 0.35s var(--ease);
}

.pip.done {
  background: rgba(211, 188, 142, 0.6);
}

.pip.now {
  background: var(--gold-bright);
  border-color: var(--gold-bright);
  box-shadow: 0 0 12px rgba(246, 231, 189, 0.8);
  transform: rotate(45deg) scale(1.35);
}

/* Панель */
.panel-wrap {
  width: 100%;
}

.center {
  text-align: center;
}

.title-xl {
  font-size: clamp(2.4rem, 10vw, 3.4rem);
  margin: 0.5rem 0 0.9rem;
}

.title-md {
  font-size: clamp(1.7rem, 6.5vw, 2.15rem);
  margin: 0.35rem 0 0.4rem;
}

.crest {
  display: grid;
  place-items: center;
  margin: 1.4rem 0 0.2rem;
}

.crest svg {
  width: 46px;
  height: 46px;
  fill: var(--gold-deep);
  animation: spinIn 1.2s var(--ease) both;
}

@keyframes spinIn {
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.lede {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ink-soft);
  margin: 0 auto;
  max-width: 26rem;
}

.lede.on-night {
  color: rgba(236, 227, 210, 0.78);
}

.hint {
  font-size: 0.9rem;
  color: var(--ink-soft);
  margin: 0 0 1.1rem;
}

.signoff {
  font-family: 'Cormorant', Georgia, serif;
  font-size: 1.2rem;
  color: var(--gold);
  margin: 1.6rem 0 0.2rem;
  letter-spacing: 0.04em;
}

/* Списки выбора */
.list {
  display: grid;
  gap: 0.6rem;
}

.list.two {
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 26rem) {
  .list.two {
    grid-template-columns: 1fr;
  }
}

.sub {
  margin-top: 1.4rem;
  padding-top: 1.1rem;
  border-top: 1px solid rgba(168, 137, 79, 0.3);
}

.sub-label {
  margin: 0 0 0.7rem;
}

/* Неактивная половина выбора: видно, что сработает что-то одно */
.is-muted {
  opacity: 0.45;
  transition: opacity 0.3s var(--ease);
}

.is-muted:hover,
.is-muted:focus-within {
  opacity: 1;
}

/* Дата вечера на титуле */
.when {
  margin: 1.6rem auto 0;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(168, 137, 79, 0.3);
  max-width: 22rem;
  text-align: center;
}

.when-value {
  font-family: 'Cormorant', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0.35rem 0 0;
  color: var(--ink);
}

.when.on-night {
  border-top-color: rgba(211, 188, 142, 0.4);
}

.when.on-night .eyebrow {
  color: var(--gold);
}

.when.on-night .when-value {
  color: var(--parchment-2);
}

.hint em {
  font-style: normal;
  color: var(--gold-deep);
  font-weight: 600;
}

/* Поля */
.field-tight {
  margin-top: 1.2rem;
}

.field {
  display: block;
  position: relative;
  margin-bottom: 0.6rem;
}

.field .eyebrow {
  display: block;
  margin-bottom: 0.45rem;
}

.input {
  width: 100%;
  font-family: 'Spectral', Georgia, serif;
  font-size: 1rem;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(168, 137, 79, 0.5);
  border-radius: 3px;
  padding: 0.65rem 0.8rem;
  transition: border-color 0.25s var(--ease), box-shadow 0.25s var(--ease);
}

.input:focus {
  outline: none;
  border-color: var(--gold-deep);
  box-shadow: 0 0 0 3px rgba(211, 188, 142, 0.28);
}

.textarea {
  resize: vertical;
  line-height: 1.5;
}

.counter {
  display: block;
  text-align: right;
  font-size: 0.7rem;
  color: var(--ink-soft);
  opacity: 0.75;
}

/* Итог */
.summary {
  margin: 1.2rem 0 0.4rem;
  padding: 0;
}

.summary-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(168, 137, 79, 0.28);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-value {
  font-family: 'Cormorant', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.15rem 0 0;
  line-height: 1.35;
}

.error {
  margin: 1rem 0 0;
  padding: 0.7rem 0.9rem;
  border-left: 2px solid #a8503f;
  background: rgba(168, 80, 63, 0.09);
  font-size: 0.88rem;
  color: #7d3a2c;
}

/* Кнопки */
.actions {
  display: flex;
  gap: 0.7rem;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.8rem;
}

.actions.center-actions {
  justify-content: center;
  margin-top: 2rem;
}

.actions .btn:not(.btn-ghost) {
  flex: 1;
}

.actions.center-actions .btn {
  flex: 0 0 auto;
}
</style>
