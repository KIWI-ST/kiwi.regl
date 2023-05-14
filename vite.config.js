import { resolve } from 'path'
import { defineConfig } from 'vite';

 export default defineConfig({
    optimizeDeps: {
        entries: 'example/index.html'
    },
    // https://v3.vitejs.dev/guide/build.html#library-mode
    build: {
        lib:{
            entry: resolve(__dirname, 'src/index.ts'),
            name:'pipegl',
            fileName:'pipegl-lib'
        },
        rollupOptions: {
            input: 'src/index.ts',
        }
    },
    server: {
        port: 4080,
        strictPort: 4080
    }
});