<template>
  <div ref="boxRef" class="canvasBox"></div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import type { KonvaEventObject } from 'konva/lib/Node'
import { Image } from 'konva/lib/shapes/Image'
import { Rect } from 'konva/lib/shapes/Rect'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { PosRange } from './konvaUtils'
import { useElementSize } from '@vueuse/core'
import type { RectRange } from '../konva'

const props = defineProps<{
  url: string
  onLoad?: () => void
}>()
const loading = ref(true)
const stageRef = ref<Konva.Stage>()
const layerRef = ref<Konva.Layer>()
const boxRef = ref<HTMLDivElement>()
const { width, height } = useElementSize(boxRef)

const centerGraphic = () => {
  const layer = layerRef.value!
  const stage = stageRef.value!
  const bounds = layer.getClientRect()
  const scale = Math.min(
    stage.width() / (bounds.width / layer.scaleX()),
    stage.height() / (bounds.height / layer.scaleX()),
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
  const layer = layerRef.value!
  layer.draggable(true)

  // ---- 鼠标滚轮缩放 ----
  stage.on('wheel', (e) => {
    e.evt.preventDefault()
    scaleViewer(e)
  })
}

const rectMap = ref<Record<number, [PosRange, Rect]>>({})
const renderRectList = (
  rectList: PosRange[],
  callback: (item: PosRange) => void,
) => {
  const layer = layerRef.value!
  for (const key in rectMap.value) {
    const item = rectMap.value[key]
    const rect = item[1]
    rect.remove()
    rect.destroy()
  }
  rectMap.value = {}
  for (const item of rectList) {
    const rect = new Rect({
      x: item.sx,
      y: item.sy,
      width: item.ex - item.sx,
      height: item.ey - item.sy,
      stroke: 'red',
      strokeWidth: 4,
      draggable: false,
      strokeScaleEnabled: true,
    })
    layer.add(rect)
    rectMap.value[item.ID] = [item, rect]
    // 3. 绑定点击事件
    rect.on('click', () => {
      viewRect(item.ID, false)
      callback(item)
    })
  }
}

const viewRect = (id: number, jump = true) => {
  for (const key in rectMap.value) {
    const [range, rect] = rectMap.value[key] || []
    if (!range) {
      continue
    }
    if (Number(key) !== id) {
      rect.fill('transparent')
      continue
    }
    rect.fill(`rgba(255, 0, 0, 0.1)`)
    const stage = stageRef.value!
    let boundsWidth = range.ex - range.sx
    let boundsHeight = range.ey - range.sy
    // 稍微放大一些空间
    boundsWidth = boundsWidth + boundsWidth / 2
    boundsHeight = boundsHeight + boundsHeight / 2
    const scale = Math.min(
      stage.width() / boundsWidth,
      stage.height() / boundsHeight,
    )
    if (!jump) {
      continue
    }
    jumpTo(
      {
        x: range.sx + (range.ex - range.sx) / 2,
        y: range.sy + (range.ey - range.sy) / 2,
      },
      scale,
    )
  }
}

const jumpToRect = (range: RectRange) => {
  const stage = stageRef.value!
  let boundsWidth = range.width
  let boundsHeight = range.height
  // 稍微放大一些空间
  boundsWidth = boundsWidth + boundsWidth / 2
  boundsHeight = boundsHeight + boundsHeight / 2
  const scale = Math.min(
    stage.width() / boundsWidth,
    stage.height() / boundsHeight,
  )

  jumpTo(
    {
      x: range.x + range.width / 2,
      y: range.y + range.height / 2,
    },
    scale,
  )
}

const getViewpoint = (type = 'out' as 'inner' | 'out') => {
  const stage = stageRef.value!
  const layer = layerRef.value!

  // 获取 Layer 的实际边界（包含所有子元素）
  const bounds = layer.getClientRect()
  const width = bounds.width / layer.scaleX()
  const height = bounds.height / layer.scaleY()
  if (type === 'out') {
    const sx = -layer.x() / layer.scaleX()
    const sy = -layer.y() / layer.scaleY()
    const ex = sx + stage.width() / layer.scaleX()
    const ey = sx + stage.height() / layer.scaleY()

    return {
      x: sx,
      y: sy,
      width: ex - sx,
      height: ey - sy,
    }
  } else {
    let sx = -layer.x() / layer.scaleX()
    let sy = -layer.y() / layer.scaleY()
    let ex = sx + stage.width() / layer.scaleX()
    let ey = sx + stage.height() / layer.scaleY()

    sx = sx < 0 ? 0 : sx
    sy = sy < 0 ? 0 : sy
    ex = ex > width ? width : ex
    ey = ey > height ? height : ey

    return {
      x: sx,
      y: sy,
      width: ex - sx,
      height: ey - sy,
    }
  }
}

watch(
  () => [loading.value, width.value, height.value],
  () => {
    const stage = stageRef.value
    const layer = layerRef.value
    if (!stage || !layer || loading.value) {
      return
    }
    stage.width(width.value)
    stage.height(height.value)
    centerGraphic()
  },
)

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

  Image.fromURL(props.url, (image) => {
    image.cache()
    layer.add(image)
    centerGraphic()
    initEvent()
    setTimeout(() => {
      loading.value = false
      props.onLoad?.()
    }, 100)
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
  getStageEle: () => ({
    stage: stageRef.value,
    layer: layerRef.value,
  }),
  jumpTo,
  jumpToRect,
  viewRect,
  centerGraphic,
  renderRectList,
  getViewpoint,
})
</script>
<style lang="scss" scoped>
.canvasBox {
  flex: 1;
  overflow: hidden;
}
</style>
