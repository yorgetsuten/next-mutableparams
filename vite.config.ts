import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],
  build: {
    lib: {
      formats: ['es'],
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        use: resolve(__dirname, 'src/use.ts')
      }
    },
    rollupOptions: {
      external: ['next/navigation', 'react']
    },
    target: 'esnext'
  },
  resolve: {
    alias: {
      src: resolve(__dirname, 'src')
    }
  }
})
