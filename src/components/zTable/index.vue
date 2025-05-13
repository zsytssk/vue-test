<template>
  <div :class="[$style.zTable, boxClass]">
    <el-table
      v-loading="loading"
      show-overflow-tooltip
      tooltip-effect="dark"
      :row-key="rowKey || 'ID'"
      v-bind="tableProps"
      :data="tableData"
      @selection-change="
        (selection: any[]) => emit('selection-change', selection)
      ">
      <template #empty>
        <div class="custom-empty">
          <el-empty
            description="暂无数据"
            :image-size="150" />
        </div>
      </template>
      <slot></slot>
    </el-table>

    <div
      v-if="showPagination"
      class="pagination-box">
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
import { computed, ref } from 'vue'

defineOptions({
  name: 'ZTable',
})

const emit = defineEmits<{
  (e: 'selection-change', selection: any[]): void
}>()

const props = defineProps<{
  /** 显示分页total>pageSize */
  showPaginationOnlyNeed?: boolean
  rowKey?: string
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
const loading = ref(false)

const showPagination = computed(() => {
  if (props.showPaginationOnlyNeed === false) {
    return true
  }
  if (pageInfo.value.total > pageInfo.value.pageSize) {
    return true
  }
  return false
})

// 查询
async function getTableData() {
  loading.value = true
  try {
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
  } finally {
    loading.value = false
  }
}

/** 重置分页信息并请求数据 */
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

/** 通过pageInfo获取自增的序号 */
const getNoByPageInfo = (originIndex: number) => {
  return (pageInfo.value.page - 1) * pageInfo.value.pageSize + originIndex
}

/** 把当前页全部删除了，需要切换当前页面  */
const onDelete = (itemNum: number) => {
  if (tableData.value.length === itemNum && pageInfo.value.page > 1) {
    pageInfo.value.page--
  }
}

defineExpose({
  run: getTableData,
  reload: getTableData,
  reset,
  tableData,
  pageInfo,
  onDelete,
  getNoByPageInfo,
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
