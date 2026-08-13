<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref(null)
let ctx, raf, stars = [], motes = [], comet = null, w = 0, h = 0, dpr = 1
let reduced = false

function resize() {
  const el = canvas.value
  if (!el) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = el.clientWidth
  h = el.clientHeight
  el.width = Math.floor(w * dpr)
  el.height = Math.floor(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  seed()
}

function seed() {
  const area = w * h
  const count = Math.round(Math.min(220, area / 6800))
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.3 + 0.3,
    a: Math.random() * 0.6 + 0.25,
    tw: Math.random() * 0.02 + 0.004,
    ph: Math.random() * Math.PI * 2,
  }))
  motes = Array.from({ length: Math.round(count / 8) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.8,
    vy: -(Math.random() * 0.12 + 0.03),
    vx: (Math.random() - 0.5) * 0.06,
    a: Math.random() * 0.35 + 0.15,
  }))
}

function spawnComet() {
  comet = {
    x: Math.random() * w * 0.8,
    y: -20,
    len: Math.random() * 90 + 70,
    sp: Math.random() * 5 + 5,
    life: 1,
  }
}

function draw(t) {
  ctx.clearRect(0, 0, w, h)

  for (const s of stars) {
    const a = reduced ? s.a : s.a + Math.sin(t * s.tw + s.ph) * 0.22
    ctx.globalAlpha = Math.max(0.05, Math.min(1, a))
    ctx.fillStyle = '#f6e7bd'
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const m of motes) {
    if (!reduced) {
      m.y += m.vy
      m.x += m.vx
      if (m.y < -5) {
        m.y = h + 5
        m.x = Math.random() * w
      }
    }
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5)
    g.addColorStop(0, `rgba(246, 231, 189, ${m.a})`)
    g.addColorStop(1, 'rgba(246, 231, 189, 0)')
    ctx.globalAlpha = 1
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.r * 5, 0, Math.PI * 2)
    ctx.fill()
  }

  if (!reduced) {
    if (!comet && Math.random() < 0.0016) spawnComet()
    if (comet) {
      comet.x += comet.sp
      comet.y += comet.sp * 0.85
      comet.life -= 0.006
      const g = ctx.createLinearGradient(
        comet.x,
        comet.y,
        comet.x - comet.len,
        comet.y - comet.len * 0.85,
      )
      g.addColorStop(0, `rgba(255, 248, 225, ${Math.max(0, comet.life)})`)
      g.addColorStop(1, 'rgba(255, 248, 225, 0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(comet.x, comet.y)
      ctx.lineTo(comet.x - comet.len, comet.y - comet.len * 0.85)
      ctx.stroke()
      if (comet.life <= 0 || comet.y > h + 120) comet = null
    }
  }

  ctx.globalAlpha = 1
  raf = requestAnimationFrame(draw)
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ctx = canvas.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div class="sky" aria-hidden="true">
    <canvas ref="canvas" class="sky-canvas"></canvas>
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>
  </div>
</template>

<style scoped>
.sky {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(1100px 700px at 78% -8%, #2b3a6b 0%, transparent 62%),
    radial-gradient(900px 620px at 12% 108%, #1d2b52 0%, transparent 60%),
    linear-gradient(180deg, #0b1120 0%, #0e1424 46%, #0a1020 100%);
}

.sky-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  animation: breathe 14s ease-in-out infinite;
}

.glow-a {
  width: 46vmin;
  height: 46vmin;
  top: -10vmin;
  right: -8vmin;
  background: radial-gradient(circle, rgba(120, 160, 210, 0.5), transparent 70%);
}

.glow-b {
  width: 40vmin;
  height: 40vmin;
  bottom: -12vmin;
  left: -10vmin;
  background: radial-gradient(circle, rgba(211, 188, 142, 0.28), transparent 70%);
  animation-delay: -6s;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.28;
    transform: scale(1);
  }
  50% {
    opacity: 0.46;
    transform: scale(1.08);
  }
}
</style>
