<template>
  <div class="panelBox">
    <div class="panelTitle">
      <span>List</span>
    </div>
    <div ref="panelBody" :class="{ panelBody: true }">
      <div class="in-list">
        <div
          class="panelRow"
          v-for="(item, index) of folderList"
          :key="item.id"
        >
          <div>{{ (item as CompFolder).name || item.type }}</div>
          <div class="btn-list">
            <el-button
              text
              size="small"
              icon="edit"
              v-if="item.type == 'folder'"
              @click="triggerItemAction('edit', item)"
            ></el-button>
            <el-button
              text
              size="small"
              icon="aim"
              @click="triggerItemAction('view', item)"
            ></el-button>
            <el-button
              text
              size="small"
              icon="delete"
              @click="triggerItemAction('delete', item)"
            ></el-button>
          </div>
        </div>
        <div
          class="panelRow"
          v-for="(item, index) of noFolderList"
          :key="item.id"
        >
          <div>{{ item.type }}</div>
          <div class="btn-list">
            <el-button
              text
              size="small"
              icon="arrow-up"
              :disabled="index == 0"
              @click="triggerItemAction('up', item)"
            ></el-button>
            <el-button
              text
              size="small"
              icon="arrow-down"
              :disabled="index == list.length - 1"
              @click="triggerItemAction('down', item)"
            ></el-button>
            <el-button
              text
              size="small"
              icon="DArrowRight"
              @click="triggerItemAction('moveToFolder', item)"
            ></el-button>
            <el-button
              text
              size="small"
              icon="aim"
              @click="triggerItemAction('view', item)"
            ></el-button>
            <el-button
              text
              size="small"
              icon="delete"
              @click="triggerItemAction('delete', item)"
            ></el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { CompFolder, CompItem } from '../svg-editor.vue'

const props = defineProps<{
  list: CompItem[]
  triggerItemAction: (action: string, item: CompItem) => void
}>()

const folderList = computed(() => {
  return props.list.filter((item) => item.type === 'folder')
})
const noFolderList = computed(() => {
  return props.list.filter((item) => item.type !== 'folder')
})
</script>

<style lang="scss" scoped>
.in-list {
  margin: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.panelRow {
  padding: 16px;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--el-border-color);
  border-radius: 3px;
}
.btn-list {
  .el-button {
    margin-left: 2px;
    padding: 0 8px;
  }
}
</style>
