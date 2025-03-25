import { createApp } from 'vue'

import App from './App.vue'

import './style.css'

createApp(App).mount('#app')
const appTitle = import.meta.env.ENV
const apiUrl = import.meta.env.VITE_EDITOR
console.log(`test:>`, { appTitle, apiUrl })
