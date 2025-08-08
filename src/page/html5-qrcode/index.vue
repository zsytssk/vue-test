<template>
  <div>
    <!--  -->
    <input-widget-scan ref="inputScanRef" />
  </div>
</template>

<script setup lang="ts">
import InputWidgetScan from '@/components/input-widget-sub/input-widget-scan.vue'
import { onMounted, ref } from 'vue'

const inputScanRef = ref<InstanceType<typeof InputWidgetScan>>()
onMounted(() => {
  inputScanRef.value?.openDialog('1')
})
</script>

<style lang="scss" scoped></style>
