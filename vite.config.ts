import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
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
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), // 路径别名
      },
    },
    plugins: [
      env.VITE_POSITION === 'open' && WaPosition(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  }
}
