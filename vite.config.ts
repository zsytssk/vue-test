import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { ConfigEnv, loadEnv } from 'vite'
// import postCssPxToRem from 'postcss-pxtorem'
import WaPosition from './script/waPosition'
import WaPositionServer from './script/waPositionServer'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: './',
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
          chunkFileNames: 'assets/087AC4D233B64EB0[name].[hash].js',
          assetFileNames: 'assets/087AC4D233B64EB0[name].[hash].[ext]',
          experimentalMinChunkSize: 20000,
          manualChunks(id: string) {
            console.log(`test:>id`, __dirname, id)
            // 1. 所有第三方依赖合并到一个 vendor.js 中
            if (id.includes('node_modules')) {
              return 'vendor'
            }
            // 2. 可选：将 src/utils、src/components 等通用目录合并为 common.js
            if (
              id.includes('src') &&
              !id.includes('src/views') &&
              !id.includes('src/plugin')
            ) {
              return 'common'
            }
            return undefined
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          // postCssPxToRem({
          //   rootValue: 100, // The base font size for the root element (1rem = 16px by default)
          //   propList: ['*'], // Properties to convert, use '*' to convert all properties
          //   unitPrecision: 5, // The decimal numbers to allow the REM units to grow to
          //   selectorBlackList: ['.keepPX'], // Selectors to ignore and leave as px
          //   minPixelValue: 2, // Set the minimum pixel value to replace
          // }),
        ],
      },
    },
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
      vueJsx(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  }
}
