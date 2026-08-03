<template>
  <div class="box">
    <div class="toolBox">
      <Toolbar :triggerAction="triggerAction" />
      <el-button @click="testFn" icon="grid" text></el-button>
    </div>
    <div class="in-main">
      <SvgViewerKonva :onLoad="onLoad" ref="svgViewerRef" />
      <div class="editPanel" :key="curComRef?.id">
        <Text v-if="curComRef?.type == 'text'" :com="curComRef" />
        <Rect v-if="curComRef?.type == 'rect'" :com="curComRef" />
        <Arrow v-if="curComRef?.type == 'arrow'" :com="curComRef" />
        <ComList :list="components" :triggerItemAction="triggerItemAction" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Konva from 'konva/lib/Core'
import { ref, watch } from 'vue'
import Toolbar from './components/toolbar.vue'
import { useArrow, useRect, useText, type KonvaCom } from './konva/index.ts'
import Text from './components/editPanel/text.vue'
import Rect from './components/editPanel/rect.vue'
import Arrow from './components/editPanel/arrow.vue'
import { useElementSize } from '@vueuse/core'
import SvgViewerKonva from './svg-viewer-konva/index.vue'
import ComList from './components/comList.vue'

const stageRef = ref<Konva.Stage>()
const layerRef = ref<Konva.Layer>()
const boxRef = ref<HTMLDivElement>()
const components = ref([] as KonvaCom[])
const curComRef = ref<KonvaCom>()
const svgViewerRef = ref<InstanceType<typeof SvgViewerKonva>>()
const { width, height } = useElementSize(boxRef)

watch(
  () => [width.value, height.value],
  ([width, height]) => {
    stageRef.value?.width(width)
    stageRef.value?.height(height)
  },
)

const triggerAction = (action: string) => {
  const inner = svgViewerRef.value?.getInner()
  if (!inner) {
    return
  }
  const pos = inner.getViewpoint('inner')
  if (action == 'text') {
    const text = useText(layerRef.value!, pos)
    text.init()
    components.value.push(text)
    initComEvent(text)
    return
  }
  if (action == 'rect') {
    const rect = useRect(layerRef.value!, pos)
    rect.init()
    components.value.push(rect)
    initComEvent(rect)
    return
  }
  if (action == 'arrow') {
    const arrow = useArrow(layerRef.value!, pos)
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

const onLoad = () => {
  const inner = svgViewerRef.value?.getInner()
  if (!inner) {
    return
  }
  const { layer, stage } = inner.getStageEle()
  layerRef.value = layer
  stageRef.value = stage
}

const triggerItemAction = (action: string, com: KonvaCom) => {
  if (action === 'delete') {
    com.destroy()
    return
  }
  if (action === 'view') {
    const inner = svgViewerRef.value?.getInner()
    if (!inner) {
      return
    }
    inner.jumpToRect(com.getBounds())
    for (const item of components.value) {
      if (item.id === com.id) {
        item.onSelect()
      } else {
        item.unSelect()
      }
    }
    return
  }
}
const testFn = () => {
  curComRef.value = undefined
  const inner = svgViewerRef.value?.getInner()
  if (!inner) {
    return
  }
}

// onMounted(() => {
//   var stage = new Konva.Stage({
//     container: boxRef.value,
//     width: boxRef.value!.clientWidth,
//     height: boxRef.value!.clientWidth,
//   })

//   // add canvas element
//   var layer = new Konva.Layer()
//   stage.add(layer)
//   layerRef.value = layer
//   stageRef.value = stage
// })
</script>
<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100vh;
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .toolBox {
    padding: 12px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--el-border-color-light);
  }
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
