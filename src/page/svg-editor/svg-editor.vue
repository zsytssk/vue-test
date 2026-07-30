<template>
  <div class="box">
    <Toolbar :triggerAction="triggerAction" />
    <div ref="boxRef"></div>
  </div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import { onMounted, ref } from 'vue'
import Toolbar from './components/toolbar.vue'
import { useArrow, useRect, useText, type KonvaCom } from './konva/index.ts'

const layerRef = ref<Konva.Layer>()
const boxRef = ref<HTMLDivElement>()
const components = [] as KonvaCom[]
const triggerAction = (action: string) => {
  if (action == 'text') {
    const text = useText(layerRef.value!)
    text.init()
    components.push(text)
    initComEvent(text)
    return
  }
  if (action == 'rect') {
    const rect = useRect(layerRef.value!)
    rect.init()
    components.push(rect)
    initComEvent(rect)
    return
  }
  if (action == 'arrow') {
    const arrow = useArrow(layerRef.value!)
    arrow.init()
    components.push(arrow)
    initComEvent(arrow)
    return
  }
}

const initComEvent = (com: KonvaCom) => {
  com.on('focus', () => {
    for (const item of components) {
      if (item === com) {
        item.onSelect()
      } else {
        item.unSelect()
      }
    }
  })
}

onMounted(() => {
  var stage = new Konva.Stage({
    container: boxRef.value,
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // add canvas element
  var layer = new Konva.Layer()
  stage.add(layer)
  layerRef.value = layer
})
</script>
<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border: 1px solid #000;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
