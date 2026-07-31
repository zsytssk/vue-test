<template>
  <div ref="boxRef"></div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import { Arrow } from 'konva/lib/shapes/Arrow'
import { Rect } from 'konva/lib/shapes/Rect'
import { Circle } from 'konva/lib/shapes/Circle'
import { onMounted, ref } from 'vue'
const boxRef = ref<HTMLDivElement>()

onMounted(() => {
  var stage = new Konva.Stage({
    container: boxRef.value,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // add canvas element
  var layer = new Konva.Layer()
  stage.add(layer)

  // 初始坐标定义（在组内的相对坐标）
  let x1 = 50,
    y1 = 50,
    x2 = 200,
    y2 = 150

  // ========== 2. 创建主 Group（包含箭头和两个控制点） ==========
  const arrowGroup = new Konva.Group({
    x: 0,
    y: 0,
    draggable: false, // 不直接拖动 Group，而是通过矩形拖动
  })

  // ========== 3. 创建箭头 ==========
  const arrow = new Arrow({
    points: [x1, y1, x2, y2],
    pointerLength: 20,
    pointerWidth: 20,
    fill: '#3b82f6',
    stroke: '#3b82f6',
    strokeWidth: 4,
    draggable: false,
    strokeScaleEnabled: false,
  })
  arrowGroup.add(arrow)

  // ========== 4. 创建起点控制柄 ==========
  const startHandle = new Circle({
    x: x1,
    y: y1,
    radius: 6,
    fill: '#ffffff',
    stroke: '#3b82f6',
    strokeWidth: 2,
    draggable: true,
    strokeScaleEnabled: false,
  })
  arrowGroup.add(startHandle)

  // ========== 5. 创建终点控制柄 ==========
  const endHandle = new Circle({
    x: x2,
    y: y2,
    radius: 6,
    fill: '#ffffff',
    stroke: '#3b82f6',
    strokeWidth: 2,
    draggable: true,
    strokeScaleEnabled: false,
  })
  arrowGroup.add(endHandle)

  layer.add(arrowGroup)

  var borderRect = new Rect({
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
    stroke: '#3b82f6',
    strokeWidth: 2,
    dash: [4, 4],
    draggable: true,
    strokeScaleEnabled: false,
  })

  layer.add(borderRect)

  // ========== 7. 更新箭头和 Group 的位置 ==========
  function updateArrowAndGroup() {
    // 更新 Group 的位置（保持在原地）
    // Group 的位置是 (0,0)，所有坐标都是相对 Group 的

    // 更新箭头
    arrow.points([x1, y1, x2, y2])

    // 更新控制点
    startHandle.x(x1)
    startHandle.y(y1)
    endHandle.x(x2)
    endHandle.y(y2)

    borderRect.x(Math.min(x1, x2)) // 左上角 x
    borderRect.y(Math.min(y1, y2)) // 左上角 y
    borderRect.width(Math.abs(x2 - x1)) // 宽度
    borderRect.height(Math.abs(y2 - y1)) // 高度
  }

  // ========== 8. 控制点拖拽事件 ==========
  startHandle.on('dragmove', () => {
    x1 = startHandle.x()
    y1 = startHandle.y()
    updateArrowAndGroup()
    layer.batchDraw()
  })

  endHandle.on('dragmove', () => {
    x2 = endHandle.x()
    y2 = endHandle.y()
    updateArrowAndGroup()
    layer.batchDraw()
  })

  // ========== 9. 矩形拖拽事件：整个箭头组跟随移动 ==========
  borderRect.on('dragmove', () => {
    // 计算位移量
    const dx = borderRect.x() - x1
    const dy = borderRect.y() - y1

    // 更新所有坐标
    x1 += dx
    y1 += dy
    x2 += dx
    y2 += dy

    // 更新箭头组内部元素（相对位置不变，但 Group 的位置变了）
    // 实际上，更好的方式是用 Group 整体移动
    // 但由于箭头和控制点是在 Group 内部，我们可以直接移动 Group
    arrowGroup.x(arrowGroup.x() + dx)
    arrowGroup.y(arrowGroup.y() + dy)

    // 但是箭头和控制点的坐标是相对于 Group 的，不需要改变
    // 只需要更新矩形
    borderRect.x(x1)
    borderRect.y(y1)

    layer.batchDraw()
  })

  layer.batchDraw()
})
</script>
<style lang="scss" scoped>
div {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border: 1px solid #000;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
