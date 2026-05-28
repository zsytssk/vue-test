<template>
  <div>xxx</div>
  <div>{{ i18n.t('hello') }}</div>
  <div>{{ i18n.locale }}</div>
  <button @click="changeLocale">click</button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

console.log(`test:>i18n.t`, i18n.t, i18n.locale.value)

const changeLocale = () => {
  const curIndex = i18n.availableLocales.indexOf(i18n.locale.value)
  let nextIndex = curIndex + 1
  if (nextIndex >= i18n.availableLocales.length) {
    nextIndex = 0
  }
  i18n.locale.value = i18n.availableLocales[nextIndex]
}
</script>

<style lang="scss" scoped></style>
