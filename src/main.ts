import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import '@fortawesome/fontawesome-free/css/regular.min.css'

import Vant from 'vant'
import 'vant/lib/index.css'
import '@vant/touch-emulator'
import './utils/calcRem'

import { createApp } from 'vue'

import App from './App.vue'
import { initDom } from './utils/positionToCode'

import './style.css'
import { i18n } from './page/i18n-test/useI18n.ts'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component as any)
}
initDom(app)
app.use(ElementPlus).use(i18n).use(Vant).mount('#app')
