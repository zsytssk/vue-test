import vue from '@vitejs/plugin-vue'
import { ConfigEnv, loadEnv } from 'vite'

import WaPosition from './script/waPosition'

export default ({ command, mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [env.VITE_POSITION === 'open' && WaPosition(), vue()],
  }
}
