<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  glyph: { type: String, default: '✦' },
  selected: { type: Boolean, default: false },
})
defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    class="card"
    :class="{ 'is-selected': selected }"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <span class="sigil" aria-hidden="true">
      <span class="sigil-inner">{{ glyph }}</span>
    </span>

    <span class="text">
      <span class="title">{{ title }}</span>
      <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
    </span>

    <span class="mark" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  text-align: left;
  padding: 0.95rem 1.1rem;
  border: 1px solid rgba(168, 137, 79, 0.45);
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.12));
  color: var(--ink);
  cursor: pointer;
  position: relative;
  font-family: 'Spectral', Georgia, serif;
  transition: border-color 0.25s var(--ease), background 0.25s var(--ease),
    transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}

.card:hover {
  border-color: var(--gold-deep);
  transform: translateX(3px);
  box-shadow: -3px 0 0 0 var(--gold-deep);
}

.card.is-selected {
  background: linear-gradient(180deg, #1e2a50, #151d38);
  border-color: var(--gold);
  color: var(--parchment-2);
  box-shadow: 0 0 0 1px rgba(211, 188, 142, 0.35),
    0 10px 30px -14px rgba(0, 0, 0, 0.8);
  transform: none;
}

.sigil {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  transform: rotate(45deg);
  border: 1px solid var(--gold-deep);
  background: linear-gradient(160deg, #1c2648, #101830);
  display: grid;
  place-items: center;
  transition: box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
}

.card.is-selected .sigil {
  border-color: var(--gold-bright);
  box-shadow: 0 0 14px -2px rgba(246, 231, 189, 0.7);
}

.sigil-inner {
  transform: rotate(-45deg);
  font-size: 0.95rem;
  line-height: 1;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.title {
  font-family: 'Cormorant', Georgia, serif;
  font-size: 1.22rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.subtitle {
  font-size: 0.83rem;
  color: var(--ink-soft);
  line-height: 1.35;
}

.card.is-selected .subtitle {
  color: rgba(236, 227, 210, 0.72);
}

.mark {
  margin-left: auto;
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  transform: rotate(45deg) scale(0.4);
  border: 1px solid rgba(168, 137, 79, 0.5);
  opacity: 0.4;
  transition: all 0.3s var(--ease);
}

.card.is-selected .mark {
  background: var(--gold-bright);
  border-color: var(--gold-bright);
  opacity: 1;
  transform: rotate(45deg) scale(1);
  box-shadow: 0 0 12px rgba(246, 231, 189, 0.8);
}
</style>
