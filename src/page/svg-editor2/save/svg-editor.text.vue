<template>
  <div ref="boxRef"></div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import { Text } from 'konva/lib/shapes/Text'
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

  // 创建文字
  const text = new Text({
    x: 100,
    y: 100,
    text: '你好，这是批注文字',
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    fill: '#333333',
    draggable: true, // 允许拖动
  })

  // 添加到图层
  layer.add(text)

  const transformer = new Transformer({
    nodes: [text],
    enabledAnchors: [],
    rotateEnabled: false,
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
