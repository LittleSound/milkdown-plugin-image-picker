import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['vue'],
  },
})
