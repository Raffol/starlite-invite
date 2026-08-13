<script setup>
defineProps({
  tone: { type: String, default: 'parchment' }, // parchment | night
})
</script>

<template>
  <section class="panel" :class="`tone-${tone}`">
    <svg class="corner tl" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M2 30 L2 8 Q2 2 8 2 L30 2" />
      <path d="M8 36 L8 14 Q8 8 14 8 L36 8" class="thin" />
      <path d="M13 2 L2 13" class="thin" />
    </svg>
    <svg class="corner tr" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M2 30 L2 8 Q2 2 8 2 L30 2" />
      <path d="M8 36 L8 14 Q8 8 14 8 L36 8" class="thin" />
      <path d="M13 2 L2 13" class="thin" />
    </svg>
    <svg class="corner br" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M2 30 L2 8 Q2 2 8 2 L30 2" />
      <path d="M8 36 L8 14 Q8 8 14 8 L36 8" class="thin" />
      <path d="M13 2 L2 13" class="thin" />
    </svg>
    <svg class="corner bl" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M2 30 L2 8 Q2 2 8 2 L30 2" />
      <path d="M8 36 L8 14 Q8 8 14 8 L36 8" class="thin" />
      <path d="M13 2 L2 13" class="thin" />
    </svg>

    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel {
  position: relative;
  border-radius: var(--radius);
  box-shadow: var(--shadow-panel);
  animation: rise 0.6s var(--ease) both;
}

.tone-parchment {
  background:
    radial-gradient(120% 90% at 50% 0%, #fbf6ea 0%, transparent 55%),
    linear-gradient(180deg, #f4ecdb 0%, #e9dfcb 100%);
  border: var(--frame) solid var(--gold-deep);
  color: var(--ink);
}

.tone-night {
  background:
    radial-gradient(130% 80% at 50% 0%, rgba(91, 154, 168, 0.16), transparent 60%),
    linear-gradient(180deg, rgba(24, 34, 66, 0.94), rgba(14, 20, 36, 0.96));
  border: var(--frame) solid rgba(211, 188, 142, 0.55);
  color: var(--parchment);
  backdrop-filter: blur(6px);
}

.tone-parchment::before {
  content: '';
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(168, 137, 79, 0.35);
  border-radius: 2px;
  pointer-events: none;
}

.panel-body {
  position: relative;
  padding: clamp(1.6rem, 5vw, 2.6rem) clamp(1.25rem, 5vw, 2.4rem);
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  fill: none;
  stroke: var(--gold-deep);
  stroke-width: 2.2;
  stroke-linecap: square;
  pointer-events: none;
  animation: inkIn 0.9s var(--ease) both;
}

.tone-night .corner {
  stroke: var(--gold);
}

.corner .thin {
  stroke-width: 1.1;
  opacity: 0.6;
}

.tl {
  top: -3px;
  left: -3px;
}
.tr {
  top: -3px;
  right: -3px;
  transform: scaleX(-1);
}
.br {
  bottom: -3px;
  right: -3px;
  transform: scale(-1);
}
.bl {
  bottom: -3px;
  left: -3px;
  transform: scaleY(-1);
}

.tr {
  animation-delay: 0.08s;
}
.br {
  animation-delay: 0.16s;
}
.bl {
  animation-delay: 0.24s;
}

@keyframes inkIn {
  from {
    opacity: 0;
    stroke-dasharray: 0 90;
  }
  to {
    opacity: 1;
    stroke-dasharray: 90 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
