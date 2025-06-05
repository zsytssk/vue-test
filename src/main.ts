import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'
import { initDom } from './utils/positionToCode'

import './style.css'

initDom()

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component as any)
}
app.use(ElementPlus).mount('#app')
