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
  resolve: {
    alias: {
      '@yhjs/bagua': resolve(__dirname, '../bagua/src'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'core/index': resolve(__dirname, 'src/core/index.ts'),
        'lunar/index': resolve(__dirname, 'src/lunar/index.ts'),
        'eclipse/index': resolve(__dirname, 'src/eclipse/index.ts'),
        'ephemeris/index': resolve(__dirname, 'src/ephemeris/index.ts'),
        'astronomy/index': resolve(__dirname, 'src/astronomy/index.ts'),
        'data/index': resolve(__dirname, 'src/data/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (format === 'es')
          return `${entryName}.js`
        return `${entryName}.cjs`
      },
    },
    rollupOptions: {
      external: [/@yhjs\/bagua/],
      output: {
        exports: 'named',
      },
    },
  },
})
