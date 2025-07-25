import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Vue3ExcelEditor from './page/excel-editor-test/vue3-excel-editor/main.js'

import { createApp } from 'vue'

import App from './App.vue'
import { initDom } from './utils/positionToCode'

import './style.css'

initDom()

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component as any)
}
app.use(ElementPlus).use(Vue3ExcelEditor).mount('#app')
