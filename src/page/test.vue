<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ZTable, { type PageInfo } from '../components/zTable/index.vue'

const tableRef = ref<InstanceType<typeof ZTable>>()

const requestFn = async (pageInfo: PageInfo) => {
  console.log(`test:>requestFn`, pageInfo)
  return { data: [{ code: 1, name: '111', leaderName: 'sdfsdf' }], ...pageInfo }
}

onMounted(() => {
  tableRef.value?.run()
})
</script>

<template>
  <div :class="$style.tableBox">
    <ZTable
      :request-fn="requestFn"
      ref="tableRef">
      <el-table-column
        align="center"
        label="小组编号"
        prop="code" />
      <el-table-column
        align="center"
        label="小组名称"
        prop="name" />
      <el-table-column
        align="center"
        label="小组组长"
        prop="leaderName" />
      <el-table-column
        align="center"
        label="小组人数"
        prop="mnCount" />
      <el-table-column
        align="center"
        label="创建时间"
        prop="CreatedAt" />
    </ZTable>
  </div>
</template>

<style lang="scss" module>
.tableBox {
  :global {
    margin: 20px 20px;
    background-color: #fff;
  }
}
</style>
