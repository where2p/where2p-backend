import { defineConfig } from 'prisma';

export default defineConfig({
  schema: './prisma/schema.prisma',
  orm: {
    family: 'prisma-client-js',
    adapter: {
      provider: 'prisma-client',
    },
    target: 'prisma-client',
  },
});