import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 远程沙箱：监听所有网卡，便于外部访问预览
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  }
})
