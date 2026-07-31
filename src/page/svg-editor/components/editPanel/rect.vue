<template>
  <Node name="Rect" :com="com">
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        颜色
      </div>
      <el-color-picker v-model="color" />
    </div>
    <div class="panelRow">
      <div>
        <span style="color: red">*</span>
        边框宽度
      </div>
      <el-input-number size="small" v-model="strokeWidth" />
    </div>
  </Node>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKonvaValue } from '../../hooks/useKonvaValue'
import type { KonvaCom } from '../../konva'
import Node from './node.vue'
const props = defineProps<{ com?: KonvaCom; readOnly?: boolean }>()

const model = computed(() => props.com?.getModel())
const color = useKonvaValue(model, 'stroke')
const strokeWidth = useKonvaValue(model, 'strokeWidth')
</script>
<style lang="scss" scoped></style>
