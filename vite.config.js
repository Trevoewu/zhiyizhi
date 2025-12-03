import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // REPLACE '/zhiyizhi/' with your repository name, e.g. '/my-repo/'
  base: '/zhiyizhi/',
})
