import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { ConfigEnv, loadEnv } from 'vite'

import WaPosition from './script/waPosition'
import WaPositionServer from './script/waPositionServer'

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: './',
    server: {
      // 如果使用docker-compose开发模式，设置为false
      open: false,
      port: env.VITE_CLI_PORT,
      proxy: {
        // 把key的路径代理到target位置
        [env.VITE_BASE_API]: {
          // 需要代理的路径   例如 '/api'
          target: `${env.VITE_BASE_PATH}:${env.VITE_SERVER_PORT}/`, // 代理到 目标路径
          changeOrigin: false,
          rewrite: (path: any) =>
            path.replace(new RegExp('^' + env.VITE_BASE_API), ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), // 路径别名
      },
    },
    plugins: [
      env.VITE_POSITION === 'open' && WaPositionServer(),
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
