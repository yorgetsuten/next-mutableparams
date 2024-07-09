import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'
import packagejson from './package.json' assert { type: 'json' }

export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [...Object.keys(packagejson.dependencies), /^node:.*/]
    },
    target: 'esnext'
  },
  test: {
    environment: 'jsdom'
  },
  resolve: {
    alias: {
      src: resolve(__dirname, 'src')
    }
  }
})
