import { createI18n } from 'vue-i18n'
import { zh } from './lang_zh'
import { en } from './lang_en'

export const i18n = createI18n({
  // something vue-i18n options here ...
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: {
    zh: zh,
    en: en,
  },
})
