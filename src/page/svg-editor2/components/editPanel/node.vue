<template>
  <div class="panelBox">
    <div class="panelTitle">
      <span>{{ name }}</span>
      <!-- <el-button icon="delete" text size="small" @click="delModel"></el-button> -->
    </div>
    <div ref="panelBody" :class="{ panelBody: true }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KonvaCom } from '../../konva'
const props = defineProps<{
  name: string
  com?: KonvaCom
  readOnly?: boolean
}>()

const delModel = () => {
  props.com?.destroy()
}
</script>
<style lang="scss" scoped></style>
