import { defineConfig } from 'astro/config';

const configuredBase = process.env.BASE_PATH || '/';
const base = configuredBase === '/'
  ? '/'
  : `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`;

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base,
  output: 'static',
  build: {
    assets: 'assets'
  }
});
