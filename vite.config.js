import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        events: resolve(__dirname, 'events.html'),
        membership: resolve(__dirname, 'membership.html'),
        courses: resolve(__dirname, 'courses/index.html'),
        team: resolve(__dirname, 'team/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
      },
    },
  },
});
