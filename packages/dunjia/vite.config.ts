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
      '@yhjs/lunar': resolve(__dirname, '../lunar/src'),
      '@yhjs/bagua': resolve(__dirname, '../bagua/src'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'outer-gods/index': resolve(__dirname, 'src/outer-gods/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (format === 'es')
          return `${entryName}.js`
        return `${entryName}.cjs`
      },
    },
    rollupOptions: {
      external: [/@yhjs\/lunar/, /@yhjs\/bagua/],
      output: {
        exports: 'named',
      },
    },
  },
})
