<template>
  <div class="box">
    <Toolbar :triggerAction="triggerAction" />
    <div class="in-main">
      <div ref="boxRef" class="canvasBox"></div>
      <div class="editPanel" :key="curComRef?.id">
        <Text v-if="curComRef?.type == 'text'" :com="curComRef" />
        <Rect v-if="curComRef?.type == 'rect'" :com="curComRef" />
        <Arrow v-if="curComRef?.type == 'arrow'" :com="curComRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import { onMounted, ref } from 'vue'
import Toolbar from './components/toolbar.vue'
import { useArrow, useRect, useText, type KonvaCom } from './konva/index.ts'
import Text from './components/editPanel/text.vue'
import Rect from './components/editPanel/rect.vue'
import Arrow from './components/editPanel/arrow.vue'

const layerRef = ref<Konva.Layer>()
const boxRef = ref<HTMLDivElement>()
const components = ref([] as KonvaCom[])
const curComRef = ref<KonvaCom>()
const triggerAction = (action: string) => {
  if (action == 'text') {
    const text = useText(layerRef.value!)
    text.init()
    components.value.push(text)
    initComEvent(text)
    return
  }
  if (action == 'rect') {
    const rect = useRect(layerRef.value!)
    rect.init()
    components.value.push(rect)
    initComEvent(rect)
    return
  }
  if (action == 'arrow') {
    const arrow = useArrow(layerRef.value!)
    arrow.init()
    components.value.push(arrow)
    initComEvent(arrow)
    return
  }
}

const initComEvent = (com: KonvaCom) => {
  com.on('focus', () => {
    curComRef.value = com
    for (const item of components.value) {
      if (item.id === com.id) {
        item.onSelect()
      } else {
        item.unSelect()
      }
    }
  })
  com.on('destroy', () => {
    if (curComRef.value?.id === com.id) {
      curComRef.value = undefined
    }
    components.value = components.value.filter((item) => item.id !== com.id)
  })
}

onMounted(() => {
  var stage = new Konva.Stage({
    container: boxRef.value,
    width: boxRef.value!.clientWidth,
    height: boxRef.value!.clientWidth,
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
  height: 100vh;
  background-color: #fff;
  border: 1px solid #000;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .in-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
    .canvasBox {
      flex: 1;
      overflow: hidden;
    }
    .editPanel {
      height: 100%;
      background: #f0f2f5;
      flex: 0 0 20%;
      min-width: 320px;
      box-sizing: border-box;
      border-left: 1px solid #e9e9e9;
      :deep {
        .panelBox {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          color: #333;
        }
        .panelTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          height: 32px;
          padding-left: 12px;
          color: #000;
          line-height: 28px;
          background: #ebeef2;
          border-bottom: 1px solid #dce3e8;
        }

        .panelBody {
          flex: 1;
          overflow: auto;
          padding-right: 4px;
          padding-bottom: 20px;
          .panelRow {
            text-align: left;
            display: inline-block;
            font-size: 12px;
            width: 100%;
            padding: 5px 12px;
            box-sizing: border-box;
          }
        }
      }
    }
  }
}
</style>
