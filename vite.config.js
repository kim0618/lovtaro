import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import crypto from 'crypto'

function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const swPath = resolve('dist/sw.js')
      const hash = crypto.randomBytes(4).toString('hex')
      const content = readFileSync(swPath, 'utf-8')
      writeFileSync(swPath, content.replace('__BUILD_HASH__', hash))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), swVersionPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
