import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Hermes AgentFlow Studio',
                short_name: 'AgentFlow',
                description: 'Multi-agent business workflow and learning studio',
                theme_color: '#0b1326',
                background_color: '#0b1326',
                display: 'standalone',
                icons: [
                    { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
                    { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': '/src'
        }
    },
    server: {
        port: 3080,
        host: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true
            }
        }
    },
    preview: {
        port: 3080
    }
});
