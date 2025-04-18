<template>
  <el-table :data="tableData">
    <el-table-column
      align="center"
      label="创建时间"
      prop="CreatedAt">
      <template #default="scope">
        <span>{{ formatDate(scope.row.CreatedAt) }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { TableColumnCtx } from 'element-plus'
import { ref } from 'vue'

// 定义表格行数据的类型
interface TableRow {
  CreatedAt: string
  // 可按需添加其他属性
}

// 定义表格列的类型
type TableColumn = TableColumnCtx<TableRow>

// 定义插槽作用域对象的类型
interface TableSlotScope {
  row: TableRow
  column: TableColumn
  $index: number
}

// 模拟表格数据
const tableData = ref<TableRow[]>([
  { CreatedAt: '2024-01-01' },
  { CreatedAt: '2024-01-02' },
])

// 格式化日期的函数
const formatDate = (date: string) => {
  return date
}
</script>
