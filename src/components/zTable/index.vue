<template>
  <div :class="[$style.zTable, boxClass]">
    <el-table
      :data="tableData"
      tooltip-effect="dark"
      v-bind="tableProps">
      <slot></slot>
    </el-table>
    <div class="pagination-box">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="pageInfo.page"
        :page-size="pageInfo.pageSize"
        :page-sizes="[10, 30, 50, 100]"
        :total="pageInfo.total"
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
  tableProps?: TableProps<any>
  paginationProps?: PaginationProps
}>()

type PageInfo = {
  page: number
  pageSize: number
  total?: number
}

const tableData = ref<any[]>([])

// 查询
const getTableData = async () => {
  //   if (!itemData.value?.ID) {
  //     tableData.value = []
  //     pageInfo.value.total = 0
  //     return
  //   }
  //   const table = await getMnGroupListByTeamId({
  //     teamId: itemData.value?.ID,
  //     page: pageInfo.value.page,
  //     pageSize: pageInfo.value.pageSize,
  //   })
  //   if (table.code === 0) {
  //     tableData.value = table.data.list
  //     pageInfo.value = {
  //       total: table.data.total,
  //       page: table.data.page,
  //       pageSize: table.data.pageSize,
  //     }
  //   }
}

const pageInfo = ref<PageInfo>({ page: 1, pageSize: 10, total: 0 })
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
