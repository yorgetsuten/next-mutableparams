import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'
import packagejson from './package.json' assert { type: 'json' }

export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],
  build: {
    lib: {
      formats: ['es'],
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        use: resolve(__dirname, 'src/useMutableParams.ts')
      }
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
