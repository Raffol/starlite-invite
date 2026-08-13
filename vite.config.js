import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
  },
})

// Про /api: `npm run dev` поднимает только фронтенд, серверной функции в нём нет.
// Чтобы проверить отправку в Telegram локально, запускай `vercel dev` —
// он сам поднимает и Vite, и функции из папки api/ на одном порту.
