import ElementPlus from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'
import { initDom } from './utils/positionToCode'

import './style.css'

initDom()

createApp(App).use(ElementPlus).mount('#app')
