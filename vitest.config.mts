import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    workspace: [
      // matches every folder and file inside the `packages` folder
      'packages/*',
      {
        // add "extends: true" to inherit the options from the root config
        extends: true,
        test: {
          // it is recommended to define a name when using inline configs
          include: ['src/http/**/*.spec.{ts,js}'],
          name: 'e2e-tests',
          environment: 'prisma',
        },
      },
      {
        extends: true,
        test: {
          include: ['src/use-cases/**/*.spec.{ts,js}'],
          name: 'unit-tests',
          environment: 'node',
        },
      },
    ],
  },
})
