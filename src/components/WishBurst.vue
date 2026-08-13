<template>
  <div class="burst" aria-hidden="true">
    <span class="flash"></span>
    <span class="ring r1"></span>
    <span class="ring r2"></span>
    <span v-for="i in 12" :key="i" class="ray" :style="rayStyle(i)"></span>
    <svg class="star" viewBox="0 0 100 100">
      <path
        d="M50 4 C54 32 68 46 96 50 C68 54 54 68 50 96 C46 68 32 54 4 50 C32 46 46 32 50 4 Z"
      />
    </svg>
  </div>
</template>

<script setup>
function rayStyle(i) {
  return {
    transform: `rotate(${i * 30}deg)`,
    animationDelay: `${i * 0.045}s`,
  }
}
</script>

<style scoped>
.burst {
  position: relative;
  width: 168px;
  height: 168px;
  margin: 0 auto 0.4rem;
  display: grid;
  place-items: center;
}

.burst > * {
  position: absolute;
  inset: 0;
  margin: auto;
}

.flash {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 250, 232, 0.95) 0%,
    rgba(246, 231, 189, 0.45) 30%,
    transparent 68%
  );
  animation: flash 1.1s var(--ease) both;
}

.ring {
  border: 1px solid rgba(246, 231, 189, 0.8);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ripple 2.6s var(--ease) infinite;
}

.r2 {
  animation-delay: 1.1s;
}

.ray {
  width: 1px;
  height: 150px;
  background: linear-gradient(
    to top,
    transparent,
    rgba(246, 231, 189, 0.75),
    transparent
  );
  transform-origin: center;
  animation: rayIn 1.4s var(--ease) both;
}

.star {
  width: 66px;
  height: 66px;
  fill: #fdf6df;
  filter: drop-shadow(0 0 14px rgba(246, 231, 189, 0.9));
  animation: pop 1s var(--ease) both, float 4.5s ease-in-out 1s infinite;
}

@keyframes flash {
  0% {
    opacity: 0;
    transform: scale(0.2);
  }
  35% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

@keyframes ripple {
  0% {
    opacity: 0.9;
    transform: scale(0.4);
  }
  100% {
    opacity: 0;
    transform: scale(4.2);
  }
}

@keyframes rayIn {
  0% {
    opacity: 0;
    height: 0;
  }
  55% {
    opacity: 0.9;
    height: 150px;
  }
  100% {
    opacity: 0.22;
    height: 120px;
  }
}

@keyframes pop {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-40deg);
  }
  70% {
    opacity: 1;
    transform: scale(1.12) rotate(4deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.03);
  }
}
</style>
