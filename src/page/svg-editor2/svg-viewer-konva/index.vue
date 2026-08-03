<template>
  <div class="viewBox">
    <SvgViewerKonva ref="innerRef" hideToolBar :url="url" , :onLoad="onLoad" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import SvgViewerKonva from './svgViewerKonva.vue'

const props = defineProps<{
  onLoad?: () => void
}>()
const innerRef = ref<InstanceType<typeof SvgViewerKonva>>()
const url =
  'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg'
// const url =
//   'http://172.18.40.57/glb-files/svg/c7195a476e6a229584784620a5993326_20260730134352.svg'

const onLoad = () => {
  innerRef.value?.renderRectList(
    [
      {
        ID: 189,
        sx: 100.46,
        sy: 100.87,
        ex: 300.25,
        ey: 300.86,
      },
      {
        ID: 175,
        sx: 400.38,
        sy: 400.94,
        ex: 600.98,
        ey: 600.92,
      },
    ],
    (e) => {
      // innerRef.value?.viewRect?.(e.ID)
      console.log(e)
    },
  )
  props.onLoad?.()
}
defineExpose({
  getInner: () => innerRef.value,
})
</script>

<style lang="scss" scoped>
.viewBox {
  width: 100%;
  height: 100%;
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  :deep {
    .canvasBox {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
