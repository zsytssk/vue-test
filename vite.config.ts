import vue from '@vitejs/plugin-vue'
import { ConfigEnv, loadEnv } from 'vite'

import WaPosition from './script/waPosition'

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: './',
    server: {
      // https: true,
      host: '0.0.0.0',
      allowedHosts: ['shad-credible-wahoo.ngrok-free.app'],
    },
    plugins: [env.VITE_POSITION === 'open' && WaPosition(), vue()],
  }
}
