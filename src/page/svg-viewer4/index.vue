<template>
  <button v-for="(item, index) in points" @click="jumpTo(item)">
    {{ index + 1 }}
  </button>
  <button @click="scaleViewer(1)">+</button>
  <button @click="scaleViewer(-1)">-</button>
  <button @click="scaleViewer(0)">reset</button>
  <button>loading:{{ loadingRef }}</button>
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
import { drawCircle } from './drawCircle'
import { Application, Graphics, Container } from './pixi.min.mjs'

import { onMounted, ref } from 'vue'

const points = ['2747.03,4845.92', '2864.87,4481.67'].map((item) => {
  const arr = item.split(',').map(Number)
  // return { x: arr[0] / 2, y: arr[1] / 2 }
  return { x: arr[0], y: arr[1] }
})
const loadingRef = ref(false)
const canvasRef = ref<HTMLCanvasElement>()
const canvasBoxRef = ref<HTMLDivElement>()
const containerRef = ref<Container>()
const offsetRef = ref<{ x: number; y: number }>()
const scaleFactor = 1.1
let defaultScale = 1
// const url =
//   'http://172.18.16.229/glb-files/svg/03f8442ce9be1b2549a7a8d8c58c6a2c_20260311173624.svg'
const url =
  'http://172.18.16.229/glb-files/svg/52a66c64c33832d16ed20d068379686e_20260318141752.svg'
onMounted(async () => {
  loadingRef.value = true
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
  containerRef.value = container
  const svgText = await fetch(url).then((r) => r.text())

  const graphic = new Graphics()
  console.log(`test:>svgText`, svgText)
  graphic.svg(svgText)
  container.addChild(graphic)
  ;(window as any).app = app
  ;(window as any).graphic = graphic
  ;(window as any).container = container

  // const graphic = new Graphics().svg(svgText)
  // 2. 创建子级 Graphics（一个红色的圆眼睛）
  const circles = drawCircle()
  for (const item of circles) {
    graphic.addChild(item)
  }

  // 初始居中
  function centerGraphic() {
    const bounds = graphic.getLocalBounds()
    // graphic.x = 0
    // graphic.y = 0
    graphic.x = -bounds.x
    graphic.y = -bounds.y
    offsetRef.value = {
      x: bounds.x,
      y: bounds.y,
    }
    console.log(`test:>graphic`, {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    })
    const scale = Math.min(
      canvas.width / bounds.width,
      canvas.height / bounds.height,
    )
    container.scale.x = scale
    container.scale.y = scale
    defaultScale = scale
    container.x = 0
    container.y = (canvas.height - container.height) / 2
  }
  centerGraphic()

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
  loadingRef.value = false
})

const scaleViewer = (deltaNum: number, mousePos?: { x: number; y: number }) => {
  const container = containerRef.value
  const canvas = canvasRef.value as HTMLCanvasElement
  console.log(`test:>mousePos`, mousePos)
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
    container.y = (canvas.height - container.height) / 2
  }
  console.log(`test:>`, mousePos, {
    containerHeight: container.height,
    containerWidth: container.width,
    scaleX: container.scale.x,
    scaleY: container.scale.y,
    x: container.x,
    y: container.y,
  })
}

const jumpTo = (pos: { x: number; y: number }) => {
  const container = containerRef.value
  const canvas = canvasRef.value as HTMLCanvasElement
  const offset = offsetRef.value
  if (!container || !canvas || !offset) {
    return
  }
  container.scale.x = 2
  container.scale.y = 2

  // container.x = -pos.x * container.scale.x + canvas.width / 2
  // container.y =
  //   -(container.height / container.scale.y - pos.y) * container.scale.y +
  //   canvas.height / 2
  container.x = -(pos.x - offset.x) * container.scale.x + canvas.width / 2
  container.y = -(pos.y - offset.y) * container.scale.y + canvas.height / 2
  console.log(
    `test:>`,
    pos,
    { canvasHeight: canvas.height, canvasWidth: canvas.width },
    {
      containerHeight: container.height,
      containerWidth: container.width,
      scaleX: container.scale.x,
      scaleY: container.scale.y,
      x: container.x,
      y: container.y,
    },
  )
}
// const jumpTo = (pos: { x: number; y: number }) => {
//   const container = containerRef.value
//   const canvas = canvasRef.value as HTMLCanvasElement
//   if (!container || !canvas) {
//     return
//   }
//   container.scale.x = 5
//   container.scale.y = 5

//   container.x = (-pos.x * container.scale.x) / 2 + canvas.width / 2
//   container.y =
//     (-(container.height - pos.y) * container.scale.y) / 2 + canvas.height / 2
//   console.log(
//     `test:>`,
//     { canvasHeight: canvas.height, canvasWidth: canvas.width },
//     { containerHeight: container.height, containerWidth: container.width },
//     pos,
//     { x: container.x, y: container.y },
//   )
// }
</script>

<style scoped lang="scss">
canvas {
  width: 100%;
  height: 100%;
}
</style>
