<template>
  <div :class="[$style.zTable, boxClass]">
    <el-table
      v-bind="tableProps"
      :data="tableData"
      tooltip-effect="dark">
      <slot></slot>
    </el-table>
    <div class="pagination-box">
      <el-pagination
        class="el-pagination-test"
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="pageInfo.page"
        :page-size="pageInfo.pageSize"
        :page-sizes="[10, 30, 50, 100]"
        :total="pageInfo.total"
        v-bind="paginationProps"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaginationProps, TableProps } from 'element-plus'
import { ref } from 'vue'

defineOptions({
  name: 'ZTable',
})

const props = defineProps<{
  boxClass?: string
  tableProps?: Partial<TableProps<any>>
  paginationProps?: Partial<PaginationProps>
  requestFn: (PageInfo: PageInfo) => Promise<
    | {
        data: any[]
        page: number
        pageSize: number
        total: number
      }
    | undefined
  >
}>()

export type PageInfo = {
  page: number
  pageSize: number
  total: number
}

const pageInfo = ref<PageInfo>({ page: 1, pageSize: 10, total: 0 })
const tableData = ref<any[]>([])
// 查询
async function getTableData() {
  const res = await props.requestFn(pageInfo.value)

  if (!res) {
    tableData.value = []
    pageInfo.value.total = 0
    return
  }
  tableData.value = res.data
  pageInfo.value = {
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
  }
}

// 查询
async function reset() {
  pageInfo.value = {
    total: 0,
    page: 1,
    pageSize: 10,
  }
  getTableData()
}

// 分页
const handleSizeChange = (val: number) => {
  pageInfo.value.pageSize = val
  getTableData()
}

// 修改页面容量
const handleCurrentChange = (val: number) => {
  pageInfo.value.page = val
  getTableData()
}

defineExpose({
  run: getTableData,
  reload: getTableData,
  reset,
  pageInfo: pageInfo,
})
</script>

<style lang="scss" module>
.zTable {
  :global {
    .pagination-box {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
  }
}
</style>
