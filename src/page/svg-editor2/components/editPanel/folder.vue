<template>
  <Node name="Folder" :triggerItemAction="triggerItemAction">
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        名字
      </div>
      <el-input class="mt-2" size="small" v-model="name" :disabled="readOnly" />
    </div>
    <div class="panelRow">
      <ComList
        v-if="com?.children"
        :list="com?.children"
        :triggerItemAction="localTriggerItemAction"
      />
    </div>
  </Node>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Node from './node.vue'
import type { CompFolder, CompItem } from '../../svg-editor.vue'
import ComList from '../comList.vue'
import type { KonvaCom } from '../../konva/index.ts'
const props = defineProps<{
  com?: CompFolder
  readOnly?: boolean
  triggerItemAction: (
    action: string,
    item: CompItem,
    parent?: CompFolder,
  ) => void
}>()

const name = computed({
  get: () => props.com?.name,
  set: (val) => {
    if (!props.com) {
      return
    }
    props.com.name = val || ''
  },
})
const localTriggerItemAction = (action: string, com: CompItem) => {
  const selfCom = com as KonvaCom

  if (action === 'up' || action === 'down') {
    const parent = props.com!
    const curIndex = parent.children.indexOf(selfCom)
    const nextIndex = action === 'down' ? curIndex + 1 : curIndex - 1
    const nextCom = parent.children[nextIndex]
    parent.children[nextIndex] = selfCom
    parent.children[curIndex] = nextCom
    const curZinDex = selfCom.getIndex()
    selfCom.setIndex((nextCom as KonvaCom)?.getIndex())
    ;(nextCom as KonvaCom).setIndex(curZinDex)
    return
  }

  props.triggerItemAction(action, com, props.com)
}
</script>
<style lang="scss" scoped></style>
