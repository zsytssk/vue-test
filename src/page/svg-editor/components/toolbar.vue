<template>
  <div class="toolBar">
    <el-button text @click="triggerAction('text')"><TextIcon /></el-button>
    <el-button text @click="triggerAction('rect')"><RectIcon /></el-button>
    <el-button text @click="triggerAction('arrow')"><ArrowIcon /></el-button>
  </div>
</template>

<script setup lang="ts">
import { ArrowIcon, RectIcon, TextIcon } from './tools'

defineProps<{ triggerAction: (action: string) => void }>()
</script>
<style lang="scss" scoped>
.toolBar {
  padding: 12px 8px;
  display: flex;
  align-items: center;
  border: 1px solid var(--el-border-color-light);
  .el-button {
    padding: 0;
  }
  svg {
    width: 30px;
    height: 30px;
  }
}
</style>
