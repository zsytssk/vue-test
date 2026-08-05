<template>
  <node name="Arrow" :com="com" :triggerItemAction="triggerItemAction">
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        颜色
      </div>
      <el-color-picker v-model="color" />
    </div>
  </node>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKonvaValue } from '../../hooks/useKonvaValue'
import type { KonvaCom } from '../../konva'
import Node from './node.vue'
const props = defineProps<{
  com?: KonvaCom
  readOnly?: boolean
  triggerItemAction: (action: string, item: KonvaCom) => void
}>()

const model = computed(() => props.com?.getModel())
const color = useKonvaValue(model, 'fill stroke')
</script>
<style lang="scss" scoped></style>
