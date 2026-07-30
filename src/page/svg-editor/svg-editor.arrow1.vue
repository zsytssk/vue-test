<template>
  <div ref="boxRef"></div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import { Arrow } from 'konva/lib/shapes/Arrow'
import { Transformer } from 'konva/lib/shapes/Transformer'
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

  const arrow = new Arrow({
    // 核心：起点 (x1, y1) 到终点 (x2, y2) 的坐标
    points: [50, 50, 200, 50],
    // 箭头属性
    pointerLength: 20, // 箭头长度
    pointerWidth: 20, // 箭头宽度
    // 样式
    fill: '#3b82f6', // 箭头头部的填充色
    stroke: '#3b82f6', // 箭杆和箭头边框颜色
    strokeWidth: 4, // 箭杆粗细
    draggable: true,
    strokeScaleEnabled: false,
  })

  layer.add(arrow)

  const transformer = new Transformer({
    nodes: [arrow],
    boundBoxFunc: (oldBox, newBox) => {
      // 限制宽高最小为 30 像素
      newBox.width = Math.max(30, newBox.width)
      newBox.height = Math.max(30, newBox.height)
      return newBox
    },
  })

  // 3. 将矩形和 Transformer 都添加到图层
  layer.add(transformer)
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
