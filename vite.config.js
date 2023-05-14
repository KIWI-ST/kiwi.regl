import { defineConfig } from 'vite';

module.exports = defineConfig({
    optimizeDeps: {
        entries: 'example/index.html'
    },
    build: {
        rollupOptions: {
            input: 'src/index.ts'
        }
    },
    server: {
        port: 4080,
        strictPort: 4080
    }
});