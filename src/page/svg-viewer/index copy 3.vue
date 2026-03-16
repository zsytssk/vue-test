<template>
  <button v-for="(item, index) in points" @click="jump(item)">
    {{ index }}
  </button>
  <button @click="scaleViewer(1)">+</button>
  <button @click="scaleViewer(-1)">-</button>
  <button @click="scaleViewer(0)">reset</button>
  <div
    ref="canvasBoxRef"
    :style="{
      height: '80vh',
      width: '80vw',
      margin: '0 auto',
      background: `#fff`,
    }"
  >
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Application, Graphics, Container } from 'pixi.js'

import { onMounted, ref } from 'vue'

const points = ['1531.138484,332.940830', '1594.055856,538.902629'].map(
  (item) => {
    const arr = item.split(',').map(Number)
    return { x: arr[0], y: arr[1] }
  },
)
const canvasRef = ref<HTMLCanvasElement>()
const canvasBoxRef = ref<HTMLDivElement>()
const containerRef = ref<Container>()
const graphicRef = ref<Graphics>()
const scaleFactor = 1.1
let defaultScale = 1
const url =
  'http://172.18.16.229/glb-files/svg/f18bca8a111f99ac086c89ec64aa0dcb_20260313094818.svg'
onMounted(async () => {
  // Create a new application
  const app = new Application()
  const canvas = canvasRef.value as HTMLCanvasElement
  console.log(`test:>canvasRef.value`, canvasRef.value)
  // Initialize the application
  await app.init({
    antialias: true,
    resizeTo: canvasBoxRef.value,
    canvas,
    backgroundColor: 0xffffff,
  })
  const container = new Container()
  app.stage.addChild(container)

  const svgText = await fetch(url).then((r) => r.text())
  const graphic = new Graphics().svg(svgText)
  container.addChild(graphic)

  graphicRef.value = graphic
  containerRef.value = container

  // 初始居中
  // centerGraphic()

  // ---- 鼠标拖拽平移 ----
  let dragging = false
  let dragStart = { x: 0, y: 0 }
  let containerStart = { x: 0, y: 0 }

  canvas.addEventListener('mousedown', (e) => {
    dragging = true
    dragStart = { x: e.clientX, y: e.clientY }
    containerStart = { x: container.x, y: container.y }
  })

  canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    container.x = containerStart.x + dx
    container.y = containerStart.y + dy
  })

  canvas.addEventListener('mouseup', () => {
    dragging = false
  })
  canvas.addEventListener('mouseleave', () => {
    dragging = false
  })

  // ---- 鼠标滚轮缩放 ----
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      scaleViewer(e.deltaY < 0 ? -1 : 1, { x: e.offsetX, y: e.offsetY })
    },
    { passive: false },
  )
})

function centerGraphic() {
  const graphic = graphicRef.value
  const container = containerRef.value
  const canvas = canvasRef.value as HTMLCanvasElement
  if (!graphic || !container || !canvas) {
    return
  }
  const bounds = graphic.getLocalBounds()
  graphic.x = -bounds.x
  graphic.y = -bounds.y
  container.x = 0
  // container.x = (canvas.width - bounds.width) / 2
  container.y = (canvas.height - bounds.height) / 2
  const scale = Math.min(
    canvas.width / bounds.width,
    canvas.height / bounds.height,
  )
  container.scale.x = scale
  container.scale.y = scale
  defaultScale = scale
}

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
    container.x = 0
    container.y = 0
  }
}
</script>

<style scoped lang="scss">
canvas {
  width: 100%;
  height: 100%;
}
</style>
