import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/**/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es')
          return 'index.js'
        return 'index.cjs'
      },
    },
    rollupOptions: {
      external: [/@yhjs\/lunar/, /@yhjs\/bagua/],
      output: {
        exports: 'named',
      },
    },
  },
  resolve: {
    alias: {
      '@yhjs/lunar': resolve(__dirname, '../lunar/src'),
      '@yhjs/bagua': resolve(__dirname, '../bagua/src'),
    },
  },
})
