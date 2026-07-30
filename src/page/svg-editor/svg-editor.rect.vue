<template>
  <div ref="boxRef"></div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import { Rect } from 'konva/lib/shapes/Rect'
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

  // create shape
  var rect = new Rect({
    x: 50,
    y: 50,
    width: 100,
    height: 50,
    stroke: 'red',
    strokeWidth: 4,
    draggable: true,
    strokeScaleEnabled: false,
  })
  layer.add(rect)

  // add cursor styling
  rect.on('mouseover', function () {
    document.body.style.cursor = 'pointer'
  })
  rect.on('mouseout', function () {
    document.body.style.cursor = 'default'
  })
  const transformer = new Transformer({
    nodes: [rect],
    boundBoxFunc: (oldBox, newBox) => {
      console.log(`test:>`, newBox)
      // 限制宽高最小为 30 像素
      newBox.width = Math.max(30, newBox.width)
      newBox.height = Math.max(30, newBox.height)
      return newBox
    },
  })

  // 3. 将矩形和 Transformer 都添加到图层
  layer.add(rect)
  layer.add(transformer)

  // 4. 关键一步：将 Transformer 绑定到矩形上
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
