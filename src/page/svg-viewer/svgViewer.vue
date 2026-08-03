<template>
  <div class="dxf-viewer-wrapper">
    <div class="viewer-toolbar" v-if="!hideToolBar">
      <slot name="toolLeft"><span></span></slot>
      <div class="in-tools">
        <div class="flex items-center gap-2 mr-4 text-base">
          深色背景
          <el-switch v-model="isBlackBg" size="large"></el-switch>
        </div>
        <el-button class="toolbar-btn" title="放大" @click="scaleViewer(1)">
          <span>+</span>
        </el-button>
        <el-button class="toolbar-btn" title="缩小" @click="scaleViewer(-1)">
          <span>−</span>
        </el-button>
        <el-button class="toolbar-btn" title="重置视图" @click="scaleViewer(0)">
          <span>⟲</span>
        </el-button>
      </div>
    </div>
    <div ref="viewerContainer" class="dxf-viewer-container">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>正在加载 SVG 文件...</p>
        <p v-if="progress" class="loading-progress">{{ progress }}</p>
      </div>
      <div v-if="error" class="error-overlay">
        <p class="error-icon">⚠️</p>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="retryLoad">重试</button>
      </div>
      <slot name="toolInner"></slot>
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
<script setup lang="ts">
// @ts-ignore
import {
  Application,
  Container,
  Texture,
  Sprite,
  Graphics,
} from './pixi.min.mjs'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { drawGraphicRect, drawRect, sleep } from './drawRect'
import type { PosRange } from './drawRect'

const props = defineProps<{
  dxfUrl: any
  onLoad?: () => void
  hideToolBar?: boolean
}>()
const loading = ref(true)
const error = ref<string>()
const progress = ref('')

const isBlackBg = ref(false)
const appRef = ref<any>()
const offFnRef = ref<() => void>()
const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<Container>()
const offsetRef = ref<{ x: number; y: number }>()
const scaleFactor = 1.1
let defaultScale = 1

const previewSvg = async () => {
  loading.value = true
  error.value = undefined
  progress.value = '初始化视图...'

  try {
    const app = new Application()
    appRef.value = app

    const canvas = canvasRef.value as HTMLCanvasElement
    const loadSvg = fetch(props.dxfUrl).then((r) => r.text())
    // const loadSvg = fetch(`http://172.18.16.229` + props.dxfUrl).then((r) =>
    //   r.text(),
    // )
    const initApp = app.init({
      antialias: true,
      resizeTo: canvasRef.value,
      canvas,
      backgroundColor: 0xffffff,
    })
    const [svgText] = await Promise.all([loadSvg, initApp])
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    // 2. 用 Image 对象加载（浏览器原生 SVG 解析）
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })

    // 3. 从 Image 创建 PixiJS Texture（WebGL 纹理上传）
    const texture = Texture.from(img)
    URL.revokeObjectURL(url)
    const container = new Container()
    app.stage.addChild(container)
    containerRef.value = container
    // const graphic = new Graphics().svg(svgText)
    // container.addChild(graphic)
    const graphic = new Sprite(texture)
    container.addChild(graphic)

    // 初始居中
    const centerGraphic = () => {
      const bounds = graphic.getLocalBounds()
      graphic.x = -bounds.x
      graphic.y = -bounds.y
      offsetRef.value = {
        x: bounds.x,
        y: bounds.y,
      }
      const scale = Math.min(
        canvas.width / bounds.width,
        canvas.height / bounds.height,
      )
      container.scale.x = scale
      container.scale.y = scale
      defaultScale = scale
      container.x = (canvas.width - container.width) / 2
      container.y = (canvas.height - container.height) / 2
    }
    centerGraphic()

    // ---- 鼠标拖拽平移 ----
    let dragging = false
    let dragStart = { x: 0, y: 0 }
    let containerStart = { x: 0, y: 0 }

    const mousedown = (e: MouseEvent) => {
      dragging = true
      dragStart = { x: e.clientX, y: e.clientY }
      containerStart = { x: container.x, y: container.y }
    }
    const mousemove = (e: MouseEvent) => {
      if (!dragging) return
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      container.x = containerStart.x + dx
      container.y = containerStart.y + dy
    }
    const mouseleave = () => {
      dragging = false
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      scaleViewer(e.deltaY > 0 ? -1 : 1, { x: e.offsetX, y: e.offsetY })
    }
    canvas.addEventListener('mousedown', mousedown)
    canvas.addEventListener('mousemove', mousemove)
    canvas.addEventListener('mouseup', mouseleave)
    canvas.addEventListener('mouseleave', mouseleave)
    canvas.addEventListener('wheel', wheel, { passive: false })

    offFnRef.value = () => {
      canvas.removeEventListener('mousedown', mousedown)
      canvas.removeEventListener('mousemove', mousemove)
      canvas.removeEventListener('mouseup', mouseleave)
      canvas.removeEventListener('mouseleave', mouseleave)
      canvas.removeEventListener('wheel', wheel)
    }
    loading.value = false
    props.onLoad?.()
  } catch (err) {
    error.value = `加载失败: ${(err as Error).message || '未知错误'}`
    loading.value = false
  }
}

const onDestroy = () => {
  if (appRef.value) {
    appRef.value.destroy(true, {
      children: true,
      texture: true,
      baseTexture: true,
    })
    offFnRef.value?.()
    offFnRef.value = undefined
    containerRef.value = undefined
    appRef.value = undefined
  }
}

const retryLoad = async () => {
  onDestroy()
  previewSvg()
}

watch(
  () => isBlackBg.value,
  (isBlack) => {
    if (appRef.value) {
      appRef.value.renderer.background.color = isBlack ? 0x333333 : 0xffffff
    }
  },
)

onMounted(() => {
  onDestroy()
  previewSvg()
})

onUnmounted(async () => {
  await sleep(1)
  nextTick(() => {
    onDestroy()
  })
})

const scaleViewer = (deltaNum: number, mousePos?: { x: number; y: number }) => {
  const container = containerRef.value
  const canvas = canvasRef.value as HTMLCanvasElement
  if (!container || !canvas) {
    return
  }
  if (!mousePos) {
    mousePos = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    }
  }

  // 鼠标指向的位置缩放中心
  const worldPosX = (mousePos.x - container.x) / container.scale.x
  const worldPosY = (mousePos.y - container.y) / container.scale.y

  switch (deltaNum) {
    case 1:
      container.scale.x *= scaleFactor
      container.scale.y *= scaleFactor
      break
    case -1:
      container.scale.x /= scaleFactor
      container.scale.y /= scaleFactor
      break
    default:
      container.scale.x = defaultScale
      container.scale.y = defaultScale
  }

  if (deltaNum !== 0) {
    // 缩放后保持鼠标中心位置
    container.x = mousePos.x - worldPosX * container.scale.x
    container.y = mousePos.y - worldPosY * container.scale.y
  } else {
    container.x = (canvas.width - container.width) / 2
    container.y = (canvas.height - container.height) / 2
  }
}

const jumpTo = (pos: { x: number; y: number }, scale = 2) => {
  const container = containerRef.value
  const canvas = canvasRef.value as HTMLCanvasElement
  const offset = offsetRef.value
  if (!container || !canvas || !offset) {
    return
  }
  container.scale.x = scale
  container.scale.y = scale
  // container.x = -pos.x * container.scale.x + canvas.width / 2
  // container.y =
  //   -(container.height / container.scale.y - pos.y) * container.scale.y +
  //   canvas.height / 2
  container.x = -(pos.x - offset.x) * container.scale.x + canvas.width / 2
  container.y = -(pos.y - offset.y) * container.scale.y + canvas.height / 2
}

const rectMap = ref<Record<number, [PosRange, Graphics]>>({})
const renderRectList = (
  rectList: PosRange[],
  callback: (item: PosRange) => void,
) => {
  for (const key in rectMap.value) {
    const item = rectMap.value[key]
    const graphic = item[1]
    if (graphic.parent) {
      graphic.parent.removeChild(graphic)
    }

    // 销毁 Graphics 对象（释放内存）
    graphic.destroy({
      children: true,
      texture: true,
      baseTexture: true, // 清理基础纹理
    })
  }
  rectMap.value = {}
  for (const item of rectList) {
    const graphic = drawRect(item)
    containerRef.value?.addChild(graphic)
    rectMap.value[item.ID] = [item, graphic]
    // 2. 启用交互 (关键一步)
    graphic.eventMode = 'static'
    // 3. 绑定点击事件
    graphic.on('click', () => {
      viewRect(item.ID, false)
      callback(item)
    })
  }
  setTimeout(() => {
    scaleViewer(0)
  })
}

const viewRect = (id: number, jump = true) => {
  for (const key in rectMap.value) {
    const [range, graphic] = rectMap.value[key] || []
    if (!range) {
      continue
    }
    if (Number(key) !== id) {
      drawGraphicRect(graphic, range)
      continue
    }
    drawGraphicRect(graphic, range, true)
    const canvas = canvasRef.value!
    let boundsWidth = range.ex - range.sx
    let boundsHeight = range.ey - range.sy
    // 稍微放大一些空间
    boundsWidth = boundsWidth + boundsWidth / 2
    boundsHeight = boundsHeight + boundsHeight / 2
    const scale = Math.min(
      canvas.width / boundsWidth,
      canvas.height / boundsHeight,
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

defineExpose({ jumpTo, renderRectList, viewRect, scaleViewer })
</script>

<style scoped lang="scss">
.dxf-viewer-wrapper {
  width: 100%;
  max-width: 1400px;
  position: relative;
}

.viewer-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: center;
  justify-content: space-between;
  .in-tools {
    display: flex;
  }
}

.toolbar-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.dxf-viewer-container {
  width: 100%;
  height: calc(100vh - 160px);
  box-sizing: border-box;
  // min-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: #ffffff;
  canvas {
    width: 100%;
    height: 100%;
  }
}

.dxf-viewer-container :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(0, 217, 255, 0.1);
  border-top-color: #00d9ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: rgba(0, 0, 0, 0.7);
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.loading-progress {
  color: #0088cc !important;
  font-size: 0.9rem !important;
}

.error-overlay {
  background: rgba(255, 255, 255, 0.98);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-message {
  color: #ff6b6b;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  text-align: center;
  padding: 0 2rem;
}

.retry-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #00d9ff, #00ff88);
  color: #1a1a2e;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 217, 255, 0.4);
}
</style>
