<script setup lang="ts">
import { onMounted, ref } from 'vue'

import InputWidgetScan from './input-widget-scan.vue'

defineProps<{}>()
defineOptions({ name: 'HTML5-Qrcode2' })
const scanRef = ref<InstanceType<typeof InputWidgetScan>>()
function openDialog() {
  scanRef.value?.openDialog('1')
}

onMounted(() => {
  openDialog()
})
</script>

<template>
  <div class="box">
    <input-widget-scan ref="scanRef" />
    <Button @click="openDialog">click</Button>
  </div>
</template>

<style scoped lang="scss"></style>
