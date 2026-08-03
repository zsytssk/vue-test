<template>
  <div class="box">
    <SvgViewerKonva ref="innerRef" hideToolBar :url="url" , :onLoad="onLoad" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import SvgViewerKonva from './svgViewerKonva.vue'
import type Konva from 'konva/lib/_CoreInternals'

const props = defineProps<{
  onLoad?: (data: { stage: Konva.Stage; layer: Konva.Layer }) => void
}>()
const innerRef = ref<InstanceType<typeof SvgViewerKonva>>()
// const url =
//   'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg'
const url =
  'http://172.18.40.57/glb-files/svg/c7195a476e6a229584784620a5993326_20260730134352.svg'

const onLoad = (data: { stage: Konva.Stage; layer: Konva.Layer }) => {
  innerRef.value?.renderRectList(
    [
      {
        ID: 189,
        sx: 4833.46,
        sy: 3360.87,
        ex: 5416.25,
        ey: 3460.86,
      },
      {
        ID: 175,
        sx: 879.38,
        sy: 5739.94,
        ex: 1263.98,
        ey: 5805.92,
      },
      {
        ID: 191,
        sx: 3411.32,
        sy: 506.77,
        ex: 4162.7,
        ey: 859.29,
      },
      {
        ID: 190,
        sx: 46.4,
        sy: 1029.88,
        ex: 675.83,
        ey: 1384.67,
      },
      {
        ID: 185,
        sx: 6649.21,
        sy: 3859.94,
        ex: 7392.46,
        ey: 4212.46,
      },
      {
        ID: 187,
        sx: 4465.98,
        sy: 3279.45,
        ex: 5101.96,
        ey: 3633.43,
      },
      {
        ID: 184,
        sx: 6679.27,
        sy: 4881.17,
        ex: 7301.45,
        ey: 5235.16,
      },
      {
        ID: 183,
        sx: 1379.48,
        sy: 3761.52,
        ex: 2122.59,
        ey: 4114.7,
      },
      {
        ID: 188,
        sx: 4481.09,
        sy: 4897.01,
        ex: 5213,
        ey: 5250.2,
      },
      {
        ID: 186,
        sx: 6694.38,
        sy: 5815.1,
        ex: 7326.09,
        ey: 6167.62,
      },
    ],
    (e) => {
      // innerRef.value?.viewRect?.(e.ID)
      console.log(e)
    },
  )
  props.onLoad?.(data)
}
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100vh;
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
