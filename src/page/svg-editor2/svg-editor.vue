<template>
  <div class="box">
    <div class="toolBox">
      <Toolbar :triggerAction="triggerAction" />
      <div class="toolRight">
        <el-button @click="centerView" text>
          <el-icon size="20"><FullScreen /></el-icon>
        </el-button>
        <el-button @click="showList" text>
          <el-icon size="20"><Grid /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="in-main">
      <SvgViewerKonva :onLoad="onLoad" ref="svgViewerRef" />
      <div class="editPanel" :key="curComRef?.id">
        <Text
          v-if="curComRef?.type == 'text'"
          :com="curComRef"
          :triggerItemAction="triggerItemAction"
        />
        <Rect
          v-if="curComRef?.type == 'rect'"
          :com="curComRef"
          :triggerItemAction="triggerItemAction"
        />
        <Arrow
          v-if="curComRef?.type == 'arrow'"
          :com="curComRef"
          :triggerItemAction="triggerItemAction"
        />
        <Folder
          v-if="curComRef?.type == 'folder'"
          :com="curComRef"
          :triggerItemAction="triggerItemAction"
        />
        <ComList :list="components" :triggerItemAction="triggerItemAction" />
      </div>
    </div>
    <MoveToFolderDialog ref="moveToFolderRef" />
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
import { generateId } from './konva/base.ts'
import Folder from './components/editPanel/folder.vue'
import MoveToFolderDialog from './components/moveToFolderDialog.vue'

export type CompFolder = {
  type: 'folder'
  id: string
  name: string
  children: KonvaCom[]
}
export type CompItem = CompFolder | KonvaCom
const stageRef = ref<Konva.Stage>()
const moveToFolderRef = ref<InstanceType<typeof MoveToFolderDialog>>()
const layerRef = ref<Konva.Layer>()
const boxRef = ref<HTMLDivElement>()
const components = ref([] as CompItem[])
const curComRef = ref<CompItem>()
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
  if (action === 'folder') {
    const folder = {
      type: 'folder',
      id: generateId(),
      name: 'folder',
      children: [],
    } as CompFolder
    components.value.unshift(folder)
    return
  }
  const pos = inner.getViewpoint('inner')
  if (action == 'text') {
    const text = useText(layerRef.value!, pos)
    text.init()
    components.value.unshift(text)
    initComEvent(text)
    return
  }
  if (action == 'rect') {
    const rect = useRect(layerRef.value!, pos)
    rect.init()
    components.value.unshift(rect)
    initComEvent(rect)
    return
  }
  if (action == 'arrow') {
    const arrow = useArrow(layerRef.value!, pos)
    arrow.init()
    components.value.unshift(arrow)
    initComEvent(arrow)
    return
  }
}

const initComEvent = (com: KonvaCom) => {
  com.on('focus', () => {
    curComRef.value = com
    for (const item of components.value) {
      if (item.type === 'folder') {
        continue
      }
      if (item.id === com.id) {
        ;(item as KonvaCom).onSelect()
      } else {
        ;(item as KonvaCom).unSelect()
      }
    }
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

const triggerItemAction = (
  action: string,
  com: CompItem,
  parent?: CompFolder,
) => {
  if (com.type === 'folder') {
    if (action === 'edit') {
      curComRef.value = com
      return
    }
    if (action === 'delete') {
      for (const item of com.children) {
        item.destroy()
      }
      com.children = []
      components.value = components.value.filter((item) => item.id !== com.id)
      return
    }
    return
  }
  if (action === 'moveToFolder') {
    moveToFolderRef.value
      ?.openDialog(components.value.filter((item) => item.type === 'folder'))
      .then((selectId) => {
        if (!selectId) {
          return
        }
        const selectGroup = components.value.find(
          (item) => item.id === selectId,
        )
        ;(selectGroup as CompFolder)?.children.unshift(com)
        components.value = components.value.filter((item) => item.id !== com.id)
      })
    return
  }

  if (action === 'delete') {
    com.destroy()
    if (parent) {
      parent.children = parent.children.filter((item) => item.id !== com.id)
    }
    components.value = components.value.filter((item) => item.id !== com.id)
    return
  }
  if (action === 'view') {
    const inner = svgViewerRef.value?.getInner()
    if (!inner) {
      return
    }
    inner.jumpToRect(com.getBounds())
    for (const item of components.value) {
      if (item.type === 'folder') {
        continue
      }
      if (item.id === com.id) {
        ;(item as KonvaCom).onSelect()
      } else {
        ;(item as KonvaCom).unSelect()
      }
    }
    return
  }
  if (action === 'up' || action === 'down') {
    const curIndex = components.value.indexOf(com)
    const nextIndex = action === 'down' ? curIndex + 1 : curIndex - 1
    const nextCom = components.value[nextIndex]
    components.value[nextIndex] = com
    components.value[curIndex] = nextCom
    if (nextCom.type == 'folder') {
      return
    }
    const curZinDex = com.getIndex()
    com.setIndex((nextCom as KonvaCom)?.getIndex())
    ;(nextCom as KonvaCom).setIndex(curZinDex)
    return
  }
}
const showList = () => {
  curComRef.value = undefined
  const inner = svgViewerRef.value?.getInner()
  if (!inner) {
    return
  }
}

const centerView = () => {
  const inner = svgViewerRef.value?.getInner()
  if (!inner) {
    return
  }
  inner.centerGraphic()
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
    .toolRight {
      display: flex;
      align-items: center;
      gap: 2px;
      .el-button {
        margin-left: 0;
      }
    }
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
