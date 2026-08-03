<template>
  <div class="box">
    <SvgViewerKonva ref="innerRef" hideToolBar :url="url" , :onLoad="onLoad" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import SvgViewerKonva from './svgViewerKonva.vue'

const innerRef = ref<InstanceType<typeof SvgViewerKonva>>()
const url =
  'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg'

const onLoad = () => {
  innerRef.value?.renderRectList(
    [
      { ID: 1, sx: 0, sy: 0, ex: 100, ey: 100 },
      { ID: 2, sx: 300, sy: 300, ex: 400, ey: 400 },
    ],
    (e) => {
      innerRef.value?.viewRect?.(e.ID)
      console.log(e)
    },
  )
}
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100vh;
  background-color: #fff;
  border: 1px solid #000;
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
