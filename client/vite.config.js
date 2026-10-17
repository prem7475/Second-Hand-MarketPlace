import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const { PORT = '4000' } = loadEnv(mode, '../server', '')
  const apiTarget = `http://localhost:${PORT}`

  return {
    envDir: '../server',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': apiTarget,
        '/socket.io': {
          target: apiTarget,
          ws: true,
        },
      },
    },
  }
})
