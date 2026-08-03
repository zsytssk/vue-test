<template>
  <SvgViewer ref="innerRef" hideToolBar :dxfUrl="url" />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SvgViewer from './svgViewer.vue'

const innerRef = ref<InstanceType<typeof SvgViewer>>()
const url =
  'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg'

onMounted(() => {
  setTimeout(() => {
    innerRef.value?.renderRectList(
      [
        { ID: 1, sx: 0, sy: 0, ex: 100, ey: 100 },
        { ID: 2, sx: 300, sy: 300, ex: 400, ey: 400 },
      ],
      (e) => {
        console.log(e)
      },
    )
  }, 3000)
})
</script>

<style lang="scss" scoped></style>
