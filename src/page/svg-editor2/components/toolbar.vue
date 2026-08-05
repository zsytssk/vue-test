<template>
  <div class="toolBar">
    <el-button text @click="triggerAction('text')"><TextIcon /></el-button>
    <el-button text @click="triggerAction('rect')"><RectIcon /></el-button>
    <el-button text @click="triggerAction('arrow')"><ArrowIcon /></el-button>
    <el-button text @click="triggerAction('folder')">
      <el-icon size="40" color="black"><Folder /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ArrowIcon, RectIcon, TextIcon } from './tools'

defineProps<{ triggerAction: (action: string) => void }>()
</script>
<style lang="scss" scoped>
.toolBar {
  display: flex;
  align-items: center;
  .el-button {
    padding: 0;
  }
  svg {
    width: 30px;
    height: 30px;
  }
}
</style>
