<template>
  <div class="box">
    <div ref="boxRef" class="canvasBox"></div>
  </div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import type { KonvaEventObject } from 'konva/lib/Node'
import { Image } from 'konva/lib/shapes/Image'
import { onMounted, onUnmounted, ref } from 'vue'

const stageRef = ref<Konva.Stage>()
const layerRef = ref<Konva.Layer>()
const boxRef = ref<HTMLDivElement>()
const url =
  'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg'
// const url =
//   'http://172.18.16.229/glb-files/svg/52a66c64c33832d16ed20d068379686e_20260318141752.svg'

const centerGraphic = () => {
  const layer = layerRef.value!
  const stage = stageRef.value!
  const bounds = layer.getClientRect()
  const scale = Math.min(
    stage.width() / bounds.width,
    stage.height() / bounds.height,
  )
  layer.scaleX(scale)
  layer.scaleY(scale)
  const newBounds = layer.getClientRect()
  layer.x((stage.width() - newBounds.width) / 2)
  layer.y((stage.height() - newBounds.height) / 2)
  layer.batchDraw()
}

const scaleViewer = (e: KonvaEventObject<WheelEvent, Konva.Stage>) => {
  const layer = layerRef.value!
  const stage = stageRef.value!
  // 1. 获取滚轮方向
  const delta = e.evt.deltaY > 0 ? -1 : 1
  const zoomFactor = 1.1 // 缩放倍数

  // 2. 计算新的缩放比例
  const oldScale = layer.scaleX()
  const newScale = oldScale * (delta > 0 ? zoomFactor : 1 / zoomFactor)

  // 限制缩放范围（可选）
  const clampedScale = Math.min(Math.max(newScale, 0.1), 10)

  // 3. 获取鼠标在 Stage 上的位置
  const pointer = stage.getPointerPosition()
  if (!pointer) return

  // 4. 计算缩放前后鼠标位置对应的世界坐标
  const mousePointTo = {
    x: (pointer.x - layer.x()) / oldScale,
    y: (pointer.y - layer.y()) / oldScale,
  }

  layer.setAttrs({
    scaleX: clampedScale,
    scaleY: clampedScale,
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale,
  })
  layer.batchDraw()
}

const jumpTo = (pos: { x: number; y: number }, scale = 2) => {
  const layer = layerRef.value!
  const stage = stageRef.value!
  if (!layer || !stage) {
    return
  }
  layer.setAttrs({
    scaleX: scale,
    scaleY: scale,
    x: -pos.x * scale + stage.width() / 2,
    y: -pos.y * scale + stage.height() / 2,
  })
}

const initEvent = () => {
  const stage = stageRef.value!
  const container = layerRef.value!
  container.draggable(true)

  // ---- 鼠标滚轮缩放 ----
  stage.on('wheel', (e) => {
    e.evt.preventDefault()
    scaleViewer(e)
  })
}

onMounted(() => {
  var stage = new Konva.Stage({
    container: boxRef.value,
    width: boxRef.value!.clientWidth,
    height: boxRef.value!.clientHeight,
  })

  // add canvas element
  var layer = new Konva.Layer()
  stage.add(layer)
  layerRef.value = layer
  stageRef.value = stage

  Image.fromURL(url, (image) => {
    image.cache()
    layer.add(image)
    centerGraphic()
    initEvent()
  })
})

onUnmounted(async () => {
  const stage = stageRef.value
  const layer = layerRef.value

  layer?.off()
  stage?.off()
  stage?.destroy()

  stageRef.value = undefined
  layerRef.value = undefined
})

defineExpose({
  jumpTo,
  centerGraphic,
})
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
  .canvasBox {
    flex: 1;
    overflow: hidden;
  }
}
</style>
